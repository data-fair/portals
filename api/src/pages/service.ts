import type { Page } from '#types/page/index.js'
import mongo from '#mongo'
import debugModule from 'debug'
import { type SessionStateAuthenticated, assertAccountRole, httpError } from '@data-fair/lib-express'

const debug = debugModule('pages')

export const getPageAsAdmin = async (sessionState: SessionStateAuthenticated, id: string) => {
  const page = await mongo.pages.findOne({ _id: id })
  if (!page) throw httpError(404, `page "${id}" not found`)
  assertAccountRole(sessionState, page.owner, 'admin')
  return page
}

export const createPage = async (page: Page) => {
  debug('createPage', page)
  await mongo.pages.insertOne(page)
}

export const patchPage = async (page: Page, patch: Partial<Page>, session: SessionStateAuthenticated) => {
  await mongo.pages.updateOne({ _id: page._id }, {
    $set: {
      ...patch,
      updated: { id: session.user.id, name: session.user.name, date: new Date().toISOString() }
    }
  })
}

export const validatePageDraft = async (page: Page) => {
  debug('validatePageDraft', page)
  await mongo.pages.updateOne({ _id: page._id }, { $set: { config: page.draftConfig } })
}

export const cancelPageDraft = async (page: Page) => {
  debug('cancelPageDraft', page)
  await mongo.pages.updateOne({ _id: page._id }, { $set: { draftConfig: page.config } })
}
