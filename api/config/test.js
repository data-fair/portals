export default {
  port: 8097,
  privateDirectoryUrl: 'http://localhost:8080',
  privateEventsUrl: 'http://localhost:8083',
  mongoUrl: 'mongodb://localhost:27017/data-fair-portals-test',
  tmpDir: './tmp',
  observer: {
    active: false,
    port: 9097
  },
  secretKeys: {
    identities: 'secret-identities',
    events: 'secret-events',
    sites: 'secret-sites'
  },
  portalUrlPattern: 'http://{subdomain}.localhost:5600',
  upgradeRoot: './'
}
