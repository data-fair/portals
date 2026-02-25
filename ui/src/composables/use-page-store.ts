import type { Page } from '#api/types/page'
import equal from 'fast-deep-equal'

// we do not use SSR, so we can use a simple module level singleton
export type PageStore = ReturnType<typeof createPageStore>
const pageStoreKey = Symbol('page-store')

const createPageStore = (id: string) => {
  const pageFetch = useFetch<Page>($apiPath + '/pages/' + id)

  const page = ref<Page | null>()
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
      case 'privacy-policy': return '/privacy-policy'
      case 'accessibility': return '/accessibility'
      case 'legal-notice': return '/legal-notice'
      case 'cookie-policy': return '/cookie-policy'
      case 'terms-of-service': return '/terms-of-service'
      case 'datasets': return '/datasets'
      case 'applications': return '/applications'
      case 'reuses': return '/reuses'
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

  return { pageFetch, page, patchPage, hasDraftDiff, pageId: id, pageUrl }
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
