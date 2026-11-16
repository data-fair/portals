import { test } from '../../fixtures/login.ts'
import assert from 'node:assert/strict'
import 'dotenv/config'
import { axiosAuth, clean } from '../../support/axios.ts'
import { nhiSession } from '../../support/nhi.ts'
import { dataFairUrl } from '../../support/data-fair.ts'

// the test NHI is admin of test_org1, as this cookie user
const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })

const portalBody = (title: string) => ({ config: { title, menu: { children: [] } } })

const listedSites = async () => (await orgAdmin.get(`${dataFairUrl}/api/v1/settings/organization/test_org1/publication-sites`)).data as { type: string, id: string }[]
const isListed = (sites: { type: string, id: string }[], portalId: string) => sites.some(s => s.type === 'data-fair-portals' && s.id === portalId)

test.describe('publication-site sync', () => {
  test.beforeEach(clean)

  test('a human save still syncs through the cookie', async () => {
    const portal = (await orgAdmin.post('/api/portals', portalBody('Human portal'))).data
    assert.ok(isListed(await listedSites(), portal._id))
    await orgAdmin.delete(`/api/portals/${portal._id}`)
    assert.ok(!isListed(await listedSites(), portal._id))
  })

  test('an agent save that leaves the publication site unchanged needs no data-fair call', async () => {
    const agent = (await nhiSession('portals:admin')).bearerAx
    const portal = (await orgAdmin.post('/api/portals', portalBody('Human portal'))).data
    const draftConfig = { ...portal.draftConfig, title: 'Agent draft' }
    const res = await agent.patch(`/api/portals/${portal._id}`, { draftConfig })
    assert.equal(res.status, 200)
    assert.equal((await orgAdmin.get(`/api/portals/${portal._id}`)).data.draftConfig.title, 'Agent draft')
  })

  test('a portal created by a portals:admin token syncs its publication site', async () => {
    const agent = (await nhiSession('portals:admin')).bearerAx
    const portal = (await agent.post('/api/portals', portalBody('Agent portal'))).data
    assert.ok(isListed(await listedSites(), portal._id))
    await agent.delete(`/api/portals/${portal._id}`)
    assert.ok(!isListed(await listedSites(), portal._id))
  })
})
