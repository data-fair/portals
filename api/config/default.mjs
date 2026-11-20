export default {
  privateDirectoryUrl: 'http://simple-directory:8080',
  privateEventsUrl: undefined,
  privateDataFairUrl: 'http://data-fair:8080',
  // renders the pages of the portals for the agents' preview_portal_page tool (undefined: no preview)
  privateCaptureUrl: 'http://capture:8080',
  mongoUrl: 'mongodb://localhost:27017/data-fair-portals',
  port: 8080,
  tmpDir: '/tmp',
  observer: {
    active: true,
    port: 9090
  },
  // secrets that can be used to configure global webhooks for example to update users and organizations
  secretKeys: {
    identities: undefined,
    events: undefined,
    sites: undefined,
    ingress: undefined,
    limits: undefined,
    dataFair: undefined,
    // the SECRET_INSPECT of the capture service: /inspect renders for the page previews
    capture: undefined,
    // simple-directory's pseudo sessions: the preview renders pages as the calling user
    pseudoSession: undefined
  },
  // -1 means unlimited, overwritten per account by the customers service
  defaultLimits: {
    nbPages: -1,
    nbDomains: -1,
    // renders of the preview of a page per user (expensive: a browser page each)
    pagePreviews: { duration: 60, nb: 20 }
  },
  portalUrlPattern: undefined,
  privateIngressManagerUrl: undefined,
  ingressControllers: [],
  upgradeRoot: '/app/',
}
