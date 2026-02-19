export default {
  port: 8102,
  privateDirectoryUrl: 'http://localhost:8085',
  privateEventsUrl: 'http://localhost:8088',
  mongoUrl: 'mongodb://localhost:27022/data-fair-portals-development',
  elasticsearch: {
    nodes: ['http://localhost:9205']
  },
  tmpDir: './tmp',
  observer: {
    active: false,
    port: 9102
  },
  secretKeys: {
    identities: 'secret-identities',
    events: 'secret-events',
    sites: 'secret-sites',
    ingress: 'secret-ingress'
  },
  portalUrlPattern: 'http://{subdomain}.portals.localhost:5600',
  // 5702 for dev/ingress-manager.ts
  // 5608 for the separate project portals-ingress-manager development server
  privateIngressManagerUrl: 'http://localhost:5702',
  ingressControllers: ['nginx'],
  upgradeRoot: '../'
}
