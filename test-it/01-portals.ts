// import { strict as assert } from 'node:assert'
import { it, describe, before, beforeEach, after } from 'node:test'
import { clean, startApiServer, stopApiServer } from './utils/index.ts'

describe('events', () => {
  before(startApiServer)
  beforeEach(clean)
  after(stopApiServer)

  it('post a portal', async () => {
    // TODO
  })
})
