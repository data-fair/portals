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

const ROOT = `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
const resourcesDir = path.join(process.cwd(), 'simulations', 'resources')

export type SeedIds = { portalId: string, pageId: string, datasetIds: string[] }

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
  await ax.post('/api/pages', {
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
  })
  await ax.post('/api/pages', {
    type: 'datasets',
    config: { title: 'Données', elements: [{ uuid: 'cat1', type: 'datasets-catalog', columns: 3, filters: { items: ['search'] } }] },
    portals: [portalId],
    owner
  })
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
  return { portalId, pageId: contentPage._id, datasetIds: DATASETS.map(d => d.id) }
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
