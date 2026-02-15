export default {
  mongoUrl: 'MONGO_URL',
  port: 'PORT',
  privateDirectoryUrl: 'PRIVATE_DIRECTORY_URL',
  privateEventsUrl: 'PRIVATE_EVENTS_URL',
  secretKeys: {
    identities: 'SECRET_IDENTITIES',
    events: 'SECRET_EVENTS',
    sites: 'SECRET_SITES',
    ingress: 'SECRET_INGRESS'
  },
  observer: {
    active: 'OBSERVER_ACTIVE',
    port: 'OBSERVER_PORT'
  },
  portalUrlPattern: 'PORTAL_URL_PATTERN',
  privateIngressManagerUrl: 'PRIVATE_INGRESS_MANAGER_URL',
  ingressControllers: {
    __name: 'INGRESS_CONTROLLERS',
    __format: 'json'
  },
  upgradeRoot: 'UPGRADE_ROOT',
  elasticsearch: {
    nodes: {
      __name: 'ES_NODES',
      __format: 'json'
    },
    auth: {
      __name: 'ES_AUTH',
      __format: 'json'
    },
    ca: 'ES_CA'
  },
}
