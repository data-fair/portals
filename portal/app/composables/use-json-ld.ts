import type { Account } from '@data-fair/lib-vue/session'
import type { MaybeRefOrGetter } from 'vue'

export interface JsonLdGraph {
  '@context': string | string[]
  '@type': string
  '@id'?: string
  [key: string]: unknown
}

/**
 * Composable to add JSON-LD structured data to pages
 * Supports multiple schemas: DataCatalog, Dataset, WebApplication, CreativeWork, Event, ItemList
 */
export const useJsonLd = (schema: MaybeRefOrGetter<JsonLdGraph | JsonLdGraph[]>) => {
  const rawSchema = toValue(schema)

  // Only add JSON-LD on server-side rendering
  // Don't refresh or duplicate on client-side navigations
  // Because is useless
  if (import.meta.server) {
    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(rawSchema)
        }
      ]
    })
  }
}

/**
 * Create a Dataset schema for JSON-LD
 */
export const createDatasetSchema = (options: {
  id: string
  title: string
  description?: string
  url?: string
  image?: string
  datePublished?: string
  dateModified?: string
  creator?: {
    name: string
    url?: string
  }
  keywords?: string[]
  distribution?: {
    name?: string
    encodingFormat?: string
    contentUrl?: string
  }[]
  temporalCoverage?: string
  spatialCoverage?: string
  isBasedOn?: Array<{ id: string; url: string; name: string }>
  subjectOf?: Array<{ id: string; url: string; name: string; type: 'WebApplication' | 'CreativeWork' }>
}): JsonLdGraph => {
  const schema: JsonLdGraph = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': options.id,
    name: options.title,
    description: options.description || ''
  }

  if (options.url) schema.url = options.url
  if (options.image) schema.image = options.image
  if (options.datePublished) schema.datePublished = options.datePublished
  if (options.dateModified) schema.dateModified = options.dateModified
  if (options.creator) {
    schema.creator = {
      '@type': 'Organization',
      name: options.creator.name,
      ...(options.creator.url && { url: options.creator.url })
    }
  }
  if (options.keywords?.length) schema.keywords = options.keywords.join(', ')
  if (options.distribution?.length) {
    schema.distribution = options.distribution.map(d => ({
      '@type': 'DataDownload',
      name: d.name || 'Dataset distribution',
      encodingFormat: d.encodingFormat,
      contentUrl: d.contentUrl
    }))
  }
  if (options.temporalCoverage) schema.temporalCoverage = options.temporalCoverage
  if (options.spatialCoverage) schema.spatialCoverage = options.spatialCoverage
  if (options.isBasedOn?.length) {
    schema.isBasedOn = options.isBasedOn.map(b => ({
      '@type': 'Dataset',
      '@id': b.id,
      url: b.url,
      name: b.name
    }))
  }
  if (options.subjectOf?.length) {
    schema.subjectOf = options.subjectOf.map(entry => ({
      '@type': entry.type,
      '@id': entry.id,
      url: entry.url,
      name: entry.name
    }))
  }

  return schema
}

/**
 * Create a WebApplication schema for applications
 * Uses isBasedOn to reference related datasets
 */
export const createWebApplicationSchema = (options: {
  id: string
  url: string
  title: string
  description?: string
  createdAt?: string
  updatedAt?: string
  keywords?: string[]
  license?: string
  screenshot?: string
  image?: string
  owner: Account
  datasets?: Array<{ id: string; url: string; name: string }>
}): JsonLdGraph => {
  const schema: JsonLdGraph = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': options.id,
    url: options.url,
    name: options.title,
    description: options.description,

    applicationCategory: 'ReferenceApplication',
    applicationSubCategory: 'DataVisualization',
    operatingSystem: 'All',

    author: {
      '@type': options.owner.type === 'user' ? 'Person' : 'Organization',
      name: options.owner.name
    }
  }

  if (options.createdAt) schema.dateCreated = options.createdAt
  if (options.updatedAt) schema.dateModified = options.updatedAt
  if (options.keywords?.length) schema.keywords = options.keywords.join(', ')
  if (options.license) schema.license = options.license
  if (options.screenshot) schema.screenshot = options.screenshot
  if (options.image && options.image !== options.screenshot) schema.image = options.image

  if (options.datasets?.length) {
    schema.isBasedOn = options.datasets.map(d => ({
      '@type': 'Dataset',
      '@id': d.id,
      url: d.url,
      name: d.name
    }))
  }

  return schema
}

