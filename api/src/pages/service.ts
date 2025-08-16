import type { ImageRef, Page, PageElement } from '#types/page/index.js'
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
  const updatedPage = { ...page, config: page.draftConfig }
  await cleanUnusedImages(updatedPage)
  return updatedPage
}

export const cancelPageDraft = async (page: Page) => {
  debug('cancelPageDraft', page)
  await mongo.pages.updateOne({ _id: page._id }, { $set: { draftConfig: page.config } })
  const updatedPage = { ...page, draftConfig: page.config }
  await cleanUnusedImages(updatedPage)
  return updatedPage
}

const cleanUnusedImages = async (page: Page) => {
  const imageRefs = await getPageImageRefs(page)
  const imagesIds = []
  for (const imageRef of imageRefs) {
    imagesIds.push(imageRef._id)
    if (imageRef.mobileAlt) imagesIds.push(imageRef._id + '-mobile')
  }
  const deleteFilter = {
    'owner.type': page.owner.type,
    'owner.id': page.owner.id,
    'resource.type': 'page',
    'resource._id': page._id,
    _id: { $nin: imagesIds }
  }
  await mongo.images.deleteMany(deleteFilter)
}

const getPageImageRefs = async (page: Page) => {
  const imageRefs: ImageRef[] = []
  await traversePage(page, (pageElement) => {
    if (pageElement.type === 'image' && pageElement.imageRef) imageRefs.push(pageElement.imageRef)
  })
  return imageRefs
}

const traversePage = async (page: Page, callback: (pageElement: PageElement) => Promise<void> | void) => {
  await traversePageElements(page.config.elements, callback)
  await traversePageElements(page.draftConfig.elements, callback)
}

const traversePageElements = async (pageElements: PageElement[] | undefined, callback: (pageElement: PageElement) => Promise<void> | void) => {
  if (!pageElements) return
  for (const element of pageElements) {
    await callback(element)
    if (element.type === 'card') await traversePageElements(element.children, callback)
    if (element.type === 'responsive-flow') {
      for (const block of element.blocks) {
        await traversePageElements(block.children, callback)
      }
    }
    if (element.type === 'tabs') {
      for (const tab of element.tabs) {
        await traversePageElements(tab.children, callback)
      }
    }
    if (element.type === 'two-columns') {
      await traversePageElements(element.children, callback)
      await traversePageElements(element.children2, callback)
    }
  }
}
