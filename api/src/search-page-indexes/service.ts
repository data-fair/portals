import type { SearchPageRef } from '#types/search-page-ref/index.js'

export const indexPageRef = async (ref: SearchPageRef): Promise<void> => {
  // TODO: Implement indexing logic
  console.log('Indexing page ref:', ref._id)
}

export const deletePageRef = async (ref: SearchPageRef): Promise<void> => {
  // TODO: Implement deletion logic
  console.log('Deleting page ref:', ref._id)
}
