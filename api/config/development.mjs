import dotenv from 'dotenv'

// no import.meta in a config file: playwright compiles it to CommonJS when a spec loads the config
dotenv.config({ path: ['.env', '../.env'], quiet: true })

if (!process.env.DEV_API_PORT) throw new Error('missing DEV_API_PORT env variable, run "npm run dev-deps" to create .env from dev/default.env, then start the env with "npm run dev"')

// optional services (events, capture): absent (null) when their port variable is empty
/** @param {string | undefined} port */
const optionalUrl = (port) => port ? `http://localhost:${port}` : null

export default {
  port: process.env.DEV_API_PORT,
  privateDirectoryUrl: `http://localhost:${process.env.SD_PORT}`,
  privateEventsUrl: optionalUrl(process.env.EVENTS_PORT),
  privateDataFairUrl: `http://localhost:${process.env.DF_PORT}`,
  privateCaptureUrl: optionalUrl(process.env.CAPTURE_PORT),
  mongoUrl: `mongodb://localhost:${process.env.MONGO_PORT}/data-fair-portals-development`,
  tmpDir: './tmp',
  observer: {
    active: false,
    port: process.env.DEV_OBSERVER_PORT
  },
  secretKeys: {
    identities: 'secret-identities',
    events: 'secret-events',
    sites: 'secret-sites',
    ingress: 'secret-ingress',
    limits: 'secret-limits',
    dataFair: 'secret-portals',
    capture: 'secret-capture',
    pseudoSession: 'secret-pseudo-session'
  },
  portalUrlPattern: `http://{subdomain}.portals.${process.env.DEV_HOST}:${process.env.NGINX_PORT}`,
  privateIngressManagerUrl: `http://localhost:${process.env.DEV_INGRESS_PORT}`,
  ingressControllers: ['nginx'],
  upgradeRoot: '../'
}
