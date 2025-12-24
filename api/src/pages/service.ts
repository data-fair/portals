import type { ImageRef } from '#types/image-ref/index.ts'
import type { Page, PageElement, PageConfig } from '#types/page/index.ts'
import debugModule from 'debug'
import slug from 'slugify'
import { assertAccountRole, httpError, type SessionStateAuthenticated } from '@data-fair/lib-express'
import eventsQueue from '@data-fair/lib-node/events-queue.js'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import mongo from '#mongo'
import config from '#config'
import { duplicateImage } from '../images/service.ts'

const debug = debugModule('pages')

export const getPageAsContrib = async (sessionState: SessionStateAuthenticated, id: string) => {
  const page = await mongo.pages.findOne({ _id: id })
  if (!page) throw httpError(404, `page "${id}" not found`)
  assertAccountRole(sessionState, page.owner, ['admin', 'contrib'])
  return page
}

/**
 * Duplicate page elements with images duplication
 * @param sessionState - The session state of the user
 * @param sourcePageId - The ID of the page to duplicate
 * @param newPageId - The ID of the new page
 * @param newOwner - The owner account of the new page
 * @returns The duplicated elements with new image references
 */
export const duplicatePageElements = async (
  sessionState: SessionStateAuthenticated,
  sourcePageId: string,
  newPageId: string,
  newOwner: SessionStateAuthenticated['account']
): Promise<PageElement[]> => {
  debug('duplicatePageElements', sourcePageId, newPageId)

  // Get source page
  const sourcePage = await mongo.pages.findOne({ _id: sourcePageId })
  if (!sourcePage) throw httpError(404, `source page "${sourcePageId}" not found`)

  if (!sourcePage.isReference) assertAccountRole(sessionState, sourcePage.owner, 'admin')

  const clonedElements = JSON.parse(JSON.stringify(sourcePage.config.elements)) as PageElement[]

  const imageIdMap = new Map<string, string>()
  const imageRefs = await getElementsImageRefs(clonedElements)

  // Duplicate all unique images
  await Promise.all(
    imageRefs.map(async (imageRef) => {
      if (!imageIdMap.has(imageRef._id)) {
        const newImageId = await duplicateImage(imageRef._id, 'page', newPageId, newOwner)
        imageIdMap.set(imageRef._id, newImageId)
      }
    })
  )

  const updateImageId = (image?: { _id: string }) => {
    if (image && imageIdMap.has(image._id)) {
      image._id = imageIdMap.get(image._id)!
    }
  }

  // Update image references in cloned elements
  await traversePageElements(clonedElements, (el) => {
    if (el.type === 'image') {
      updateImageId(el.image)
      updateImageId(el.wideImage)
    } else if (el.type === 'banner' || el.type === 'card') {
      updateImageId(el.background?.image)
    } else if (el.type === 'dataset-card') {
      updateImageId(el.cardConfig?.thumbnail?.default)
    }
  })

  return clonedElements
}

export const generateUniqueSlug = async (baseTitle: string, pageType: 'event' | 'news' | 'generic', owner: { type: string, id: string }) => {
  const metadataKey = pageType + 'Metadata'
  const baseSlug = slug.default(baseTitle, { lower: true, strict: true })
  let uniqueSlug = baseSlug
  let counter = 1

  // Check if slug already exists for this owner
  while (true) {
    const query = {
      'owner.type': owner.type,
      'owner.id': owner.id,
      [`config.${metadataKey}.slug`]: uniqueSlug
    }
    const existing = await mongo.pages.findOne(query)
    if (!existing) break
    uniqueSlug = `${baseSlug}-${counter}`
    counter++
  }

  return uniqueSlug
}

export const createPage = async (page: Page, sourcePageId?: string) => {
  debug('createPage', page)
  validateMetadata(page)
  await mongo.pages.insertOne(page)

  const details: string[] = []
  details.push(`Type: ${page.type}`)
  if (page.type === 'generic' && page.config.genericMetadata?.group) {
    details.push(`Groupe: ${page.config.genericMetadata.group.title}`)
  }
  // Duplication info
  if (sourcePageId) {
    const sourcePage = await mongo.pages.findOne({ _id: sourcePageId })
    if (sourcePage?.isReference) {
      details.push(`Dupliquée depuis la page de référence "${sourcePage.title}" (${sourcePageId})`)
    } else if (sourcePage) {
      details.push(`Dupliquée depuis la page "${sourcePage.title}" (${sourcePageId})`)
    }
  }

  return details.join('; ')
}

