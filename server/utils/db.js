// TODO add ensureIndex instructions to init logic.

const config = require('config')
const { MongoClient } = require('mongodb')

async function ensureIndex (db, collection, key, options = {}) {
  try {
    await db.collection(collection).createIndex(key, options)
  } catch (err) {
    if ((err.code !== 85 && err.code !== 86) || !options.name) throw err

    // if the error is a conflict on keys or params of the index we automatically
    // delete then recreate the index
    console.log(`Drop then recreate index ${collection}/${options.name}`)
    await db.collection(collection).dropIndex(options.name)
    await db.collection(collection).createIndex(key, options)
  }
}

exports.connect = async () => {
  const url = config.mongo.url || `mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.db}`
  console.log('Connecting to mongodb')
  let client
  try {
    client = await MongoClient.connect(url, config.mongo.options)
  } catch (err) {
    // 1 retry after 1s
    // solve the quite common case in docker-compose of the service starting at the same time as the db
    await new Promise(resolve => setTimeout(resolve, 1000))
    client = await MongoClient.connect(url, config.mongo.options)
  }
  const db = client.db()
  return { db, client }
}

exports.init = async (db) => {
  await ensureIndex(db, 'portals', { host: 1 }, { name: 'host_1', unique: true, sparse: true })
  await ensureIndex(db, 'pages', { 'portal._id': 1, id: 1 }, { unique: true, name: 'id_1_portal._id_1' })
  await ensureIndex(db, 'uses', { slug: 1, 'portal._id': 1 }, { name: 'slug_1_portal._id_1', unique: true, sparse: true })
  await ensureIndex(db, 'uses', { 'datasets.id': 1 }, { name: 'dataset' })
  // full text search
  await ensureIndex(db, 'uses', { title: 'text', description: 'text', author: 'text', 'links.web': 'text', 'links.android': 'text', 'links.ios': 'text' }, { name: 'fulltext' })
}
