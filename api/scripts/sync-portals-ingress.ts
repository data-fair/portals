import mongo from '#mongo'
import { syncPortalUpdate } from '../src/portals/service.ts'
import debug from 'debug'

debug.enable('sync-portal')

for await (const portal of mongo.portals.find({})) {
  await syncPortalUpdate(portal, portal, '', ['ingress'])
}
