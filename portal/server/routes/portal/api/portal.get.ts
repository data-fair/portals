import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import type { MenuItem, LinkItem } from '#api/types/portal-config'
import { portalMongo } from '~~/server/plugins/mongo'
import { session } from '~~/server/plugins/session'
import { buildPortalPagePermissionQuery } from '~~/server/utils/page-permissions'

// Slug-based page types (identified by type + slug in the DB)
type PageWithSlug = Extract<MenuItem | LinkItem, { type: 'event' | 'news' | 'generic' }>
const SLUG_TYPES = new Set(['event', 'news', 'generic'])

// Standard subtypes that are built-in routes, not stored as DB pages
const BUILTIN_SUBTYPES = new Set(['sitemap', 'catalog-api-doc'])

// Extract slug from a page link safely
const getSlug = (link: MenuItem | LinkItem): string | undefined => {
  if (SLUG_TYPES.has(link.type)) return (link as PageWithSlug).pageRef?.slug
}

// Check if a link points to an accessible page
const isAccessible = (link: MenuItem | LinkItem, accessibleStandard: Set<string>, accessibleSlugs: Set<string>): boolean => {
  // Non-page link types are always accessible
  if (link.type === 'external' || link.type === 'submenu') return true

  // Standard links: built-in routes bypass permissions, others require an accessible page
  if (link.type === 'standard' && 'subtype' in link) {
    return BUILTIN_SUBTYPES.has(link.subtype) || accessibleStandard.has(link.subtype)
  }

  // Slug-based links: accessible if no slug set or if the page was found accessible
  const slug = getSlug(link)
  if (slug) return accessibleSlugs.has(`${link.type}/${slug}`)

  return true
}

const filterLinks = <T extends MenuItem | LinkItem>(
  links: T[] | undefined,
  accessibleStandard: Set<string>,
  accessibleSlugs: Set<string>
): T[] => {
  return (links ?? []).flatMap((link) => {
    if (!isAccessible(link, accessibleStandard, accessibleSlugs)) return []

    if (link.type === 'submenu' && 'children' in link) {
      const children = filterLinks(link.children as MenuItem[], accessibleStandard, accessibleSlugs)
      return children.length > 0 ? [{ ...link, children }] : []
    }

    return [link]
  })
}

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const config = portal.config

  const sessionState = await session.readStateFromCookie(getRequestHeader(event, 'cookie'))
  const permissionQuery = buildPortalPagePermissionQuery(sessionState, portal.owner)

  const baseQuery = {
    'owner.type': portal.owner.type,
    'owner.id': portal.owner.id,
    [portal.staging ? 'requestedPortals' : 'portals']: portal._id,
    ...permissionQuery
  }

  // Query all accessible pages for this portal and build lookup sets
  const pages = await portalMongo.pages
    .find(baseQuery, {
      projection: {
        type: 1,
        'config.eventMetadata.slug': 1,
        'config.newsMetadata.slug': 1,
        'config.genericMetadata.slug': 1,
        _id: 0
      }
    })
    .toArray()

  const accessibleStandard = new Set<string>()
  const accessibleSlugs = new Set<string>()

  for (const page of pages) {
    if (SLUG_TYPES.has(page.type)) {
      const slug = (page.config as Record<string, { slug?: string }>)[`${page.type}Metadata`]?.slug
      if (slug) accessibleSlugs.add(`${page.type}/${slug}`)
    } else {
      accessibleStandard.add(page.type)
    }
  }

  return {
    ...portal,
    config: {
      ...config,
      menu: {
        ...config.menu,
        children: filterLinks(config.menu.children, accessibleStandard, accessibleSlugs)
      },
      footer: {
        ...config.footer,
        links: filterLinks(config.footer.links, accessibleStandard, accessibleSlugs),
        importantLinks: filterLinks(config.footer.importantLinks, accessibleStandard, accessibleSlugs)
      }
    }
  }
})
