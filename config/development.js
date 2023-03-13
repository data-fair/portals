module.exports = {
  privateDirectoryUrl: 'http://localhost:8080',
  notifyUrl: 'http://localhost:6200/notify',
  privateNotifyUrl: 'http://localhost:8088',
  notifyWSUrl: 'ws://localhost:8088',
  proxyNuxt: true,
  secretKeys: {
    notifications: 'secret-notifications',
    sites: 'secret-sites'
  }
  // tablePreviewPath: '/table2'
}
