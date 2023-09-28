exports.description = 'Update thematic pages to use one banner property'

exports.exec = async (db, debug) => {
  for await (const page of db.collection('pages').find({ template: 'thematic' })) {
    const config = page.config
    if (config.banner || config.localBanner) {
      debug('update page', page._id, page.title)
      config.banner = {
        url: config.banner,
        local: config.localBanner
      }
      delete config.localBanner
      await db.collection('pages').updateOne({ _id: page._id }, { $set: { config } })
    }
  }
}
