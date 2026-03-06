import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { session } from '~~/server/plugins/session'
import { portalEs } from '~~/server/plugins/es'
import { portalMongo } from '~~/server/plugins/mongo'
import type { SearchEngineResult } from '@data-fair/types-portals/index.ts'

const getLastIndexDate = async (portalId: string): Promise<string | null> => {
  const result = await portalMongo.searchPages
    .find({ portal: portalId, indexedAt: { $exists: true } })
    .sort({ indexedAt: -1 })
    .limit(1)
    .project({ indexedAt: 1 })
    .toArray()
  return result[0]?.indexedAt || null
}

export const buildQuery = (query: string) => ({
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
  }
})

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const query = getQuery(event) as { q: string }
  const cookieHeader = getRequestHeader(event, 'cookie')
  const ifModifiedSince = getRequestHeader(event, 'if-modified-since')

  const sessionState = await session.readStateFromCookie(cookieHeader).catch(() => null)
  const isAuthenticated = !!sessionState?.user

  const lastIndexDate = await getLastIndexDate(portal._id)

  if (lastIndexDate && ifModifiedSince) {
    const lastIndexDateMs = new Date(lastIndexDate).getTime()
    const ifModifiedSinceMs = new Date(ifModifiedSince).getTime()
    if (lastIndexDateMs <= ifModifiedSinceMs) {
      setHeader(event, 'Last-Modified', new Date(lastIndexDateMs).toUTCString())
      setHeader(event, 'Cache-Control', isAuthenticated ? 'private' : 'public')
      setHeader(event, 'X-Accel-Buffering', isAuthenticated ? 'no' : 'yes')
      return sendNoContent(event, 304)
    }
  }

  if (lastIndexDate) {
    setHeader(event, 'Last-Modified', new Date(lastIndexDate).toUTCString())
  }

  setHeader(event, 'Cache-Control', isAuthenticated ? 'private, max-age=0, must-revalidate' : 'public, max-age=10, must-revalidate')
  setHeader(event, 'X-Accel-Buffering', isAuthenticated ? 'no' : 'yes')

  const user = sessionState?.user

  const must: any[] = []

  if (!user) {
    must.push({ term: { public: true } })
  } else {
    const privateAccessTerms: string[] = [`user:${user.id}:*:*`]

    for (const org of user.organizations || []) {
      const department = org.department || '*'
      const roles = org.role ? org.role : '*'
      privateAccessTerms.push(`organization:${org.id}:${department}:${roles}`)
    }

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
      results: results.hits.hits.map((hit: any): SearchEngineResult => ({
        path: hit._source.path,
        title: hit._source.title,
        description: hit._source.description?.slice(0, 100),
        resourceType: hit._source.resourceType
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
