module.exports = {
  publicUrl: 'PUBLIC_URL',
  port: 'PORT',
  dataFairUrl: 'DATAFAIR_URL',
  openapiViewerUrl: 'OPENAPIVIEWER_URL',
  sessionDomain: 'SESSION_DOMAIN',
  directoryUrl: 'DIRECTORY_URL',
  privateDirectoryUrl: 'PRIVATE_DIRECTORY_URL',
  notifyUrl: 'NOTIFY_URL',
  privateNotifyUrl: 'PRIVATE_NOTIFY_URL',
  notifyWSUrl: 'NOTIFY_WS_URL',
  mongo: {
    host: 'MONGO_HOST',
    db: 'MONGO_DB'
  },
  mails: {
    transport: {
      __name: 'MAILS_TRANSPORT',
      __format: 'json'
    }
  },
  secretKeys: {
    notifications: 'SECRET_NOTIFICATIONS',
    sites: 'SECRET_SITES'
  },
  proxyNuxt: {
    __name: 'PROXY_NUXT',
    __format: 'json'
  },
  i18n: {
    locales: 'I18N_LOCALES',
    defaultLocale: 'I18N_DEFAULT_LOCALE'
  },
  prometheus: {
    active: {
      __name: 'PROMETHEUS_ACTIVE',
      __format: 'json'
    },
    port: 'PROMETHEUS_PORT'
  }
  // tablePreviewPath: 'TABLE_PREVIEW_PATH'
}
