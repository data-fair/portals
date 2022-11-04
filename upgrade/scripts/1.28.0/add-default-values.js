exports.description = 'Add default values to some new properties'

exports.exec = async (db, debug) => {
  const defaultValues = [
    ['topicsBackgroundColor', 'individual'],
    ['topicsOptions', ['rounded']],
    ['datasetsCardLayout', 'dense'],
    ['applicationsCardLayout', 'dense'],
    ['usesCardLayout', 'dense'],
    ['actionCardOptions', ['outlined', 'hoverElevate']],
    ['actionCardBackgroundColor', 'white'],
    ['actionCardHorizontalOptions', ['outlined', 'flat', 'hoverColorTitle', 'hoverColorBorder']],
    ['actionCardHorizontalBackgroundColor', 'white']
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
