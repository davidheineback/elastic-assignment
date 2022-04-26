import { NextApiRequest, NextApiResponse } from 'next'
import elasticClient from '../../components/ElasticClient'

// search options to get disered data from elastic search.
function getSearchOptions(from: string, to: string) {
  return {
    index: 'spotifydata',
    body: {
      aggs: {
        '0': {
          terms: {
            field: 'country.keyword',
            order: {
              '2': 'desc',
            },
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
      query: {
        bool: {
          filter: [
            {
              range: {
                date: {
                  format: 'strict_date_optional_time',
                  gte: `${from}`,
                  lte: `${to}`,
                },
              },
            },
          ],
        },
      },
    },
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { from, to } = req.query
  // if request has from and to query get searchOptions
  if (from && to) {
    const searchOptions = getSearchOptions(from as string, to as string)

    // use the search options to query elasticsearch
    const response = await elasticClient.search(searchOptions)

    // return the aggregation
    res.status(200).json({ aggregations: response.aggregations })
  } else {
    res.status(400).json({ message: 'Bad Request' })
  }
}
