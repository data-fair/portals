import assert from 'node:assert/strict'
import { axiosBuilder } from '@data-fair/lib-node/axios.js'
import { test as setup } from '@playwright/test'
import { apiUrl, clean } from './support/axios.ts'
import { sdTestEnvUrl, seedSdFixtures } from './support/sd-fixtures.ts'

const ax = axiosBuilder()

// the setup project of the tests (api, e2e) and of the simulations (playwright.sim.config.ts)
setup('Stateful tests setup', async () => {
  // Check that the dev API server is up
  await assert.doesNotReject(
    ax.get(`${apiUrl}/api/ping`, { timeout: 5000 }),
    `Dev API server seems to be unavailable at ${apiUrl}.
If you are an agent, read its logs with "npx --no df-dev logs api" and report the problem to your user (or "npx --no df-dev restart api" if the pane exited).`
  )

  // the accounts of the test sub-space (test_portals_) in simple-directory: cleaned, then seeded
  await assert.doesNotReject(
    ax.get(`${sdTestEnvUrl()}/ping`),
    `simple-directory's test API is unavailable at ${sdTestEnvUrl()}: the container needs ENABLE_TEST_API=1 and STORAGE_TYPE=mongo (docker-compose.yml).`
  )
  await seedSdFixtures()

  // then what these accounts own in portals
  await clean()
})
