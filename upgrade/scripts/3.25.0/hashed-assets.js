const { fillConfigAssets } = require('../../../server/utils/assets')

exports.description = 'Create hashed and resized versions of image assets.'

exports.exec = async (db, debug) => {
  for await (const portal of db.collection('portals').find()) {
    if (portal.config) {
      const previousConf = JSON.stringify(portal.config)
      await fillConfigAssets(`data/${portal._id}/prod`, portal.config)
      if (JSON.stringify(portal.config) !== previousConf) {
        debug('save config of portal', portal._id)
        await db.collection('portals').updateOne({ _id: portal._id }, { $set: { config: portal.config } })
      }
    }
    if (portal.configDraft) {
      const previousConf = JSON.stringify(portal.configDraft)
      await fillConfigAssets(`data/${portal._id}/draft`, portal.configDraft)
      if (JSON.stringify(portal.configDraft) !== previousConf) {
        debug('save configDraft of portal', portal._id)
        await db.collection('portals').updateOne({ _id: portal._id }, { $set: { configDraft: portal.configDraft } })
      }
    }
  }
}
