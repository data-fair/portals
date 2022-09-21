exports.description = 'Rename a few config properties'

exports.exec = async (db, debug) => {
  for await (const portal of db.collection('portals').find()) {
    for (const configKey of ['config', 'configDraft']) {
      if (portal[configKey]) {
        const previousConfig = JSON.stringify(portal[configKey])
        if (portal[configKey].reusesPage) {
          portal[configKey].applicationsPage = portal[configKey].reusesPage
        }
        if (JSON.stringify(portal[configKey]) !== previousConfig) {
          debug(`save ${configKey} of portal ${portal._id}`)
          await db.collection('portals').updateOne({ _id: portal._id }, { $set: { [configKey]: portal[configKey] } })
        }
      }
    }
  }
}
