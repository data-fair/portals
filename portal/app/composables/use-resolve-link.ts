import type { LinkItem, MenuItem } from '#api/types/portal-config'

export function useResolveLink (link: LinkItem | MenuItem) {
  switch (link.type) {
    case 'standard': {
      switch (link.subtype) {
        case 'home': return '/'
        case 'contact': return '/contact'
        case 'privacy-policy': return '/privacy-policy'
        case 'datasets': return '/datasets'
        case 'applications': return '/applications'
        case 'news': return '/news'
        case 'event': return '/event'
        default: return undefined
      }
    }
    case 'event': return link.pageRef ? `/event/${link.pageRef.slug}` : undefined
    case 'news': return link.pageRef ? `/news/${link.pageRef.slug}` : undefined
    case 'generic': return link.pageRef ? `/pages${link.pageRef.group ? `-${link.pageRef.group.slug}` : ''}/${link.pageRef.slug}` : undefined
    case 'external': return link.href
    default: return undefined
  }
}
