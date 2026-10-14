import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

const ci = !!process.env.CI

export default defineConfig({
  testDir: './tests',
  // api and e2e tests share the dev env state (one clean wipes every test owner): one worker
  workers: 1,
  fullyParallel: false,
  forbidOnly: ci,
  // a flake must not cost a full re-run; the nightly run sets TEST_RETRIES=0 to expose flaky tests
  retries: ci ? Number(process.env.TEST_RETRIES || 1) : 0,
  // the json report keeps the per-test durations of the last run, used to size the smoke set
  // on a failure: npx playwright show-trace test-results/<test>/trace.zip (pane logs attached there)
  reporter: [['dot'], ['json', { outputFile: 'dev/logs/test-timings.json' }]],
  // per test, HOOKS INCLUDED: heavy specs call test.slow() (x3) instead of raising this
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}/portals-manager`,
    actionTimeout: 5_000,
    navigationTimeout: 10_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'unit',
      testMatch: /.*\.unit\.spec\.ts/,
    },
    {
      name: 'state-setup',
      testMatch: /state-setup\.ts/,
    },
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      dependencies: ['state-setup'],
    },
    {
      // the first hit of each manager route (vite transforms) and of the portal (nuxt SSR
      // build) is slow: this pays for it once, with long timeouts, before the e2e tests
      name: 'e2e-warmup',
      testMatch: /e2e-warmup\.ts/,
      dependencies: ['state-setup'],
      // cold, the portal's first page took 50 s and the page editor over 60 s (measured 2026-10)
      timeout: 300_000,
      expect: { timeout: 120_000 },
      use: { ...devices['Desktop Chrome'], navigationTimeout: 120_000 },
    },
    {
      name: 'e2e',
      testMatch: /.*\.e2e\.spec\.ts/,
      dependencies: ['e2e-warmup'],
      use: { ...devices['Desktop Chrome'] },
    },
    // the page editor profiling seed (AGENTS.md "Performance profiling"): no assertion, so it
    // is only a project when PERF_SEED is set (.mcp.json sets it for the Playwright MCP server)
    ...(process.env.PERF_SEED
      ? [{ name: 'perf-seed', testMatch: /perf-seed\.ts/, use: { ...devices['Desktop Chrome'] } }]
      : []),
  ],
})