export const patchPage = async (page: Page, patch: Partial<Page>, session: SessionStateAuthenticated, skipEvents = false) => {
  validateMetadata(page, patch)
  if (patch.draftConfig) {
    await renderMarkdownElements(patch.draftConfig)
  }

  // Check if trying to unpublish a home page
  if (patch.portals && page.type === 'home') {
    const removedPortals = page.portals.filter(portalId => !patch.portals!.includes(portalId))
    if (removedPortals.length > 0) {
      throw httpError(400, 'You cannot unpublish home page')
    }
  }

  // Track portal additions/removals
  const addedPortals = patch.portals ? patch.portals.filter(portalId => !page.portals.includes(portalId)) : []
  const removedPortals = patch.portals ? page.portals.filter(portalId => !patch.portals!.includes(portalId)) : []
  let standardReplacements: Record<string, string> = {}

  // Handle standard page type publication: auto-switch pages of same type on the same portal
  if (patch.portals && ['home', 'contact', 'privacy-policy', 'accessibility', 'legal-notice', 'cookie-policy', 'terms-of-service', 'datasets', 'applications'].includes(page.type)) {
    if (addedPortals.length > 0) {
      standardReplacements = await switchStandardPages(page, addedPortals)
    }
  }

  // If title is empty string, sync with config title
  if (patch.title === '') {
    patch.title = patch.config?.title || page.config.title
  } else if (patch.config?.title && page.title === page.config.title) {
    // If current page title matches current config title, sync them
    patch.title = patch.config.title
  }

  if (patch.owner) {
    assertAccountRole(session, page.owner, 'admin')
    assertAccountRole(session, patch.owner, 'admin')
    await mongo.images.updateMany(
      {
        'owner.type': page.owner.type,
        'owner.id': page.owner.id,
        'resource.type': 'page',
        'resource._id': page._id
      },
      {
        $set: {
          'owner.type': patch.owner.type,
          'owner.id': patch.owner.id
        }
      }
    )
  }

  const fullPatch = {
    ...patch,
    updatedAt: new Date().toISOString()
  }
  const updatedPage = { ...page, ...fullPatch }

  try {
    await mongo.pages.updateOne({ _id: page._id }, { $set: fullPatch })
  } catch (err: any) {
    // Throw a 409 error with a user-friendly message when a slug already exists
    if (err.code === 11000) {
      const indexMatch = err.message.match(/index: ([^\s]+)/)
      const indexName = indexMatch ? indexMatch[1] : ''
      if (indexName.includes('event-slug')) {
        throw httpError(409, 'An event page with this slug already exists for this owner')
      } else if (indexName.includes('news-slug')) {
        throw httpError(409, 'A news page with this slug already exists for this owner')
      } else if (indexName.includes('generic-slug')) {
        throw httpError(409, 'A generic page with this slug already exists for this owner')
      }
    }
    throw err
  }

  // Send events
  const onlyDraftChanged = Object.keys(patch).length === 1 && patch.draftConfig
  if (!onlyDraftChanged && !skipEvents) {
    const hasOtherChanges = Object.keys(patch).some(key => key !== 'portals' && key !== 'draftConfig')

    // Publish events for added portals
    for (const portalId of addedPortals) {
      const publishBody = standardReplacements[portalId] || `La page a été publiée sur le portail : ${portalId}`
      sendPageEvent(updatedPage, 'a été publiée sur un portail', 'publish', session, publishBody)
    }

    // Unpublish events for removed portals
    for (const portalId of removedPortals) {
      sendPageEvent(updatedPage, "a été dépubliée d'un portail", 'unpublish', session, `La page a été dépubliée du portail : ${portalId}`)
    }

    // Generic patch event only if other fields changed beyond portals/draft
    if (hasOtherChanges) {
      sendPageEvent(updatedPage, 'a été modifiée', 'patch', session)
    }
  }

  return updatedPage
}

export const deletePage = async (page: Page) => {
  await mongo.images.deleteMany({
    'owner.type': page.owner.type,
    'owner.id': page.owner.id,
    'resource.type': 'page',
    'resource._id': page._id
  })
  await mongo.pages.deleteOne({ _id: page._id })
}

export const validatePageDraft = async (page: Page, session: SessionStateAuthenticated) => {
  debug('validatePageDraft', page)
  const updatedPage = await patchPage(page, { config: page.draftConfig, configUpdatedAt: new Date().toISOString() }, session, true)
  await cleanUnusedImages(updatedPage)
  sendPageEvent(page, 'a été validé', 'draft-validate', session)
  return updatedPage
}

export const cancelPageDraft = async (page: Page, session: SessionStateAuthenticated) => {
  debug('cancelPageDraft', page)
  const updatedPage = await patchPage(page, { draftConfig: page.config }, session, true)
  await cleanUnusedImages(updatedPage)
  sendPageEvent(page, 'a été annulé', 'draft-discard', session)
  return updatedPage
}

