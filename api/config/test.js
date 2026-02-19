export default {
  port: 8102,
  privateDirectoryUrl: 'http://localhost:8085',
  privateEventsUrl: 'http://localhost:8088',
  mongoUrl: 'mongodb://localhost:27022/data-fair-portals-test',
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
    sites: 'secret-sites'
  },
  portalUrlPattern: 'http://{subdomain}.localhost:5600',
  upgradeRoot: './'
}
