// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Client } from '@elastic/elasticsearch';
import fs from 'fs-extra';
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios'
import { JSDOM } from 'jsdom'
import moment from 'moment'
import { Root, Song, Country, Codes } from '../../types/types';


// export const client = new Client({
//   node: 'https://localhost:9200',
//   auth: {
//     username: process.env.ELASTIC_USERNAME!,
//     password: process.env.ELASTIC_PASSWORD!
//   },
//   tls: {
//     ca: fs.readFileSync(process.env.CERT_PATH!),
//     rejectUnauthorized: false
//   }
// })

const countries = {
  global: 'Global',
  se: 'Sverige',
  us: 'United States of America',
  gb: 'United Kingdom',
  br: 'Brazil',
  au: 'Australia'
}



async function getSpotifyData() {
  let date = moment('2022-04-06').format('YYYY-MM-DD')
  const list: Root[] = []

  for(let i = 0; moment(date).isAfter('2022-04-03'); i++ ) {
    
    date = moment(date).subtract(i, 'days').format('YYYY-MM-DD')
    const obj: Root = {
      id: i+1,
      date,
      countries: []
    }

    Object.keys(countries).forEach(async (code) => {
      // console.log(countries[code as keyof typeof countries])
      const response = await axios.get(`https://spotifycharts.com/regional/${code}/daily/${date}`)

      const toplist: Song[] = []

      const text = await response.data
      const dom = new JSDOM(text)
      const table: any = dom.window.document.querySelector('.chart-table > tbody')
      Array.from(table.rows).forEach((element: any) => {
        const song: Song = {
          artist: element.querySelector('.chart-table-track > span')?.textContent.substr(3),
          song: element.querySelector('.chart-table-track > strong')?.textContent,
          position: element.querySelector('.chart-table-position')?.textContent,
          streams: element.querySelector('.chart-table-streams')?.textContent
        }
        toplist.push(song)
      })
      const country: Country = {
        country: countries[code as keyof typeof countries],
        code: Codes[code as keyof typeof Codes],
        toplist
      }

      obj.countries.push(country)

    })
    
  }
  


  return 'hej'
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getSpotifyData()
  res.status(200).json({ data })
}
