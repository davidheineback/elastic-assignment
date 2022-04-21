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

/**
 *
 * Method to scrape historic data from spotifycharts.com/regional
 */
async function getSpotifyData(from: string, to: string) {
  let date = moment(from).format('YYYY-MM-DD')
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
    // Get the data from each country code and date
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
        // sets date a prev date to break loop.
        date = moment('2017-12-31').format('YYYY-MM-DD')
        break
      }

      const toplist: Song[] = []

      const text = await response?.data
      // create a JSDOM
      const dom = new JSDOM(text)
      // Select the table
      const table: any = dom.window.document.querySelector(
        '.chart-table > tbody'
      )
      Array.from(table.rows).forEach((element: any) => {
        // from the rows create a object of type Song.
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
        // push the created song to the toplist
        toplist.push(song)
      })
      // Create a Root object and push to the list
      const obj: Root = {
        date,
        country: countries[code as keyof typeof countries],
        code: Codes[code as keyof typeof Codes],
        toplist,
      }
      list.push(obj)
    }
  }
  // returns a array of Root objects.
  return list
}

async function addToElastic(from: string, to: string) {
  const data = await getSpotifyData(from, to)

  // sets the index and id for each document i the data returned from getSpotifyData.
  const operations = data.flatMap((doc: Root, count: number) => [
    {
      index: {
        _index: 'spotifydata',
        _id: `${doc.date}-index-${count}`,
      },
    },
    doc,
  ])

  // get the elastic client.
  const client = elasticClient.getClient()

  // Create the index spotifydata if it doesn't already excists.
  try {
    client.indices.create({
      index: 'spotifydata',
    })
  } catch (error) {
    console.log(error)
  }

  // bulk write to the elastic client.
  const bulk = await client.bulk({ refresh: true, operations })

  // const count = await client.count({ index: 'spotifydata' })

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
  // Only allow GET requests.
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
  if (
    // Auth user with username and password.
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
