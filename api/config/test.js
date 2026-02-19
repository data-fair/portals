export default {
  port: 8098,
  privateDirectoryUrl: 'http://localhost:8081',
  privateEventsUrl: 'http://localhost:8084',
  mongoUrl: 'mongodb://localhost:27018/data-fair-portals-test',
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
    sites: 'secret-sites'
  },
  portalUrlPattern: 'http://{subdomain}.localhost:5610',
  upgradeRoot: './'
}
