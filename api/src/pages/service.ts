import type { ImageRef } from '#types/image-ref/index.ts'
import type { Page, PageElement, PageConfig } from '#types/page/index.ts'
import debugModule from 'debug'
import slug from 'slugify'
import { assertAccountRole, httpError, type SessionStateAuthenticated } from '@data-fair/lib-express'
import eventsQueue, { type PushEvent } from '@data-fair/lib-node/events-queue.js'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import { randomUUID } from 'node:crypto'
import mongo from '#mongo'
import { duplicateImage, transferResourceImages } from '../images/service.ts'
import { assertNbPagesLimit } from '../limits/service.ts'
import { assertOwnerPortals } from '../portals/service.ts'
import { traversePageElements, resolvePageAnchors } from './operations.ts'

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

  // Update image references in cloned elements, and give each copied element a fresh uuid.
  await traversePageElements(clonedElements, (el) => {
    if (el.uuid) el.uuid = randomUUID().split('-')[0]
    if (el.type === 'image') {
      updateImageId(el.image)
      updateImageId(el.wideImage)
    } else if (el.type === 'banner') {
      updateImageId(el.background?.image)
    } else if (el.type === 'card') {
      updateImageId(el.background?.image)
      updateImageId(el.thumbnail?.image)
    } else if (el.type === 'dataset-card') {
      updateImageId(el.cardConfig?.thumbnail?.default)
    }
  })

  return clonedElements
}

const catalogElementTypes: Record<string, PageElement['type']> = {
  datasets: 'datasets-catalog',
  applications: 'applications-catalog',
  reuses: 'reuses-catalog',
  'event-catalog': 'event-catalog',
  'news-catalog': 'news-catalog'
}

// without filters a new catalog shows no search bar, and the option to add one is hard to find
const catalogDefaultFilters: Record<string, string[]> = {
  'event-catalog': ['search', 'include-past', 'sort']
}

