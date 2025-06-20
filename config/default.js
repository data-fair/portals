module.exports = {
  publicUrl: 'http://localhost:6200',
  port: 6200,
  dataDir: './data',
  directoryUrl: 'http://localhost:6200/simple-directory',
  privateDirectoryUrl: null,
  dataFairUrl: 'http://localhost:6200/data-fair',
  openapiViewerUrl: 'http://localhost:6200/openapi-viewer',
  notifyUrl: null,
  privateNotifyUrl: null,
  notifyWSUrl: null,
  processingsUrl: null,
  sessionDomain: null,
  proxyNuxt: false,
  mongo: {
    host: 'localhost',
    port: 27017,
    db: 'data-fair-portals-' + (process.env.NODE_ENV || 'development'),
    url: null,
    options: {}
  },
  mails: {
    from: '',
    // transport is a full configuration object for createTransport of nodemailer
    // cf https://nodemailer.com/smtp/
    transport: {
      port: 1025,
      ignoreTLS: true,
      default: 'localhost'
    }
  },
  // secrets that can be used to configure global webhooks for example to update users and organizations
  secretKeys: {
    notifications: null,
    sites: null,
    ignoreRateLimiting: null
  },
  copyright: {
    src: {
      dark: 'https://koumoul.com/static/logo-title-right-white.png',
      light: 'https://koumoul.com/static/logo-title-right.png'
    },
    title: 'Koumoul',
    message: 'Publiez vos propres données',
    href: 'https://koumoul.com'
  },
  i18n: {
    locales: 'fr',
    defaultLocale: 'fr'
  },
  prometheus: {
    active: true,
    port: 9090
  },
  embeds: {
    table: '/embed/dataset/{id}/table',
    map: '/embed/dataset/{id}/map',
    updateDataset: '/embed/workflow/update-dataset'
  },
  whiteLabelOwners: '',
  disallowRobots: false
}