/**
 * Helper function to send events related to pages
 * @param page The page object
 * @param actionText The text describing the action (e.g. "a été créé")
 * @param topicAction The action part of the topic key (e.g. "create", "delete")
 * @param sessionState Optional session state for authentication
 * @param body Optional additional information to include in the event
 */
export const sendPageEvent = (
  page: Page,
  actionText: string,
  topicAction: string,
  sessionState?: SessionStateAuthenticated,
  body?: string
) => {
  if (!config.privateEventsUrl && !config.secretKeys.events) return

  const title = topicAction.includes('draft-')
    ? `Le brouillon de la page ${page.title} ${actionText}`
    : `La page ${page.title} ${actionText}`

  eventsQueue.pushEvent({
    title,
    topic: { key: `pages:page-${topicAction}:${page._id}` },
    sender: page.owner,
    resource: {
      type: 'page',
      id: page._id,
      title: page.title,
    },
    body
  }, sessionState)
}

const cleanUnusedImages = async (page: Page) => {
  const imageRefs = [
    ...await getElementsImageRefs(page.config.elements),
    ...await getElementsImageRefs(page.draftConfig.elements)
  ]
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

const renderMarkdownElements = async (pageConfig: PageConfig) => {
  await traversePageElements(pageConfig.elements, async pageElement => {
    if (pageElement.type === 'text' || pageElement.type === 'alert') {
      pageElement._html = pageElement.content && renderMarkdown(pageElement.content)
    }
  })
}

const getElementsImageRefs = async (pageElements: PageElement[]) => {
  const imageRefs: ImageRef[] = []
  await traversePageElements(pageElements, (pageElement) => {
    if (pageElement.type === 'image' && pageElement.image) imageRefs.push(pageElement.image)
    if (pageElement.type === 'image' && pageElement.wideImage) imageRefs.push(pageElement.wideImage)
    if (pageElement.type === 'banner' && pageElement.background?.image) imageRefs.push(pageElement.background.image)
    if (pageElement.type === 'card' && pageElement.background?.image) imageRefs.push(pageElement.background.image)
    if (pageElement.type === 'datasets-list' && pageElement.cardConfig?.thumbnail?.default) imageRefs.push(pageElement.cardConfig.thumbnail.default)
    if (pageElement.type === 'dataset-card' && pageElement.cardConfig?.thumbnail?.default) imageRefs.push(pageElement.cardConfig.thumbnail.default)
  })
  return imageRefs
}

const traversePageElements = async (pageElements: PageElement[] | undefined, callback: (pageElement: PageElement) => Promise<void> | void) => {
  if (!pageElements) return
  for (const element of pageElements) {
    await callback(element)
    if (element.type === 'card') await traversePageElements(element.children, callback)
    if (element.type === 'banner') await traversePageElements(element.children, callback)
    if (element.type === 'responsive-grid') await traversePageElements(element.children, callback)

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

const validateMetadata = (page: Page, patch?: Partial<Page>) => {
  if (['event', 'news', 'generic'].includes(page.type) && (patch ?? page).draftConfig) {
    const metadataKey = `${page.type}Metadata` as 'eventMetadata' | 'newsMetadata' | 'genericMetadata'
    const metadata = (patch?.draftConfig ?? page.config)[metadataKey]

    // Check if metadata exists
    if (!metadata) throw httpError(400, `Pages of type "${page.type}" must have ${metadataKey}`)

    // Validate slug format
    const validSlug = slug.default(metadata.slug, { lower: true, strict: true })
    if (metadata.slug !== validSlug) throw httpError(400, `Invalid slug "${metadata.slug}". An accepted format is: "${validSlug}"`)
  }
}

const switchStandardPages = async (page: Page, addedPortals: string[]): Promise<Record<string, string>> => {
  const replacements: Record<string, string> = {}

  // Find other pages of the same type already published on these portals
  const conflictingPages = await mongo.pages.find({
    _id: { $ne: page._id },
    type: page.type,
    portals: { $in: addedPortals }
  }).toArray()

  // Unpublish conflicting pages from the added portals
  for (const conflictingPage of conflictingPages) {
    const newPortals = conflictingPage.portals.filter(portalId => !addedPortals.includes(portalId))
    await mongo.pages.updateOne(
      { _id: conflictingPage._id },
      {
        $set: {
          portals: newPortals,
          updatedAt: new Date().toISOString()
        }
      }
    )
    debug(`Unpublished ${page.type} page "${conflictingPage._id}" from portals:`, addedPortals)

    for (const portalId of addedPortals) {
      if (conflictingPage.portals.includes(portalId)) {
        const message = `La page "${conflictingPage.title}" a été remplacée par la page "${page.title}" sur le portail : ${portalId}`
        replacements[portalId] = replacements[portalId]
          ? `${replacements[portalId]} | ${message}`
          : message
      }
    }
  }

  return replacements
}
