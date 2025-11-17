import mongo from '#mongo'
import { syncPortalUpdate } from '../src/portals/service.ts'
import debug from 'debug'

debug.enable('sync-portal')

await mongo.connect()

for await (const portal of mongo.portals.find({})) {
  await syncPortalUpdate(portal, portal, '', ['df'])
}

await mongo.client.close()

process.exit()