/**
 * Create a CreativeWork schema for reuses
 */
export const createReuseSchema = (options: {
  id: string
  title: string
  description?: string
  url?: string
  image?: string
  datePublished?: string
  dateModified?: string
  author?: {
    name: string
    url?: string
  }
  keywords?: string[]
  basedOnDatasets?: Array<{ id: string; url: string; name: string }>
}): JsonLdGraph => {
  const schema: JsonLdGraph = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': options.id,
    name: options.title,
    description: options.description || ''
  }

  if (options.url) schema.url = options.url
  if (options.image) schema.image = options.image
  if (options.datePublished) schema.datePublished = options.datePublished
  if (options.dateModified) schema.dateModified = options.dateModified
  if (options.author) {
    schema.author = {
      '@type': 'Person',
      name: options.author.name,
      ...(options.author.url && { url: options.author.url })
    }
  }
  if (options.keywords?.length) schema.keywords = options.keywords.join(', ')
  if (options.basedOnDatasets?.length) {
    schema.isBasedOn = options.basedOnDatasets.map(d => ({
      '@type': 'Dataset',
      '@id': d.id,
      url: d.url,
      name: d.name
    }))
  }

  return schema
}

/**
 * Create an Event schema
 */
export const createEventSchema = (options: {
  id: string
  title: string
  description?: string
  url?: string
  image?: string
  startDate: string
  endDate?: string
  location?: string
  organizer?: {
    name: string
    url?: string
  }
}): JsonLdGraph => {
  const schema: JsonLdGraph = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': options.id,
    name: options.title,
    description: options.description || ''
  }

  if (options.url) schema.url = options.url
  if (options.image) schema.image = options.image
  schema.startDate = options.startDate
  if (options.endDate) schema.endDate = options.endDate
  if (options.location) schema.location = options.location
  if (options.organizer) {
    schema.organizer = {
      '@type': 'Organization',
      name: options.organizer.name,
      ...(options.organizer.url && { url: options.organizer.url })
    }
  }

  return schema
}

/**
 * Create a DataCatalog schema for dataset/application catalog pages
 */
export const createDataCatalogSchema = (options: {
  id: string
  title: string
  description?: string
  url?: string
  image?: string
  items?: Array<{ id: string; name: string }>
  creator?: {
    name: string
    url?: string
  }
  datePublished?: string
}): JsonLdGraph => {
  const schema: JsonLdGraph = {
    '@context': 'https://schema.org',
    '@type': 'DataCatalog',
    '@id': options.id,
    name: options.title,
    description: options.description || ''
  }

  if (options.url) schema.url = options.url
  if (options.image) schema.image = options.image
  if (options.items?.length) {
    schema.dataset = options.items.map(item => ({
      '@type': 'Dataset',
      '@id': item.id,
      name: item.name
    }))
  }
  if (options.creator) {
    schema.creator = {
      '@type': 'Organization',
      name: options.creator.name,
      ...(options.creator.url && { url: options.creator.url })
    }
  }
  if (options.datePublished) schema.datePublished = options.datePublished

  return schema
}

/**
 * Create an ItemList schema for list pages (applications, reuses, events)
 * Provide only the initial SSR-fetched items
 */
export const createItemListSchema = (options: {
  id?: string
  title?: string
  numberOfItems: number
  items: Array<{ url: string, name: string }>
}): JsonLdGraph => {
  const schema: JsonLdGraph = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: options.numberOfItems,
    itemListElement: options.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url
    }))
  }
  if (options.id) schema['@id'] = options.id
  if (options.title) schema.name = options.title
  return schema
}

/**
 * Create a BreadcrumbList schema for navigation
 */
export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>): JsonLdGraph => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}
