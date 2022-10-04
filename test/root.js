const assert = require('assert').strict

describe('root', () => {
  it('Get service info', async () => {
    const ax = global.ax.user1
    const res = await ax.get('/api/v1/info')
    assert.equal(res.status, 200)
    assert.equal(res.data.version, 'test')
  })

  it('Get service status', async () => {
    const ax = global.ax.superadmin
    const res = await ax.get('/api/v1/status')
    assert.equal(res.status, 200)
    assert.equal(res.data.status, 'ok')
  })

  it('Ping service status', async () => {
    const ax = global.ax.superadmin
    const res = await ax.get('/api/v1/ping')
    assert.equal(res.status, 200)
    assert.equal(res.data, 'ok')
  })
})
