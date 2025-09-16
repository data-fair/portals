export default {
  port: 8097,
  privateDirectoryUrl: 'http://localhost:8081',
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
  draftUrlPattern: 'http://{id}.draft.localhost:5607',
  serveUi: false
}
