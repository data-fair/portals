import { test } from '../../fixtures/login.ts'
import assert from 'node:assert/strict'
import { axiosAuth, clean } from '../../support/axios.ts'
import { nhiSession } from '../../support/nhi.ts'

// the test NHI is admin of test_org1, as orgAdmin
const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })
const orgContrib = await axiosAuth({ email: 'test_contrib@test.com', org: 'test_org1' })

const statusOf = async (promise: Promise<any>) => {
  try {
    return (await promise).status
  } catch (err: any) {
    if (!err.status) throw err
    return err.status as number
  }
}

const createPortal = async () => (await orgAdmin.post('/api/portals', { config: { title: 'Draft portal', menu: { children: [] } } })).data

test.describe('portal draft config', () => {
  test.beforeEach(clean)

  test('a whole draft config is saved and read back', async () => {
    const portal = await createPortal()
    const draftConfig = (await orgAdmin.get(`/api/portals/${portal._id}/draft-config`)).data
    assert.deepEqual(draftConfig, portal.draftConfig)

    const saved = (await orgAdmin.put(`/api/portals/${portal._id}/draft-config`, { ...draftConfig, title: 'Edited portal', description: 'Une **description**' })).data
    assert.equal(saved.title, 'Edited portal')
    const read = (await orgAdmin.get(`/api/portals/${portal._id}/draft-config`)).data
    assert.deepEqual(read, saved)
    const stored = (await orgAdmin.get(`/api/portals/${portal._id}`)).data
    assert.equal(stored.config.title, 'Draft portal')
    assert.equal(stored.draftConfig.title, 'Edited portal')
  })

  test('an invalid draft config is refused with the validation message', async () => {
    const portal = await createPortal()
    await assert.rejects(
      orgAdmin.put(`/api/portals/${portal._id}/draft-config`, { ...portal.draftConfig, title: 42 }),
      (err: any) => err.status === 400 && /title/.test(err.data)
    )
  })

  test('a contributor cannot edit the draft of a portal', async () => {
    const portal = await createPortal()
    assert.equal(await statusOf(orgContrib.put(`/api/portals/${portal._id}/draft-config`, portal.draftConfig)), 403)
  })

  test('the read tier reads the draft config, the write tier saves it', async () => {
    const portal = await createPortal()
    const read = (await nhiSession('portals:read')).bearerAx
    assert.equal(await statusOf(read.get(`/api/portals/${portal._id}/draft-config`)), 200)
    assert.equal(await statusOf(read.put(`/api/portals/${portal._id}/draft-config`, portal.draftConfig)), 403)
    const write = (await nhiSession('portals:write')).bearerAx
    assert.equal(await statusOf(write.put(`/api/portals/${portal._id}/draft-config`, portal.draftConfig)), 200)
  })

  test('the schema of the draft config is the portal editor form for the portal', async () => {
    const portal = await createPortal()
    const res = await orgAdmin.get(`/api/portals/${portal._id}/draft-config/schema`)
    assert.equal(res.headers['cache-control'], 'private, max-age=300')
    assert.equal(res.data.title, 'Portal Config')
    assert.ok(res.data.properties.theme)
    const serialized = JSON.stringify(res.data)
    assert.ok(!serialized.includes('"$ref":"https://'), 'refs are local')
    // the topics of the portal owner, not of the form context
    assert.ok(serialized.includes('test_org1'), 'owner baked in')
    assert.ok(!/context\.(owner|whiteLabel|simplifiedTheme|pages)/.test(serialized), 'no expression reads the form context')
    assert.equal(await statusOf(orgContrib.get(`/api/portals/${portal._id}/draft-config/schema`)), 403)
    const read = (await nhiSession('portals:read')).bearerAx
    assert.equal(await statusOf(read.get(`/api/portals/${portal._id}/draft-config/schema`)), 200)
    const otherFamily = (await nhiSession('reuses:read')).bearerAx
    assert.equal(await statusOf(otherFamily.get(`/api/portals/${portal._id}/draft-config/schema`)), 403)
  })
})
