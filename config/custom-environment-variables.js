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
  processingsUrl: 'PROCESSINGS_URL',
  mongo: {
    host: 'MONGO_HOST',
    db: 'MONGO_DB',
    url: 'MONGO_URL',
    options: {
      __name: 'MONGO_OPTIONS',
      __format: 'json'
    }
  },
  mails: {
    from: 'MAILS_FROM',
    transport: {
      __name: 'MAILS_TRANSPORT',
      __format: 'json'
    }
  },
  secretKeys: {
    notifications: 'SECRET_NOTIFICATIONS',
    sites: 'SECRET_SITES',
    ignoreRateLimiting: 'SECRET_IGNORE_RATE_LIMITING'
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
  },
  whiteLabelOwners: 'WHITE_LABEL_OWNERS',
  disallowRobots: {
    __name: 'DISALLOW_ROBOTS',
    __format: 'json'
  },
  embeds: {
    table: 'EMBEDS_TABLE',
    updateDataset: 'EMBEDS_UPDATE_DATASET'
  }
}
