/**
 * What a case's person finds: two indexed datasets published on one portal, the
 * portal itself with a menu, a home page, a catalog and a content page. Seeded fresh
 * on every run after the cleanups, so a case never inherits another run's state.
 *
 * DELETE /api/test-env only wipes the portals-manager collections, so the data-fair
 * datasets are deleted here by their fixed ids.
 */
import FormData from 'form-data'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { axiosAuth, clean } from '../../tests/support/axios.ts'
import { OWNER, OWNER_ADMIN_EMAIL } from './settings.ts'
import type { AgentSeedIds, PortalsState } from './autonomous-agent.ts'

const ROOT = `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
const resourcesDir = path.join(process.cwd(), 'simulations', 'resources')

export type SeedIds = { portalId: string, pageId: string, homePageId: string, catalogPageId: string, datasetIds: string[] }

/** data-fair topics of the owner: datasets are classified with them, the portal shows them. */
const TOPICS = [
  { id: 'sport', title: 'Sport et loisirs', color: '#2e7d32' },
  { id: 'citoyennete', title: 'Citoyenneté', color: '#1565c0' },
  { id: 'education', title: 'Education, social, santé', color: '#ad1457' }
]

const DATASETS = [
  { id: 'sim-equipements-sportifs', file: 'equipements-sportifs.csv', title: 'Équipements sportifs', description: 'Recensement des équipements sportifs de l\'agglomération : gymnases, piscines, stades et salles.', topic: 'sport' },
  { id: 'sim-suivi-demandes', file: 'suivi-demandes.csv', title: 'Suivi des demandes citoyennes', description: 'Demandes adressées aux services de la collectivité et leur état d\'avancement.', topic: 'citoyennete' }
]

export const CONTENT_PAGE_TITLE = 'Nos actions pour la jeunesse'

export async function seedAll (): Promise<SeedIds> {
  await clean()
  const ax = await axiosAuth({ email: OWNER_ADMIN_EMAIL, org: OWNER.id })
  for (const d of DATASETS) await ax.delete(`${ROOT}/data-fair/api/v1/datasets/${d.id}`).catch(() => {})
  await ax.patch(`${ROOT}/data-fair/api/v1/settings/${OWNER.type}/${OWNER.id}`, { topics: TOPICS })

  const portal = (await ax.post('/api/portals', {
    config: {
      title: 'Portail de l\'agglomération',
      menu: { children: [{ type: 'standard', subtype: 'home' }, { type: 'standard', subtype: 'datasets' }] },
      agentChat: { active: true, visibleTo: ['anonymous', 'external', 'user', 'contrib', 'admin'] }
    }
  })).data
  const portalId: string = portal._id
  const site = `data-fair-portals:${portalId}`

  for (const d of DATASETS) {
    const form = new FormData()
    form.append('file', readFileSync(path.join(resourcesDir, d.file)), { filename: d.file, contentType: 'text/csv' })
    form.append('body', JSON.stringify({ title: d.title, description: d.description }))
    await ax.put(`${ROOT}/data-fair/api/v1/datasets/${d.id}`, form, {
      headers: { 'Content-Length': form.getLengthSync(), ...form.getHeaders() }
    })
  }
  await waitForDatasets(ax, DATASETS.map(d => d.id))
  for (const d of DATASETS) {
    await ax.patch(`${ROOT}/data-fair/api/v1/datasets/${d.id}`, {
      publicationSites: [site],
      topics: TOPICS.filter(t => t.id === d.topic)
    })
    await ax.put(`${ROOT}/data-fair/api/v1/datasets/${d.id}/permissions`, [{ classes: ['read', 'list'] }])
  }

  const owner = portal.owner
  const homePage = (await ax.post('/api/pages', {
    type: 'home',
    config: {
      title: 'Accueil',
      elements: [
        { type: 'title', content: 'Les données de l\'agglomération', titleSize: 'h2' },
        { type: 'datasets-list', columns: 3, limit: 6, usePortalConfig: true }
      ]
    },
    portals: [portalId],
    owner
  })).data
  const catalogPage = (await ax.post('/api/pages', {
    type: 'datasets',
    config: { title: 'Données', elements: [{ uuid: 'cat1', type: 'datasets-catalog', columns: 3, filters: { items: ['search'] } }] },
    portals: [portalId],
    owner
  })).data
  const contentPage = (await ax.post('/api/pages', {
    type: 'generic',
    config: {
      title: CONTENT_PAGE_TITLE,
      elements: [{ type: 'text', content: 'Cette page présente les actions de la collectivité pour les jeunes.' }],
      genericMetadata: { slug: 'jeunesse' }
    },
    portals: [portalId],
    owner
  })).data
  return { portalId, pageId: contentPage._id, homePageId: homePage._id, catalogPageId: catalogPage._id, datasetIds: DATASETS.map(d => d.id) }
}

export const DRAFT_PAGE_TITLE = 'Agenda culturel de l\'été'
export const APPLICATION = { id: 'sim-graphique-equipements', title: 'Capacité des équipements sportifs par commune' }
/** A public base application, fetched by data-fair at registration: the dev stack serves none of its own. */
const BASE_APP_URL = 'https://cdn.jsdelivr.net/npm/@data-fair/app-charts@1/dist/'
const SUPER_ADMIN_EMAIL = 'test_superadmin@test.com'

/**
 * The autonomous-agent cases' world: seedAll's portal (home, catalog and the published content page,
 * all attached), plus a free page a colleague prepared and never published, attached to no portal,
 * and an application of test_org1 on the sports facilities dataset, published on the portal.
 */
export async function seedAgentFixtures (): Promise<AgentSeedIds> {
  const ids = await seedAll()
  const ax = await axiosAuth({ email: OWNER_ADMIN_EMAIL, org: OWNER.id })

  // live: a placeholder, as the page was when it was created; draft: the content prepared since
  const draftPage = (await ax.post('/api/pages', {
    type: 'generic',
    config: {
      title: DRAFT_PAGE_TITLE,
      elements: [{ type: 'text', content: 'Page en préparation.' }],
      genericMetadata: { slug: 'agenda-ete' }
    }
  })).data
  const draft = (await ax.get(`/api/pages/${draftPage._id}/draft-config`)).data
  await ax.put(`/api/pages/${draftPage._id}/draft-config`, {
    ...draft,
    elements: [
      { type: 'text', content: 'Tout l\'été, l\'agglomération propose des concerts, des projections en plein air et des ateliers pour toute la famille.' },
      { type: 'text', content: '- 5 juillet : concert d\'ouverture au parc des Rives\n- 19 juillet : cinéma en plein air\n- 2 août : ateliers créatifs à la médiathèque' }
    ]
  })

  const admin = await axiosAuth({ email: SUPER_ADMIN_EMAIL, adminMode: true })
  const baseApp = (await admin.post(`${ROOT}/data-fair/api/v1/base-applications`, { url: BASE_APP_URL })).data
  await admin.patch(`${ROOT}/data-fair/api/v1/base-applications/${encodeURIComponent(baseApp.id)}`, { public: true })
  await ax.delete(`${ROOT}/data-fair/api/v1/applications/${APPLICATION.id}`).catch(() => {})
  const dataset = DATASETS[0]
  await ax.put(`${ROOT}/data-fair/api/v1/applications/${APPLICATION.id}`, {
    url: BASE_APP_URL,
    title: APPLICATION.title,
    description: 'Graphique de la capacité d\'accueil cumulée des équipements sportifs, par commune.',
    configuration: { datasets: [{ href: `${ROOT}/data-fair/api/v1/datasets/${dataset.id}`, id: dataset.id, title: dataset.title }] }
  })
  await ax.patch(`${ROOT}/data-fair/api/v1/applications/${APPLICATION.id}`, { publicationSites: [`data-fair-portals:${ids.portalId}`] })
  await ax.put(`${ROOT}/data-fair/api/v1/applications/${APPLICATION.id}/permissions`, [{ classes: ['read', 'list'] }])

  return {
    portalId: ids.portalId,
    homePageId: ids.homePageId,
    catalogPageId: ids.catalogPageId,
    contentPageId: ids.pageId,
    draftPageId: draftPage._id,
    datasetIds: ids.datasetIds,
    applicationId: APPLICATION.id
  }
}

/** The portal's configurations and every page of test_org1, as stored: what premises and checks read. */
export async function readPortalsState (portalId: string): Promise<PortalsState> {
  const ax = await axiosAuth({ email: OWNER_ADMIN_EMAIL, org: OWNER.id })
  const portal = (await ax.get(`/api/portals/${portalId}`)).data
  const { results, count } = (await ax.get('/api/pages', { params: { size: 100 } })).data
  if (count > results.length) throw new Error(`test_org1 has ${count} pages, only ${results.length} were read`)
  return {
    portal: { _id: portal._id, config: portal.config, draftConfig: portal.draftConfig },
    pages: results.map((p: any) => ({ _id: p._id, type: p.type, title: p.title, portals: p.portals ?? [], requestedPortals: p.requestedPortals ?? [], config: p.config, draftConfig: p.draftConfig }))
  }
}

/** Indexing is asynchronous; asking about an unfinalized dataset measures nothing. */
async function waitForDatasets (ax: any, ids: string[]) {
  const deadline = Date.now() + 120_000
  for (const id of ids) {
    while (true) {
      const status = (await ax.get(`${ROOT}/data-fair/api/v1/datasets/${id}`)).data.status
      if (status === 'finalized') break
      if (status === 'error') throw new Error(`dataset ${id} failed to index`)
      if (Date.now() > deadline) throw new Error(`dataset ${id} still "${status}" after 120s`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
