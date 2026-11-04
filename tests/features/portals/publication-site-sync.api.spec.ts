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

  test('an agent save that changes the publication site answers the data-fair error and stores nothing', async () => {
    test.skip(!!process.env.DF_IMAGE, 'data-fair accepts the portals secret key (DF_IMAGE)')
    const agent = (await nhiSession('portals:admin')).bearerAx

    // creation: data-fair:master ignores the secret key, the scope-restricted session is refused
    const createErr: any = await agent.post('/api/portals', portalBody('Agent portal')).catch(err => err)
    assert.ok([401, 403].includes(createErr.status), `unexpected status ${createErr.status}`)
    assert.match(String(createErr.data), /data-fair error \((401|403)\)/)
    const portals = (await orgAdmin.get('/api/portals')).data.results as { config: { title: string } }[]
    assert.ok(!portals.some(p => p.config.title === 'Agent portal'))

    // patch of a field of the publication site: refused before the portal is stored
    const portal = (await orgAdmin.post('/api/portals', portalBody('Human portal'))).data
    const patchErr: any = await agent.patch(`/api/portals/${portal._id}`, { staging: true }).catch(err => err)
    assert.ok([401, 403].includes(patchErr.status), `unexpected status ${patchErr.status}`)
    assert.match(String(patchErr.data), /data-fair error \((401|403)\)/)
    assert.ok(!(await orgAdmin.get(`/api/portals/${portal._id}`)).data.staging)
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
    test.skip(!process.env.DF_IMAGE, 'needs a data-fair build with the portals secret key (DF_IMAGE)')
    const agent = (await nhiSession('portals:admin')).bearerAx
    const portal = (await agent.post('/api/portals', portalBody('Agent portal'))).data
    assert.ok(isListed(await listedSites(), portal._id))
    await agent.delete(`/api/portals/${portal._id}`)
    assert.ok(!isListed(await listedSites(), portal._id))
  })
})
