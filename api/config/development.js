export default {
  port: 8097,
  privateDirectoryUrl: 'http://localhost:8081',
  mongoUrl: 'mongodb://localhost:27017/data-fair-portals-development',
  tmpDir: './tmp',
  observer: {
    active: false,
    port: 9097
  },
  secretKeys: {
    identities: 'secret-identities',
    events: 'secret-events',
    sites: 'secret-sites',
    ingress: 'secret-ingress'
  },
  draftUrlPattern: 'http://{id}.draft.localhost:5607',
  // 5697 for dev/ingress-manager.ts
  // 5603 for the separate project portals-ingress-manager development server
  privateIngressManagerUrl: 'http://localhost:5697',
  ingressControllers: ['nginx'],
  serveUi: false
}
