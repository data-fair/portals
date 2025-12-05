import type { ImageRef } from '#types/image-ref/index.ts'
import type { Page, PageElement, PageConfig } from '#types/page/index.ts'
import type { Image } from '#types/image/index.js'
import { randomUUID } from 'node:crypto'
import debugModule from 'debug'
import slug from 'slugify'
import { type SessionStateAuthenticated, assertAccountRole, httpError } from '@data-fair/lib-express'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import mongo from '#mongo'

const debug = debugModule('pages')

export const getPageAsContrib = async (sessionState: SessionStateAuthenticated, id: string) => {
  const page = await mongo.pages.findOne({ _id: id })
  if (!page) throw httpError(404, `page "${id}" not found`)
  assertAccountRole(sessionState, page.owner, ['admin', 'contrib'])
  return page
}

/**
 * Duplicate a single image with its mobile variant
 * @param sourceImageId - The ID of the image to duplicate
 * @param newPageId - The ID of the new page
 * @param newOwner - The owner account of the new page
 * @param sessionState - The session state of the user
 * @returns The new image ID
 */
const duplicateImage = async (
  sourceImageId: string,
  newPageId: string,
  newOwner: SessionStateAuthenticated['account'],
  sessionState: SessionStateAuthenticated
): Promise<string> => {
  const sourceImage = await mongo.images.findOne({ _id: sourceImageId })
  if (!sourceImage) {
    debug(`Image ${sourceImageId} not found, skipping`)
    return sourceImageId // Return original ID if image not found
  }

  const newImageId = randomUUID()
  const created = {
    id: sessionState.user.id,
    name: sessionState.user.name,
    date: new Date().toISOString()
  }

  const newImage: Image = {
    ...sourceImage,
    _id: newImageId,
    owner: { ...newOwner, department: undefined, departmentName: undefined },
    resource: {
      type: 'page',
      _id: newPageId
    },
    created
  }

  // Duplicate mobile variant if it exists
  if (newImage.mobileAlt) {
    const sourceMobileImage = await mongo.images.findOne({ _id: sourceImageId + '-mobile' })
    if (sourceMobileImage) {
      const newMobileImage: Image = {
        ...sourceMobileImage,
        _id: newImageId + '-mobile',
        owner: { ...newOwner, department: undefined, departmentName: undefined },
        resource: {
          type: 'page',
          _id: newPageId
        },
        created
      }
      await mongo.images.insertOne(newMobileImage)
    }
  }

  await mongo.images.insertOne(newImage)
  return newImageId
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
        const newImageId = await duplicateImage(imageRef._id, newPageId, newOwner, sessionState)
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

export const createPage = async (page: Page) => {
  debug('createPage', page)
  validateMetadata(page)
  await mongo.pages.insertOne(page)
}

export const patchPage = async (page: Page, patch: Partial<Page>, session: SessionStateAuthenticated) => {
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

  // Handle standard page type publication: auto-switch pages of same type on the same portal
  if (patch.portals && ['home', 'contact', 'privacy-policy', 'accessibility', 'legal-notice', 'cookie-policy', 'terms-of-service', 'datasets', 'applications'].includes(page.type)) {
    const addedPortals = patch.portals.filter(portalId => !page.portals.includes(portalId))
    if (addedPortals.length > 0) {
      await switchStandardPages(page, addedPortals, session)
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
    updated: { id: session.user.id, name: session.user.name, date: new Date().toISOString() }
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
  const updatedPage = await patchPage(page, { config: page.draftConfig, configUpdatedAt: new Date().toISOString() }, session)
  await cleanUnusedImages(updatedPage)
  return updatedPage
}

export const cancelPageDraft = async (page: Page, session: SessionStateAuthenticated) => {
  debug('cancelPageDraft', page)
  const updatedPage = await patchPage(page, { draftConfig: page.config }, session)
  await cleanUnusedImages(updatedPage)
  return updatedPage
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

const switchStandardPages = async (page: Page, addedPortals: string[], session: SessionStateAuthenticated) => {
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
          updated: { id: session.user.id, name: session.user.name, date: new Date().toISOString() }
        }
      }
    )
    debug(`Unpublished ${page.type} page "${conflictingPage._id}" from portals:`, addedPortals)
  }
}
