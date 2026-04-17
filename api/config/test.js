import dotenv from 'dotenv'
dotenv.config({ path: import.meta.resolve('../../.env').replace('file://', '') })

if (!process.env.DEV_API_PORT) throw new Error('missing DEV_API_PORT env variable, use "source dev/init-env.sh" to init .env file')

export default {
  port: process.env.DEV_API_PORT,
  privateDirectoryUrl: `http://localhost:${process.env.SD_PORT}`,
  privateEventsUrl: `http://localhost:${process.env.EVENTS_PORT}`,
  mongoUrl: `mongodb://localhost:${process.env.MONGO_PORT}/data-fair-portals-test`,
  elasticsearch: {
    nodes: [`http://localhost:${process.env.ES_PORT}`]
  },
  tmpDir: './tmp',
  observer: {
    active: false,
    port: process.env.DEV_OBSERVER_PORT
  },
  secretKeys: {
    identities: 'secret-identities',
    events: 'secret-events',
    sites: 'secret-sites',
    pseudoSession: 'secret-pseudo-session',
    searchPages: 'secret-search-pages'
  },
  portalUrlPattern: `http://{subdomain}.${process.env.DEV_HOST}:${process.env.NGINX_PORT}`,
  upgradeRoot: './'
}
