const config = require('config')
const axios = require('../../../server/utils/axios')

exports.description = 'Sync portals with activated auth to SD sites'

exports.exec = async (db, debug) => {
  for await (const portal of db.collection('portals').find({})) {
    if (portal.config && portal.config.authentication !== 'none' && portal.host && config.secretKeys.sites) {
      debug('sync portal', portal._id, portal.host)
      try {
        await axios.post(
        `${config.privateDirectoryUrl || config.directoryUrl}/api/sites`,
        {
          _id: 'data-fair-portals:' + portal._id,
          owner: portal.owner,
          host: portal.host,
          theme: {
            primaryColor: config.themeColor || '#1E88E5'
          }
        },
        { params: { key: config.secretKeys.sites } }
        )
      } catch (err) {
        console.error('failure to sync portal to SD site', err)
      }
    }
  }
}
