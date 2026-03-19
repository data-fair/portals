import type { Page } from '#api/types/page'
import type { PageEnriched } from '#api/doc/pages/get-page-res'
import { getAccountRole } from '@data-fair/lib-vue/session'
import equal from 'fast-deep-equal'

/**
 * Visibility is determined as follows:
 * - if page is public, then visibility is 'public'
 * - if page is not public and permissions is undefined, then visibility is 'protected' => user can see the page, so it cannot be private
 * - if page is not public and permissions includes 'read', then visibility is 'protected' => admin
 * - otherwise, visibility is 'private' => admin
 */
export const getPageVisibility = (page: Pick<Page, 'public' | 'permissions'>): 'public' | 'protected' | 'private' => {
  if (page.public) return 'public'
  if (!page.permissions) return 'protected'
  if (page.permissions.some(p => p.operation.includes('read'))) return 'protected'
  return 'private'
}

// we do not use SSR, so we can use a simple module level singleton
export type PageStore = ReturnType<typeof createPageStore>
const pageStoreKey = Symbol('page-store')

const createPageStore = (id: string) => {
  const pageFetch = useFetch<PageEnriched>($apiPath + '/pages/' + id)
  const session = useSessionAuthenticated()

  const page = ref<PageEnriched | null>()
  watch(pageFetch.data, () => {
    page.value = pageFetch.data.value
  })

  const patchPage = useAsyncAction(async (patch: Partial<Page>) => {
    await $fetch(`/pages/${id}`, { method: 'PATCH', body: patch })
    if (page.value) page.value = { ...page.value, ...patch }
  })

  const hasDraftDiff = computed(() => {
    if (!page.value) return false
    return !equal(page.value.draftConfig, page.value.config)
  })

  const pageUrl = computed(() => {
    switch (page.value?.type) {
      case 'home': return '/'
      case 'contact': return '/contact'
      case 'accessibility': return '/accessibility'
      case 'terms-of-service': return '/terms-of-service'
      case 'legal-notice': return '/legal-notice'
      case 'privacy-policy': return '/privacy-policy'
      case 'cookie-policy': return '/cookie-policy'
      case 'datasets': return '/datasets'
      case 'applications': return '/applications'
      case 'reuses': return '/reuses'
      case 'event-catalog': return '/event'
      case 'news-catalog': return '/news'
      case 'event': return page.value.config.eventMetadata?.slug ? `/event/${page.value.config.eventMetadata.slug}` : undefined
      case 'news': return page.value.config.newsMetadata?.slug ? `/news/${page.value.config.newsMetadata.slug}` : undefined
      case 'generic': {
        const metadata = page.value.config.genericMetadata
        if (!metadata?.slug) return undefined
        return `/pages${metadata.group ? `-${metadata.group.slug}` : ''}/${metadata.slug}`
      }
      default: return undefined
    }
  })

  const canAdminPage = computed(() => {
    if (!page.value) return false
    return getAccountRole(session.state, page.value.owner) === 'admin' || !!session.state.user?.adminMode
  })

  const canWritePage = computed(() => {
    if (!page.value) return false
    if (canAdminPage.value) return true
    return page.value.userPermissions?.includes('write') ?? false
  })

  const visibility = computed(() => page.value ? getPageVisibility(page.value) : 'private')

  return { pageFetch, page, patchPage, hasDraftDiff, pageId: id, pageUrl, canAdminPage, canWritePage, visibility }
}

export const providePageStore = (id: string) => {
  const store = createPageStore(id)
  provide(pageStoreKey, store)
  return store
}

export const usePageStore = () => {
  const store = inject(pageStoreKey) as PageStore | undefined
  if (!store) throw new Error('page store was not initialized')
  return store
}
