module.exports = {
  publicUrl: 'http://localhost:6200',
  port: 6200,
  directoryUrl: 'http://localhost:6200/simple-directory',
  dataFairUrl: 'http://localhost:6200/data-fair',
  openapiViewerUrl: 'http://localhost:6200/openapi-viewer',
  notifyUrl: null,
  privateNotifyUrl: null,
  notifyWSUrl: null,
  sessionDomain: null,
  proxyNuxt: false,
  mongo: {
    host: 'localhost',
    port: 27017,
    db: 'data-fair-portals-' + (process.env.NODE_ENV || 'development')
  },
  mails: {
    // transport is a full configuration object for createTransport of nodemailer
    // cf https://nodemailer.com/smtp/
    transport: {
      port: 1025,
      ignoreTLS: true,
      default: 'localhost'
    }
  },
  copyright: {
    src: {
      dark: 'https://koumoul.com/static/logo-title-right-white.png',
      light: 'https://koumoul.com/static/logo-title-right.png'
    },
    title: 'Koumoul',
    href: 'https://koumoul.com'
  },
  i18n: {
    locales: 'fr,en',
    defaultLocale: 'fr'
  },
  prometheus: {
    active: true,
    port: 9090
  },
  tablePreviewPath: '/table'
}
