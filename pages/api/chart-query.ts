import { Client } from '@elastic/elasticsearch'
import { NextApiRequest, NextApiResponse } from 'next'
import elasticClient from '../../components/ElasticClient'

const searchOptions = {
  index: 'scrapedspotifydata',
  body: {
    aggs: {
      '0': {
        terms: {
          field: 'country.keyword',
          order: {
            '2': 'desc',
          },
          size: 7,
        },
        aggs: {
          '1': {
            date_histogram: {
              field: 'date',
              fixed_interval: '3h',
              time_zone: 'Europe/Stockholm',
            },
            aggs: {
              '2': {
                sum: {
                  field: 'toplist.streams',
                },
              },
            },
          },
          '2': {
            sum: {
              field: 'toplist.streams',
            },
          },
        },
      },
    },
    size: 0,
    fields: [
      {
        field: 'date',
        format: 'date_time',
      },
    ],
    script_fields: {},
    stored_fields: ['*'],
    runtime_mappings: {},
    _source: {
      excludes: [],
    },
    query: {
      bool: {
        must: [],
        filter: [
          {
            range: {
              date: {
                format: 'strict_date_optional_time',
                gte: '2022-04-01T07:22:54.890Z',
                lte: '2022-04-06T07:38:53.127Z',
              },
            },
          },
        ],
        should: [],
        must_not: [],
      },
    },
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const response = await elasticClient.search(searchOptions)

  res.status(200).json({ aggregations: response.aggregations })
}
