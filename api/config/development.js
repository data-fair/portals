export default {
  port: 8098,
  privateDirectoryUrl: 'http://localhost:8081',
  privateEventsUrl: 'http://localhost:8084',
  mongoUrl: 'mongodb://localhost:27018/data-fair-portals-development',
  elasticsearch: {
    nodes: ['http://localhost:9205']
  },
  tmpDir: './tmp',
  observer: {
    active: false,
    port: 9098
  },
  secretKeys: {
    identities: 'secret-identities',
    events: 'secret-events',
    sites: 'secret-sites',
    ingress: 'secret-ingress'
  },
  portalUrlPattern: 'http://{subdomain}.portals.localhost:5610',
  // 5698 for dev/ingress-manager.ts
  // 5604 for the separate project portals-ingress-manager development server
  privateIngressManagerUrl: 'http://localhost:5698',
  ingressControllers: ['nginx'],
  upgradeRoot: '../'
}
