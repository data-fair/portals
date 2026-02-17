import locks from '@data-fair/lib-node/locks.js'
import { internalError } from '@data-fair/lib-node/observer.js'
import mongo from '#mongo'
import { indexPageRef, deletePageRef } from './service.ts'

let loopPromise: Promise<void> | null = null
let stopped = false
let acquiredLock = false

const loop = async () => {
  // eslint-disable-next-line no-unmodified-loop-condition
  while (!stopped) {
    if (!acquiredLock) {
      acquiredLock = await locks.acquire('search-page-indexes-loop')
      if (!acquiredLock) {
        await new Promise(resolve => setTimeout(resolve, 5000))
        continue
      }
    }

    const ref = await mongo.searchPageRefs.findOne({ indexingStatus: { $in: ['toIndex', 'toDelete'] } })

    if (!ref) {
      await new Promise(resolve => setTimeout(resolve, 5000))
      continue
    }

    try {
      if (ref.indexingStatus === 'toIndex') {
        await indexPageRef(ref)
        await mongo.searchPageRefs.updateOne(
          { _id: ref._id },
          { $set: { indexingStatus: 'ok', indexedAt: new Date().toISOString() } }
        )
      } else if (ref.indexingStatus === 'toDelete') {
        await deletePageRef(ref)
        await mongo.searchPageRefs.deleteOne({ _id: ref._id })
      }
    } catch (err) {
      internalError('search-page-indexes-worker', err)
    }
  }
  await locks.release('search-page-indexes-loop')
}

export const startWorker = () => {
  loopPromise = loop()
}

export const stopWorker = async () => {
  stopped = true
  await loopPromise
}
