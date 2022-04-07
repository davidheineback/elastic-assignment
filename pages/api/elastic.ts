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
  const res = await axios.get('https://spotifycharts.com/regional/global/daily/latest')
  const dom = new JSDOM(res.data)

  const table = dom.window.document.querySelectorAll('tr')

  return res.data
}



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getSpotifyData()
  res.status(200).json({ data })
}
