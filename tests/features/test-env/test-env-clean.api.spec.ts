import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { MongoClient } from 'mongodb'
import { mongoUrl } from '../../support/mongo.ts'
import 'dotenv/config'
import { axiosBuilder } from '@data-fair/lib-node/axios.js'
import { apiUrl } from '../../support/axios.ts'

const ax = axiosBuilder({ baseURL: apiUrl })

const ownedBy = (orgId: string) => ({ type: 'organization', id: orgId, name: orgId })
type OwnedDoc = { _id: string, owner?: ReturnType<typeof ownedBy> }

const ids = {
  portalsPortal: 'test-env-clean-portals-portal',
  portalsPage: 'test-env-clean-portals-page',
  otherPortal: 'test-env-clean-other-portal',
  otherPage: 'test-env-clean-other-page'
}

test.describe('test-env cleanup', () => {
  test('prefixed clean leaves the other sub-spaces', async () => {
    const client = await MongoClient.connect(mongoUrl)
    try {
      const db = client.db()
      const portals = db.collection<OwnedDoc>('portals')
      const pages = db.collection<OwnedDoc>('pages')
      await portals.deleteMany({ _id: { $in: [ids.portalsPortal, ids.otherPortal] } })
      await pages.deleteMany({ _id: { $in: [ids.portalsPage, ids.otherPage] } })
      await portals.insertMany([
        { _id: ids.portalsPortal, owner: ownedBy('test_portals_org1') },
        { _id: ids.otherPortal, owner: ownedBy('test_other_org') }
      ])
      await pages.insertMany([
        { _id: ids.portalsPage, owner: ownedBy('test_portals_org1') },
        { _id: ids.otherPage, owner: ownedBy('test_other_org') }
      ])

      const res = await ax.delete('/api/test-env', { params: { prefix: 'test_portals_' } })
      assert.equal(res.status, 204)

      assert.equal(await portals.countDocuments({ _id: ids.portalsPortal }), 0)
      assert.equal(await pages.countDocuments({ _id: ids.portalsPage }), 0)
      assert.equal(await portals.countDocuments({ _id: ids.otherPortal }), 1)
      assert.equal(await pages.countDocuments({ _id: ids.otherPage }), 1)
    } finally {
      // the other sub-space is never cleaned by this suite: remove what this test put there
      await client.db().collection<OwnedDoc>('portals').deleteMany({ _id: { $in: [ids.portalsPortal, ids.otherPortal] } })
      await client.db().collection<OwnedDoc>('pages').deleteMany({ _id: { $in: [ids.portalsPage, ids.otherPage] } })
      await client.close()
    }
  })

  test('invalid prefixes are refused', async () => {
    for (const params of [{}, { prefix: 'test_' }, { prefix: 'test_A_' }]) {
      await assert.rejects(ax.delete('/api/test-env', { params }), (err: any) => err.status === 400, JSON.stringify(params))
    }
  })
})
