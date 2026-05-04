import type { ComputedRef } from 'vue'

/**
 * Returns the URL prefix for the back-office (without trailing slash).
 * Mirrors the logic used in layout-personal-menu for the "Back-office" link.
 */
export const useBackOfficeUrl = (): ComputedRef<string> => {
  const { siteInfo } = usePortalStore()
  const requestUrl = useRequestURL()

  return computed(() => {
    if (siteInfo.authMode === 'onlyBackOffice' || siteInfo.authMode === 'onlyOtherSite') {
      return `${requestUrl.protocol}//${siteInfo.authOnlyOtherSite}/data-fair`
    }
    return '/data-fair'
  })
}
