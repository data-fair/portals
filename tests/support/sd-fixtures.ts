/**
 * The accounts of portals' test sub-space in simple-directory: every user, organization and member id
 * (and every email) starts with the prefix, so this suite seeds and cleans them without touching the
 * accounts of other sub-spaces (e.g. the dev world test_demo_ of dev/resources/demo-world.json).
 *
 * Seeded through simple-directory's test API (POST /api/test-env/seed) after a cleanup of the prefix
 * (DELETE /api/test-env?prefix=): by tests/global-setup.ts before the spec files are loaded (many of them
 * log in at import time) and by tests/state-setup.ts (the setup project of the tests and the simulations).
 * All the users with a password use 'passwd'.
 */
export const prefix = 'test_portals_'

const password = { clear: 'passwd' }

const person = (name: string, firstName: string, lastName: string) => ({
  id: `${prefix}${name}`,
  firstName,
  lastName,
  email: `${prefix}${name}@test.com`,
  password
})

// non-human identity of an autonomous agent of the agents service: the subject pins the agent id
const agentNhi = (env: Record<string, string | undefined>, name: string, agentId: string, scopes: string[]) => ({
  id: `${prefix}org1_${name}_nhi`,
  email: `${prefix}org1_${name}_nhi@test.com`,
  nhi: {
    provider: { issuer: `http://${env.DEV_HOST}:${env.NGINX_PORT}/agents/api/nhi` },
    subject: `autonomous-agent:${agentId}`,
    scopes
  }
})

export const sdFixtures = (env: Record<string, string | undefined> = process.env) => {
  const users = [
    person('superadmin', 'Test', 'Superadmin'),
    person('admin', 'Test', 'Admin'),
    person('contrib', 'Test', 'Contrib'),
    person('admin_dep', 'Test', 'Admin Dep'),
    person('contrib_dep', 'Test', 'Contrib Dep'),
    person('user', 'Test', 'User'),
    person('alone', 'Test', 'Alone'),
    // the scope tests (tests/support/nhi.ts signs its assertions with the private key of this jwks)
    {
      id: `${prefix}org1_scope_nhi`,
      email: `${prefix}org1_scope_nhi@test.com`,
      nhi: {
        provider: {
          issuer: 'https://portals-tests.example.com',
          jwks: {
            keys: [{
              kty: 'RSA',
              n: 'wiQuTVNmLuvJAzqVsM7y0pQmrZsPDuQXdg8V6nQ8Y64Hf7SCbC6UxZhNQNteY66VqS-RN0oyqyRHmOBnjhNO91XEHqpdsJpoiHIz_XlINNa07o3OEA9P6xIIasjLn8nU0O8rFljjloByt8yZcZkabyVgwQs-JqbzMrPMxtAJBim8Ru-jAn4fHhfdAhmJzE-Ve4-NgQHOBx2DMR--PB_E16w88pvHCEBItSeiE49dMbNH_lJHeVJhuBAVoeJ9QtWNZjxcTzQJkUcKPWIIwOL_kaQ_LWlcNcRh-S8k05fgoZNq1qvKZm37zBa9OgvWUmtxzmSyEp37GPdbfmF63SxLnw',
              e: 'AQAB',
              kid: 'test-nhi-key',
              alg: 'RS256',
              use: 'sig'
            }]
          }
        },
        subject: 'scope-tests'
      }
    },
    // the autonomous-agent simulations (simulations/runner/autonomous-agent.ts)
    agentNhi(env, 'pages_write', 'sim-pages-write', ['pages:write', 'portals:read', 'datasets:read', 'applications:read']),
    agentNhi(env, 'pages_admin', 'sim-pages-admin', ['pages:admin', 'portals:read', 'datasets:read']),
    agentNhi(env, 'pages_read', 'sim-pages-read', ['pages:read', 'portals:read']),
    agentNhi(env, 'portals_write', 'sim-portals-write', ['portals:write', 'pages:read'])
  ]

  const organizations = [
    {
      id: `${prefix}org1`,
      name: 'Test Org 1',
      departments: [{ id: 'dep1', name: 'Department 1' }, { id: 'dep2', name: 'Department 2' }],
      members: [
        { id: `${prefix}admin`, role: 'admin' },
        { id: `${prefix}contrib`, role: 'contrib' },
        { id: `${prefix}user`, role: 'user' },
        { id: `${prefix}admin_dep`, role: 'admin', department: 'dep1' },
        { id: `${prefix}contrib_dep`, role: 'contrib', department: 'dep1' },
        { id: `${prefix}org1_scope_nhi`, role: 'admin' },
        { id: `${prefix}org1_pages_write_nhi`, role: 'admin' },
        { id: `${prefix}org1_pages_admin_nhi`, role: 'admin' },
        { id: `${prefix}org1_pages_read_nhi`, role: 'admin' },
        { id: `${prefix}org1_portals_write_nhi`, role: 'admin' }
      ]
    },
    {
      id: `${prefix}org2`,
      name: 'Test Org 2',
      members: [
        { id: `${prefix}alone`, role: 'admin' },
        { id: `${prefix}superadmin`, role: 'user' }
      ]
    },
    {
      id: `${prefix}org3`,
      name: 'Test Org 3',
      members: [
        { id: `${prefix}superadmin`, role: 'admin' },
        { id: `${prefix}admin`, role: 'admin' },
        { id: `${prefix}user`, role: 'user' },
        { id: `${prefix}contrib`, role: 'contrib' }
      ],
      partners: [{ id: `${prefix}org1`, name: 'Test Org 1' }]
    }
  ]

  return { prefix, users, organizations }
}

/** simple-directory's test API, reached directly (not through nginx) */
export const sdTestEnvUrl = (env: Record<string, string | undefined> = process.env) => `http://localhost:${env.SD_PORT}/api/test-env`

const tooOld = 'simple-directory image too old for prefixed test sub-spaces: run "docker compose pull simple-directory"'

/**
 * POST a sub-space body to simple-directory's seed route (an upsert) and check the counts of the answer: an old
 * image without the prefixed test API answers 200 too, and the run would fail later with 401s.
 */
export const postSdSeed = async (url: string, body: { prefix: string, users: unknown[], organizations: unknown[] }) => {
  const seedRes = await fetch(`${url}/seed`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (seedRes.status >= 500) throw new Error(`${tooOld} (HTTP ${seedRes.status} on the seed of ${body.prefix})`)
  if (seedRes.status !== 200) throw new Error(`simple-directory refused the seed of ${body.prefix}: HTTP ${seedRes.status} ${await seedRes.text()}`)
  const counts = await seedRes.json().catch(() => null) as { users: number, organizations: number } | null
  if (counts?.users !== body.users.length || counts?.organizations !== body.organizations.length) {
    throw new Error(tooOld)
  }
  return counts
}

/** Clean the sub-space in simple-directory, then seed its accounts. Idempotent. */
export const seedSdFixtures = async (env: Record<string, string | undefined> = process.env) => {
  const url = sdTestEnvUrl(env)
  const cleanRes = await fetch(`${url}?prefix=${prefix}`, { method: 'DELETE' })
  if (cleanRes.status !== 204) throw new Error(`simple-directory refused the cleanup of ${prefix}: HTTP ${cleanRes.status} ${await cleanRes.text()}`)
  return await postSdSeed(url, sdFixtures(env))
}
