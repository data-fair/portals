import type { AccountKeys } from '@data-fair/lib-express'
import type { Limit } from '#types/limit/index.ts'
import { httpError } from '@data-fair/lib-express'
import mongo from '#mongo'
import config from '#config'

// consumptions are counted on the fly instead of being stored, so they never drift
export const getLimits = async (account: AccountKeys & { name?: string }): Promise<Limit> => {
  const ownerFilter = { 'owner.type': account.type, 'owner.id': account.id }
  const [stored, nbPages, nbDomains] = await Promise.all([
    mongo.limits.findOne({ type: account.type, id: account.id }, { projection: { _id: 0 } }),
    mongo.pages.countDocuments(ownerFilter),
    mongo.portals.countDocuments({ ...ownerFilter, 'ingress.url': { $exists: true } })
  ])
  return {
    type: account.type,
    id: account.id,
    name: account.name ?? account.id,
    lastUpdate: new Date().toISOString(),
    defaults: true,
    ...stored,
    portals_nb_pages: { limit: stored?.portals_nb_pages?.limit ?? config.defaultLimits.nbPages, consumption: nbPages },
    portals_nb_domains: { limit: stored?.portals_nb_domains?.limit ?? config.defaultLimits.nbDomains, consumption: nbDomains }
  }
}

export const assertNbPagesLimit = async (owner: AccountKeys) => {
  const { limit, consumption } = (await getLimits(owner)).portals_nb_pages!
  if (limit !== -1 && consumption! >= limit!) {
    throw httpError(429, `Le nombre maximal de pages (${limit}) est atteint pour ce compte.`)
  }
}
