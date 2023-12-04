exports.description = 'Update news pages to set blocs application in asset property'

exports.exec = async (db, debug) => {
  for await (const page of db.collection('pages').find({ template: 'news' })) {
    const blocks = page.config && page.config.blocks
    let updated = false
    if (blocks && blocks.length) {
      for (const block of blocks) {
        if (block.application) {
          block.asset = {
            type: 'application',
            application: block.application
          }
          delete block.application
          updated = true
          debug('update page', page._id, page.title, block)
        }
      }
    }
    if (updated) await db.collection('pages').updateOne({ _id: page._id }, { $set: { 'config.blocks': blocks } })
  }
}
