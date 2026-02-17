import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { session } from '~~/server/plugins/session'
import { portalEs } from '~~/server/plugins/es'

const buildQuery = (query: string) => ({
  query: {
    bool: {
      should: [
        {
          multi_match: {
            query,
            type: 'bool_prefix',
            fields: [
              'title^3',
              'title._2gram^3',
              'title._3gram^3',
              'description^2',
              'description._2gram^2',
              'description._3gram^2'
            ],
            operator: 'and'
          }
        },
        {
          match: {
            content: {
              query
            }
          }
        }
      ]
    }
  },
  highlight: {
    pre_tags: ['<span class="search-highlight">'],
    post_tags: ['</span>'],
    fields: {
      title: { number_of_fragments: 0 },
      description: { number_of_fragments: 2, fragment_size: 100 },
      content: { number_of_fragments: 1, fragment_size: 100 }
    }
  }
})

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const query = getQuery(event) as { q: string }
  const cookieHeader = getRequestHeader(event, 'cookie')

  let sessionState
  try {
    sessionState = await session.readStateFromCookie(cookieHeader)
  } catch (err) {
    sessionState = null
  }

  const user = sessionState?.user

  const must: any[] = []

  if (!user) {
    must.push({ term: { public: true } })
  } else {
    const orgIds = user.organizations?.map((org: any) => org.id) || []
    const privateAccessTerms = [`user:${user.id}:*:*`, ...orgIds.map((id: string) => `organization:${id}:*:*`)]

    must.push({
      bool: {
        should: [
          { term: { public: true } },
          {
            terms: { privateAccess: privateAccessTerms }
          }
        ],
        minimum_should_match: 1
      }
    })
  }

  const esQuery = buildQuery(query.q)

  const finalQuery = {
    ...esQuery,
    query: {
      bool: {
        must: [
          ...esQuery.query.bool.should,
          ...must
        ]
      }
    }
  }

  const indexName = `portal-search-${portal._id}`

  try {
    const results = await portalEs.client.search({
      index: indexName,
      ...finalQuery
    } as any)

    return {
      results: results.hits.hits.map((hit: any) => ({
        _id: hit._id,
        _source: hit._source,
        highlight: hit.highlight
      })),
      total: results.hits.total
    }
  } catch (err: any) {
    if (err.meta?.statusCode === 404) {
      return { results: [], total: 0 }
    }
    throw err
  }
})
