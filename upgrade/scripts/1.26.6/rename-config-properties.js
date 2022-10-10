exports.description = 'Rename a few config properties'

exports.exec = async (db, debug) => {
  for await (const portal of db.collection('portals').find()) {
    for (const configKey of ['config', 'configDraft']) {
      if (portal[configKey]) {
        const previousConfig = JSON.stringify(portal[configKey])

        // showSearchOverBanner replaced by homeSearchPosition and homeTopicsPosition
        portal[configKey].homeSearchPosition = portal[configKey].homeSearchPosition || 'belowKpi'
        portal[configKey].homeTopicsPosition = portal[configKey].homeTopicsPosition || 'belowKpi'
        if (portal[configKey].showSearchOverBanner) {
          portal[configKey].homeSearchPosition = 'overBanner'
          portal[configKey].homeTopicsPosition = 'overBanner'
        }
        delete portal[configKey].showSearchOverBanner

        // simple rename of showSearch -> homeShowSearch and showTopics => homeShowTopics
        if ('showSearch ' in portal[configKey]) {
          portal[configKey].homeShowSearch = portal[configKey].showSearch
        }
        delete portal[configKey].showSearch
        if ('showTopics ' in portal[configKey]) {
          portal[configKey].homeShowTopics = portal[configKey].showTopics
        }
        delete portal[configKey].showTopics

        if (portal[configKey].homeShowSearch) {
          portal[configKey].homeSearchOptions = portal[configKey].homeSearchOptions || ['outlined', 'rounded']
        }

        if (JSON.stringify(portal[configKey]) !== previousConfig) {
          debug(`save ${configKey} of portal ${portal._id}`)
          await db.collection('portals').updateOne({ _id: portal._id }, { $set: { [configKey]: portal[configKey] } })
        }
      }
    }
  }
}
