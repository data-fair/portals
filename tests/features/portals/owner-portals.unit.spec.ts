import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { foreignPortalId } from '../../../api/src/portals/operations.ts'

const org1 = { type: 'organization', id: 'org1' }
const portals = [
  { _id: 'p1', owner: { type: 'organization' as const, id: 'org1', name: 'Org 1' } },
  { _id: 'p2', owner: { type: 'organization' as const, id: 'org1', name: 'Org 1', department: 'dep1' } },
  { _id: 'p3', owner: { type: 'organization' as const, id: 'org2', name: 'Org 2' } },
  { _id: 'p4', owner: { type: 'user' as const, id: 'org1', name: 'User org1' } }
]

test.describe('portals a page or reuse may be attached to', () => {
  test('foreignPortalId: the first portal not found or of another owner', () => {
    assert.equal(foreignPortalId(org1, [], portals), undefined)
    // the department does not matter (contributorDepartments)
    assert.equal(foreignPortalId(org1, ['p1', 'p2'], portals), undefined)
    assert.equal(foreignPortalId({ ...org1, department: 'dep2' } as any, ['p1'], portals), undefined)
    assert.equal(foreignPortalId(org1, ['p1', 'p3'], portals), 'p3')
    assert.equal(foreignPortalId(org1, ['p4'], portals), 'p4')
    assert.equal(foreignPortalId(org1, ['missing', 'p3'], portals), 'missing')
  })
})
