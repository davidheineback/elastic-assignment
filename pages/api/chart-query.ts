import { Client } from "@elastic/elasticsearch"
import fs from 'fs-extra'
import { NextApiRequest, NextApiResponse } from "next"

export const client = new Client({
  node: 'https://localhost:9200',
  auth: {
    username: process.env.ELASTIC_USERNAME!,
    password: process.env.ELASTIC_PASSWORD!
  },
  tls: {
    ca: fs.readFileSync(process.env.CERT_PATH!),
    rejectUnauthorized: false
  }
})


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  res.status(200).json({ data: 'hej' })
}