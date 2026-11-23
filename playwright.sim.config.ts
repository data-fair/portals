import 'dotenv/config'
import { defineSimConfig } from '@data-fair/lib-agents-sim'

// No path suffix: back-office routes carry /data-fair/, portal routes are
// absolute URLs on the portal's own domain (see simulations/runner/surfaces.ts).
// the simulations depend on the state-setup project (tests/state-setup.ts), which seeds the test
// accounts (test_portals_) in simple-directory
export default defineSimConfig({ baseURL: `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}` })
