import 'dotenv/config'
import { defineSimConfig } from '@data-fair/lib-agents-sim'

// No path suffix: back-office routes carry /data-fair/, portal routes are
// absolute URLs on the portal's own domain (see simulations/runner/surfaces.ts).
export default defineSimConfig({ baseURL: `http://${process.env.DEV_HOST}:${process.env.NGINX_PORT}` })
