// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Client } from '@elastic/elasticsearch';
import fs from 'fs-extra';
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios'
import { JSDOM } from 'jsdom'


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



async function getSpotifyData() {
  const response = await axios.get('https://spotifycharts.com/regional/global/daily/latest')
  // const list:any = []
  const text = await response.data
  const dom = new JSDOM(text)
  const t: any = dom.window.document.querySelector('.chart-table > tbody')
  Array.from(t.rows).forEach((element: any) => {
    console.log('==========')
    console.log(element.querySelector('.chart-table-position')?.textContent)
    console.log(element.querySelector('.chart-table-track > strong')?.textContent)
    console.log(element.querySelector('.chart-table-track > span')?.textContent.substr(3))
    console.log(element.querySelector('.chart-table-streams')?.textContent)
    console.log('==========')
  })

  return 'hej'
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getSpotifyData()
  res.status(200).json({ data })
}
