import { test, expect } from '../../fixtures/login.ts'
import { nhiSession } from '../../support/nhi.ts'

test.describe('non-human identity session', () => {
  test('an unscoped NHI session reaches the manager', async () => {
    const { bearerAx, cookieAx } = await nhiSession()
    expect((await bearerAx.get('/api/portals')).status).toBe(200)
    expect((await cookieAx.get('/api/portals')).status).toBe(200)
  })
})
