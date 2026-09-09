// Seeds real data-fair resources for the specs that need the server-rendered path.
//
// DELETE /api/test-env only wipes the portals-manager collections, it never touches
// data-fair, so anything seeded here has to be deleted here too.
import { axiosAuth } from './axios.ts'

export const dataFairUrl = `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}/data-fair`

const admin = await axiosAuth('test_admin@test.com')

/** The composite reference data-fair uses to scope a query to one portal */
export const publicationSite = (portalId: string) => `data-fair-portals:${portalId}`

export const seedDataset = async (portalId: string, opts: {
  id: string
  title: string
  summary?: string
  image?: string
}) => {
  await admin.post(`${dataFairUrl}/api/v1/datasets/${opts.id}`, {
    isMetaOnly: true,
    title: opts.title,
    schema: [{ key: 'a', type: 'string' }]
  })
  await admin.patch(`${dataFairUrl}/api/v1/datasets/${opts.id}`, {
    summary: opts.summary,
    image: opts.image,
    publicationSites: [publicationSite(portalId)]
  })
  await admin.put(`${dataFairUrl}/api/v1/datasets/${opts.id}/permissions`, [{ classes: ['read', 'list'] }])
  return opts.id
}

export const deleteDatasets = async (ids: string[]) => {
  for (const id of ids) {
    await admin.delete(`${dataFairUrl}/api/v1/datasets/${id}`).catch(() => {})
  }
}
