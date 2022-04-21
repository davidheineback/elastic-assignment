// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import fs from 'fs-extra'
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { JSDOM } from 'jsdom'
import moment from 'moment'
import { Root, Song, Codes } from '../../types/types'
import elasticClient from '../../components/ElasticClient'

const countries = {
  global: 'Global',
  se: 'Sverige',
  us: 'United States of America',
  gb: 'United Kingdom',
  br: 'Brazil',
  au: 'Australia',
}

async function getSpotifyData(from: string, to: string) {
  let date = moment(from).format('YYYY-MM-DD')
  // const file = fs.readJSONSync('./data.json')
  // const arr = JSON.parse(file)
  const list: Root[] = []

  for (let i = 0; moment(date).isAfter(to); i++) {
    // delay each start with 2000 to prevent hitting rate limit
    await new Promise((resolve) => {
      setTimeout(resolve, 2000)
    })

    if (i > 0) {
      date = moment(date).subtract(1, 'days').format('YYYY-MM-DD')
    }

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
      // fs.writeJSONSync('./data.json', JSON.stringify(list))
    }
  }

  return list
}

async function addToElastic(from: string, to: string) {
  const data = await getSpotifyData(from, to)

  const operations = data.flatMap((doc: Root, count: number) => [
    {
      index: {
        _index: 'spotifydata',
        _id: `${doc.date}-index-${count}`,
      },
    },
    doc,
  ])

  const client = elasticClient.getClient()

  try {
    client.indices.create({
      index: 'spotifydata',
    })
  } catch (error) {
    console.log(error)
  }

  const bulk = await client.bulk({ refresh: true, operations })

  const count = await client.count({ index: 'spotifydata' })

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
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
  if (
    req.headers.authorization?.split(' ')[1] ===
    Buffer.from(
      `${process.env.ELASTIC_USERNAME}:${process.env.ELASTIC_PASSWORD}`
    ).toString('base64')
  ) {
    const { from, to } = req.query

    if (from && to) {
      const message = await addToElastic(from as string, to as string)
      res.status(200).json({ message })
    } else {
      res.status(400).json({ message: 'Bad request' })
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
}
