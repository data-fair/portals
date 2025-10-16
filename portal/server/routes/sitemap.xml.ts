import type { MenuItem, LinkItem } from '#api/types/portal'
import type { Page } from '#api/types/page'
import type { RequestPortal } from '~~/server/middleware/get-portal'

import { portalMongo } from '~~/server/plugins/mongo'

interface SitemapUrl {
  loc: string
  lastmod?: string
  priority: string
}

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const requestURL = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true })
  const baseUrl = requestURL.origin

  const sitemapUrls: SitemapUrl[] = []

  // Helper function to format date to ISO 8601 (required for sitemap)
  const formatDate = (date: string | Date | undefined): string | undefined => {
    if (!date) return undefined
    return new Date(date).toISOString().split('T')[0]
  }

  // Helper function to create full URL
  const fullUrl = (path: string): string => { return baseUrl + path }

  // Helper function to resolve link from menu item
  const resolveLink = (item: MenuItem | LinkItem): string | undefined => {
    switch (item.type) {
      case 'standard': {
        switch (item.subtype) {
          case 'home': return '/'
          case 'datasets': return '/datasets'
          case 'applications': return '/applications'
          case 'contact': return '/contact'
          case 'privacy-policy': return '/privacy-policy'
          default: return undefined
        }
      }
      case 'event': {
        const slug = item.pageRef?.slug
        if (!slug) return undefined
        return `/events/${slug}`
      }
      case 'news': {
        const slug = item.pageRef?.slug
        if (!slug) return undefined
        return `/news/${slug}`
      }
      case 'generic': {
        const slug = item.pageRef?.slug
        if (!slug) return undefined
        const groupSlug = item.pageRef?.group?.slug
        if (groupSlug) {
          return `/groups/${groupSlug}/pages/${slug}`
        }
        return `/pages/${slug}`
      }
      default:
        return undefined
    }
  }

  // Collect all internal paths from menu items recursively
  const collectMenuPaths = (items: (MenuItem | LinkItem)[], priority: number = 0.8): SitemapUrl[] => {
    const urls: SitemapUrl[] = []

    const processItem = (item: MenuItem | LinkItem, currentPriority: number) => {
      if (item.type === 'submenu' && 'children' in item && item.children) {
        // Process children with slightly lower priority
        item.children.forEach(child => processItem(child, Math.max(currentPriority - 0.1, 0.5)))
      } else if (item.type !== 'external') {
        const path = resolveLink(item)
        if (path) {
          urls.push({
            loc: fullUrl(path),
            priority: currentPriority.toFixed(1)
          })
        }
      }
    }

    items.forEach(item => processItem(item, priority))
    return urls
  }

  // Home page - highest priority
  // Check if there's a custom home page
  const homePage = await portalMongo.pages.findOne<Pick<Page, 'configUpdatedAt'>>(
    {
      type: 'home',
      'owner.type': portal.owner.type,
      'owner.id': portal.owner.id,
      [portal.staging ? 'requestedPortals' : 'portals']: portal._id
    },
    { projection: { configUpdatedAt: 1 } }
  )
  sitemapUrls.push({
    loc: fullUrl('/'),
    lastmod: homePage?.configUpdatedAt ? formatDate(homePage.configUpdatedAt) : undefined,
    priority: '1.0'
  })

  // Add main navigation pages
  const navigationUrls = collectMenuPaths(portal.config.menu.children, 0.8)
  sitemapUrls.push(...navigationUrls)

  // Add footer links
  if (portal.config.footer.links) {
    const footerUrls = collectMenuPaths(portal.config.footer.links, 0.6)
    sitemapUrls.push(...footerUrls)
  }

  // Add footer important links
  if (portal.config.footer.importantLinks) {
    const footerImportantUrls = collectMenuPaths(portal.config.footer.importantLinks, 0.7)
    sitemapUrls.push(...footerImportantUrls)
  }

  // Fetch and add event pages with their update dates
  const eventsResponse = await portalMongo.pages.find<Pick<Page, 'config' | 'configUpdatedAt'>>(
    {
      type: 'event',
      'owner.type': portal.owner.type,
      'owner.id': portal.owner.id,
      [portal.staging ? 'requestedPortals' : 'portals']: portal._id
    },
    { projection: { config: 1, configUpdatedAt: 1 }, limit: 1000 }
  ).toArray()

  for (const event of eventsResponse) {
    if (event.config.eventMetadata?.slug) {
      sitemapUrls.push({
        loc: fullUrl(`/events/${event.config.eventMetadata.slug}`),
        lastmod: event.configUpdatedAt ? formatDate(event.configUpdatedAt) : undefined,
        priority: '0.5'
      })
    }
  }

  // Fetch and add news pages with their update dates
  const newsResponse = await portalMongo.pages.find<Pick<Page, 'config' | 'configUpdatedAt'>>(
    {
      type: 'news',
      'owner.type': portal.owner.type,
      'owner.id': portal.owner.id,
      [portal.staging ? 'requestedPortals' : 'portals']: portal._id
    },
    { projection: { config: 1, configUpdatedAt: 1 }, limit: 1000 }
  ).toArray()

  for (const news of newsResponse) {
    if (news.config.newsMetadata?.slug) {
      sitemapUrls.push({
        loc: fullUrl(`/news/${news.config.newsMetadata.slug}`),
        lastmod: news.configUpdatedAt ? formatDate(news.configUpdatedAt) : undefined,
        priority: '0.5'
      })
    }
  }

  // Fetch and add datasets published on this portal
  const datasetsResponse = await $fetch<{ count: number, results: Array<{ slug: string; updatedAt: string }> }>(
    baseUrl + '/data-fair/api/v1/datasets',
    {
      query: {
        select: 'slug,updatedAt',
        size: 1000,
        publicationSites: `data-fair-portals:${portal._id}`
      }
    }
  )

  if (datasetsResponse?.results) {
    for (const dataset of datasetsResponse.results) {
      if (dataset.slug) {
        sitemapUrls.push({
          loc: fullUrl(`/datasets/${dataset.slug}`),
          lastmod: dataset.updatedAt ? formatDate(dataset.updatedAt) : undefined,
          priority: '0.6'
        })
      }
    }
  }

  // Fetch and add applications published on this portal
  const applicationsResponse = await $fetch<{ count: number, results: Array<{ slug: string; updatedAt: string }> }>(
    baseUrl + '/data-fair/api/v1/applications',
    {
      query: {
        select: 'slug,updatedAt',
        size: 1000,
        publicationSites: `data-fair-portals:${portal._id}`
      }
    }
  )

  if (applicationsResponse?.results) {
    for (const application of applicationsResponse.results) {
      if (application.slug) {
        sitemapUrls.push({
          loc: fullUrl(`/applications/${application.slug}`),
          lastmod: application.updatedAt ? formatDate(application.updatedAt) : undefined,
          priority: '0.6'
        })
      }
    }
  }

  // Add contact page if it exists
  const contactPage = await portalMongo.pages.findOne<Pick<Page, 'configUpdatedAt'>>(
    {
      type: 'contact',
      'owner.type': portal.owner.type,
      'owner.id': portal.owner.id,
      [portal.staging ? 'requestedPortals' : 'portals']: portal._id
    },
    { projection: { configUpdatedAt: 1 } }
  )
  if (contactPage) {
    sitemapUrls.push({
      loc: fullUrl('/contact'),
      lastmod: contactPage.configUpdatedAt ? formatDate(contactPage.configUpdatedAt) : undefined,
      priority: '0.5'
    })
  }

  // Add privacy policy page if it exists
  const privacyPage = await portalMongo.pages.findOne<Pick<Page, 'configUpdatedAt'>>(
    {
      type: 'privacy-policy',
      'owner.type': portal.owner.type,
      'owner.id': portal.owner.id,
      [portal.staging ? 'requestedPortals' : 'portals']: portal._id
    },
    { projection: { configUpdatedAt: 1 } }
  )
  if (privacyPage) {
    sitemapUrls.push({
      loc: fullUrl('/privacy-policy'),
      lastmod: privacyPage.configUpdatedAt ? formatDate(privacyPage.configUpdatedAt) : undefined,
      priority: '0.3'
    })
  }

  // Add sitemap page
  sitemapUrls.push({
    loc: fullUrl('/sitemap'),
    priority: '0.4'
  })

  // Remove duplicates (keep first occurrence with highest priority)
  const uniqueUrls = new Map<string, SitemapUrl>()
  for (const url of sitemapUrls) {
    if (!uniqueUrls.has(url.loc) || parseFloat(url.priority) > parseFloat(uniqueUrls.get(url.loc)!.priority)) {
      uniqueUrls.set(url.loc, url)
    }
  }
  const finalUrls = Array.from(uniqueUrls.values())

  // Sort by priority (highest first), then by URL
  finalUrls.sort((a, b) => {
    const priorityDiff = parseFloat(b.priority) - parseFloat(a.priority)
    return priorityDiff !== 0 ? priorityDiff : a.loc.localeCompare(b.loc)
  })

  // Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  for (const url of finalUrls) {
    xml += '  <url>\n'
    xml += `    <loc>${url.loc}</loc>\n`
    if (url.lastmod) {
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`
    }
    xml += `    <priority>${url.priority}</priority>\n`
    xml += '  </url>\n'
  }

  xml += '</urlset>'

  // Set correct content type
  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return xml
})
