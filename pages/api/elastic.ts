// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Client } from '@elastic/elasticsearch'
import fs from 'fs-extra'
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { JSDOM } from 'jsdom'
import moment from 'moment'
import { Root, Song, Codes } from '../../types/types'

const countries = {
  global: 'Global',
  se: 'Sverige',
  us: 'United States of America',
  gb: 'United Kingdom',
  br: 'Brazil',
  au: 'Australia',
}

async function getSpotifyData() {
  let date = moment('2022-04-07').format('YYYY-MM-DD')
  const list: Root[] = []

  for (let i = 0; moment(date).isAfter('2022-04-02'); i++) {
    // delay each start with 2000
    await new Promise((resolve) => {
      setTimeout(resolve, 2000)
    })

    date = moment(date).subtract(1, 'days').format('YYYY-MM-DD')

    console.log('-----------------------')
    console.log(`Fetching Date: ${date}`)
    for (const code of Object.keys(countries)) {
      console.log('....')
      console.log(`Fetching Country: ${code}`)
      let response
      try {
        response = await axios.get(
          `https://spotifycharts.com/regional/${code}/daily/${date}`
        )
      } catch (error) {
        console.log(`An error occurred at date: ${date}`)
        date = moment('2017-12-31').format('YYYY-MM-DD')
        break
      }

      const toplist: Song[] = []

      const text = await response?.data
      const dom = new JSDOM(text)
      const table: any = dom.window.document.querySelector(
        '.chart-table > tbody'
      )
      Array.from(table.rows).forEach((element: any) => {
        const song: Song = {
          artist: element
            .querySelector('.chart-table-track > span')
            ?.textContent.substr(3),
          song: element.querySelector('.chart-table-track > strong')
            ?.textContent,
          position: element.querySelector('.chart-table-position')?.textContent,
          streams: Number(
            element
              .querySelector('.chart-table-streams')
              ?.textContent.replaceAll(',', '')
          ),
        }
        toplist.push(song)
      })
      const obj: Root = {
        date,
        country: countries[code as keyof typeof countries],
        code: Codes[code as keyof typeof Codes],
        toplist,
      }

      list.push(obj)
    }
  }

  return list
}

export const client = new Client({
  node: 'https://localhost:9200',
  auth: {
    username: process.env.ELASTIC_USERNAME!,
    password: process.env.ELASTIC_PASSWORD!,
  },
  tls: {
    ca: fs.readFileSync(process.env.CERT_PATH!),
    rejectUnauthorized: false,
  },
})

async function addToElastic() {
  const data = await getSpotifyData()

  const operations = data.flatMap((doc: Root, count: number) => [
    {
      index: {
        _index: 'scrapedspotifydata',
        _id: `${doc.date}-index-${count}`,
      },
    },
    doc,
  ])

  try {
    client.indices.create({
      index: 'scrapedspotifydata',
    })
  } catch (error) {
    console.log(error)
  }

  const bulk = await client.bulk({ refresh: true, operations })

  const count = await client.count({ index: 'scrapedspotifydata' })

  if (bulk.errors) {
    return 'error'
  } else {
    return 'All done!'
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const message = await addToElastic()
  res.status(200).json({ message })
}
