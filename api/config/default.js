export default {
  privateDirectoryUrl: 'http://simple-directory:8080',
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
    ingress: undefined
  },
  portalUrlPattern: undefined,
  privateIngressManagerUrl: undefined,
  ingressControllers: [],
  upgradeRoot: '/app/'
}
