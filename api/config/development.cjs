module.exports = {
  port: 8097,
  privateDirectoryUrl: 'http://localhost:8087',
  mongoUrl: 'mongodb://localhost:27017/data-fair-portals-development',
  observer: {
    port: 9097
  },
  secretKeys: {
    identities: 'SECRET_IDENTITIES',
    events: 'SECRET_EVENTS',
    sendMails: 'SECRET_SENDMAILS'
  }
}
