exports.description = 'Add default position to existing pages'

exports.exec = async (db, debug) => {
  const res = await db.collection('pages').updateMany(
    { 'navigation.position': { $exists: false }, 'navigation.type': { $in: ['direct', 'menu'] } },
    { $set: { 'navigation.position': 10 } }
  )
  debug(res.result)
}
