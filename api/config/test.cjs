module.exports = {
  port: 8097,
  privateDirectoryUrl: 'http://localhost:8087',
  mongoUrl: 'mongodb://localhost:27017/data-fair-portals-test',
  tmpDir: './tmp',
  observer: {
    port: 9097,
    active: false
  },
  secretKeys: {
    identities: 'SECRET_IDENTITIES',
    events: 'SECRET_EVENTS',
    sites: 'SECRET_SITES'
  },
  draftUrlPattern: 'http://{id}.draft.localhost:5607',
  serveUi: false
}
