import 'dotenv/config'

if (!process.env.DEV_API_PORT) throw new Error('missing DEV_API_PORT env variable, use "source dev/init-env.sh" to init .env file')

export default {
  port: process.env.DEV_API_PORT,
  privateDirectoryUrl: `http://localhost:${process.env.SD_PORT}`,
  privateEventsUrl: `http://localhost:${process.env.EVENTS_PORT}`,
  mongoUrl: `mongodb://localhost:${process.env.MONGO_PORT}/data-fair-portals-development`,
  /* elasticsearch: {
    nodes: [`http://localhost:${esPort}`]
  }, */
  tmpDir: './tmp',
  observer: {
    active: false,
    port: process.env.DEV_OBSERVER_PORT
  },
  secretKeys: {
    identities: 'secret-identities',
    events: 'secret-events',
    sites: 'secret-sites',
    ingress: 'secret-ingress'
  },
  portalUrlPattern: `http://{subdomain}.portals.localhost:${process.env.NGINX_PORT}`,
  privateIngressManagerUrl: `http://localhost:${parseInt(process.env.DEV_API_PORT) - 200}`,
  ingressControllers: ['nginx'],
  upgradeRoot: '../'
}