export const initCatalogPageElements = (pageType: string): PageElement[] | null => {
  const elementType = catalogElementTypes[pageType]
  if (!elementType) return null
  const items = catalogDefaultFilters[pageType] ?? ['search', 'sort']
  return [{ type: elementType, filters: { position: 'top', items } } as PageElement]
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

// the pages a portal has at most one of
const standardPageTypes = ['home', 'contact', 'accessibility', 'terms-of-service', 'legal-notice', 'privacy-policy', 'cookie-policy', 'datasets', 'applications', 'reuses', 'event-catalog', 'news-catalog']

// a 409 with a user-friendly message when a slug already exists, instead of the raw mongo error
const throwSlugConflict = (err: any) => {
  if (err.code !== 11000) return
  const indexName: string = err.message.match(/index: ([^\s]+)/)?.[1] ?? ''
  if (indexName.includes('event-slug')) {
    throw httpError(409, 'An event page with this slug already exists for this owner')
  } else if (indexName.includes('news-slug')) {
    throw httpError(409, 'A news page with this slug already exists for this owner')
  } else if (indexName.includes('generic-slug')) {
    throw httpError(409, 'A generic page with this slug already exists for this owner')
  }
}

export const createPage = async (page: Page, sourcePageId?: string) => {
  debug('createPage', page)
  validateMetadata(page)
  await assertOwnerPortals(page.owner, page.portals)
  // text blocks display their rendered _html: a page created with content showed empty blocks
  // until its draft was first edited
  await renderMarkdownElements(page.config)
  if (page.draftConfig !== page.config) await renderMarkdownElements(page.draftConfig)
  page.config._toc = await resolvePageAnchors(page.config)
  try {
    await mongo.pages.insertOne(page)
  } catch (err: any) {
    throwSlugConflict(err)
    throw err
  }
  // as a PATCH of its portals: a standard page created on portals replaces the page of its type
  // there, instead of leaving two home pages that alternate
  const standardReplacements = (page.portals.length && standardPageTypes.includes(page.type))
    ? await switchStandardPages(page, page.portals)
    : {}

  const details = [{ en: `Type: ${page.type}`, fr: `Type : ${page.type}` }]
  if (page.type === 'generic' && page.config.genericMetadata?.group) {
    const group = page.config.genericMetadata.group.title
    details.push({ en: `Group: ${group}`, fr: `Groupe : ${group}` })
  }
  // Duplication info
  if (sourcePageId) {
    const sourcePage = await mongo.pages.findOne({ _id: sourcePageId })
    if (sourcePage?.isReference) {
      details.push({
        en: `Duplicated from the reference page "${sourcePage.title}" (${sourcePageId})`,
        fr: `Dupliquée depuis la page de référence "${sourcePage.title}" (${sourcePageId})`
      })
    } else if (sourcePage) {
      details.push({
        en: `Duplicated from the page "${sourcePage.title}" (${sourcePageId})`,
        fr: `Dupliquée depuis la page "${sourcePage.title}" (${sourcePageId})`
      })
    }
  }
  for (const [portalId, titles] of Object.entries(standardReplacements)) {
    for (const title of titles) {
      details.push({
        en: `The page "${title}" was replaced by the page "${page.title}" on the portal: ${portalId}`,
        fr: `La page "${title}" a été remplacée par la page "${page.title}" sur le portail : ${portalId}`
      })
    }
  }

  return { en: details.map(d => d.en).join('; '), fr: details.map(d => d.fr).join('; ') }
}

export const patchPage = async (page: Page, patch: Partial<Page>, session: SessionStateAuthenticated, skipEvents = false) => {
  validateMetadata(page, patch)
  if (patch.draftConfig) {
    await renderMarkdownElements(patch.draftConfig)
    patch.draftConfig._toc = await resolvePageAnchors(patch.draftConfig)
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
  // only the added ones: a transferred page may keep the ids of its former owner's portals
  await assertOwnerPortals(patch.owner ?? page.owner, addedPortals)
  let replacedPages: Record<string, string[]> = {}

  // Handle standard page type publication: auto-switch pages of same type on the same portal
  if (patch.portals && standardPageTypes.includes(page.type)) {
    if (addedPortals.length > 0) {
      // the pages of the owner it will have: a transfer and an attachment can come in one PATCH
      replacedPages = await switchStandardPages({ ...page, owner: patch.owner ?? page.owner }, addedPortals)
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
    if (patch.owner.type !== page.owner.type || patch.owner.id !== page.owner.id) await assertNbPagesLimit(patch.owner)
    await transferResourceImages({ type: 'page', _id: page._id }, page.owner, patch.owner)
  }

  const fullPatch = {
    ...patch,
    updatedAt: new Date().toISOString()
  }
  const updatedPage = { ...page, ...fullPatch }

  try {
    await mongo.pages.updateOne({ _id: page._id }, { $set: fullPatch })
  } catch (err: any) {
    throwSlugConflict(err)
    throw err
  }

  // Send events
  const onlyDraftChanged = Object.keys(patch).length === 1 && patch.draftConfig
  if (!onlyDraftChanged && !skipEvents) {
    const hasOtherChanges = Object.keys(patch).some(key => key !== 'portals' && key !== 'draftConfig')

    // Publish events for added portals
    for (const portalId of addedPortals) {
      const replaced = replacedPages[portalId]
      const publishBody = replaced
        ? {
            en: replaced.map(title => `The page "${title}" was replaced by the page "${page.title}" on the portal: ${portalId}`).join(' | '),
            fr: replaced.map(title => `La page "${title}" a été remplacée par la page "${page.title}" sur le portail : ${portalId}`).join(' | ')
          }
        : {
            en: `The page was published on the portal: ${portalId}`,
            fr: `La page a été publiée sur le portail : ${portalId}`
          }
      sendPageEvent(updatedPage, 'publish', session, publishBody)
    }

    // Unpublish events for removed portals
    for (const portalId of removedPortals) {
      sendPageEvent(updatedPage, 'unpublish', session, {
        en: `The page was unpublished from the portal: ${portalId}`,
        fr: `La page a été dépubliée du portail : ${portalId}`
      })
    }

    // Generic patch event only if other fields changed beyond portals/draft
    if (hasOtherChanges) {
      sendPageEvent(updatedPage, 'patch', session)
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
  sendPageEvent(page, 'draft-validate', session)
  return updatedPage
}

export const cancelPageDraft = async (page: Page, session: SessionStateAuthenticated) => {
  debug('cancelPageDraft', page)
  const updatedPage = await patchPage(page, { draftConfig: page.config }, session, true)
  await cleanUnusedImages(updatedPage)
  sendPageEvent(page, 'draft-discard', session)
  return updatedPage
}

const pageTitles = {
  create: (title: string) => ({ en: `The page ${title} was created`, fr: `La page ${title} a été créée` }),
  patch: (title: string) => ({ en: `The page ${title} was updated`, fr: `La page ${title} a été modifiée` }),
  delete: (title: string) => ({ en: `The page ${title} was deleted`, fr: `La page ${title} a été supprimée` }),
  publish: (title: string) => ({ en: `The page ${title} was published on a portal`, fr: `La page ${title} a été publiée sur un portail` }),
  unpublish: (title: string) => ({ en: `The page ${title} was unpublished from a portal`, fr: `La page ${title} a été dépubliée d'un portail` }),
  'draft-validate': (title: string) => ({ en: `The draft of the page ${title} was validated`, fr: `Le brouillon de la page ${title} a été validé` }),
  'draft-discard': (title: string) => ({ en: `The draft of the page ${title} was discarded`, fr: `Le brouillon de la page ${title} a été annulé` })
}

/**
 * Send an event about a page.
 * @param topicAction The action part of the topic key, it also selects the event title
 * @param body Details of the event
 */
export const sendPageEvent = (
  page: Page,
  topicAction: keyof typeof pageTitles,
  sessionState?: SessionStateAuthenticated,
  body?: PushEvent['body']
) => {
  eventsQueue.pushEvent({
    title: pageTitles[topicAction](page.title),
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
  if (page.config.thumbnail) imageRefs.push(page.config.thumbnail)
  if (page.draftConfig.thumbnail) imageRefs.push(page.draftConfig.thumbnail)

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
    if (pageElement.type === 'contact' && pageElement.bodyTemplate) {
      pageElement.bodyTemplate_html = renderMarkdown(pageElement.bodyTemplate)
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
    if (pageElement.type === 'card' && pageElement.thumbnail?.image) imageRefs.push(pageElement.thumbnail.image)
    if (pageElement.type === 'datasets-list' && pageElement.cardConfig?.thumbnail?.default) imageRefs.push(pageElement.cardConfig.thumbnail.default)
    if (pageElement.type === 'dataset-card' && pageElement.cardConfig?.thumbnail?.default) imageRefs.push(pageElement.cardConfig.thumbnail.default)
  })
  return imageRefs
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

/** Unpublish the pages of the same type from the added portals, returns their titles by portal. */
const switchStandardPages = async (page: Page, addedPortals: string[]) => {
  const replacedPages: Record<string, string[]> = {}

  // Find other pages of the same type already published on these portals, of the same owner
  // (type and id: a department page can replace the organization's one) — the portals ids are
  // checked by assertOwnerPortals, this keeps the detachment within the owner whatever happens
  const conflictingPages = await mongo.pages.find({
    _id: { $ne: page._id },
    'owner.type': page.owner.type,
    'owner.id': page.owner.id,
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
        replacedPages[portalId] ??= []
        replacedPages[portalId].push(conflictingPage.title)
      }
    }
  }

  return replacedPages
}
