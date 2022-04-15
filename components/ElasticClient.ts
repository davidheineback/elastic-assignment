import { Client } from '@elastic/elasticsearch'
import fs from 'fs-extra'

type TLS =
  | {
      ca: Buffer
      rejectUnauthorized: boolean
    }
  | undefined

type SearchOptions = {
  index: string
  body: any
}

class ElasticClient {
  private client: Client
  private tls: TLS
  private url: string

  constructor() {
    if (process.env.NODE_ENV === 'development') {
      this.url = process.env.LOCAL_CONNECT!
      this.tls = {
        ca: fs.readFileSync(process.env.CERT_PATH!),
        rejectUnauthorized: false,
      }
    } else {
      this.url = process.env.PUBLIC_CONNECT!
      this.tls = undefined
    }

    this.client = this.connectToClient()
  }

  get clientURL() {
    return this.url
  }

  private connectToClient() {
    return new Client({
      node: this.url,
      auth: {
        username: process.env.ELASTIC_USERNAME!,
        password: process.env.ELASTIC_PASSWORD!,
      },
      tls: this.tls,
    })
  }

  async search(options: SearchOptions): Promise<any> {
    return this.client.search(options)
  }
}

const elasticClient = new ElasticClient()
Object.freeze(elasticClient)
export default elasticClient
