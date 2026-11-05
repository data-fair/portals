export default {
  mongoUrl: 'MONGO_URL',
  port: 'PORT',
  privateDirectoryUrl: 'PRIVATE_DIRECTORY_URL',
  privateEventsUrl: 'PRIVATE_EVENTS_URL',
  privateDataFairUrl: 'PRIVATE_DATA_FAIR_URL',
  privateCaptureUrl: 'PRIVATE_CAPTURE_URL',
  secretKeys: {
    identities: 'SECRET_IDENTITIES',
    events: 'SECRET_EVENTS',
    sites: 'SECRET_SITES',
    ingress: 'SECRET_INGRESS',
    limits: 'SECRET_LIMITS',
    dataFair: 'SECRET_DATA_FAIR',
    capture: 'SECRET_CAPTURE',
    pseudoSession: 'SECRET_PSEUDO_SESSION'
  },
  defaultLimits: {
    nbPages: 'DEFAULT_LIMITS_NB_PAGES',
    nbDomains: 'DEFAULT_LIMITS_NB_DOMAINS',
    pagePreviews: {
      duration: { __name: 'DEFAULT_LIMITS_PAGE_PREVIEWS_DURATION', __format: 'number' },
      nb: { __name: 'DEFAULT_LIMITS_PAGE_PREVIEWS_NB', __format: 'number' }
    }
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
}
