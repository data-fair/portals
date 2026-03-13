import type { SimpleLinkItem } from '#api/types/common-links/index.ts'
import type { MenuItem } from '#api/types/portal/index.ts'

/**
 * No-op version of useAccessibleLinks.
 * The UI does not filter links based on user access — all links are returned as-is.
 */
export const useAccessibleLinks = () => {
  const filterLinks = <T extends SimpleLinkItem | MenuItem>(links: T[]): T[] => links

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => items

  return { filterLinks, filterMenuItems }
}
