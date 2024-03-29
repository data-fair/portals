exports.description = 'Add default values to some new properties'

exports.exec = async (db, debug) => {
  const defaultValues = [
    ['homeLinksPosition', 'belowKpi']
  ]
  for (const defaultValue of defaultValues) {
    for (const configKey of ['config', 'configDraft']) {
      const res = await db.collection('portals').updateMany(
        { [`${configKey}.${defaultValue[0]}`]: { $exists: false } },
        { $set: { [`${configKey}.${defaultValue[0]}`]: defaultValue[1] } }
      )
      debug(`${configKey}.${defaultValue[0]} = ${defaultValue[1]}`, res.result)
    }
  }
}
