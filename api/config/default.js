export default {
  privateDirectoryUrl: 'http://simple-directory:8080',
  privateEventsUrl: undefined,
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
    limits: undefined
  },
  // -1 means unlimited, overwritten per account by the customers service
  defaultLimits: {
    nbPages: -1,
    nbDomains: -1
  },
  // assets (videos) need a S3 bucket, the feature is unavailable without it
  s3: undefined,
  assetMaxSize: 1024 * 1024 * 1024,
  portalUrlPattern: undefined,
  privateIngressManagerUrl: undefined,
  ingressControllers: [],
  upgradeRoot: '/app/',
}
