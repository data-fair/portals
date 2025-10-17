import type { UseSeoMetaInput } from '@unhead/vue/types'
import type { MaybeRefOrGetter } from 'vue'

/**
 * Composable to set SEO meta tags with automatic ogUrl based on current route
 * @param meta - SEO meta configuration
 * @param meta.title - Page title
 * @param meta.description - Page description
 * @param meta.ogType - Open Graph type (default: 'website')
 * @param meta.ogImage - Open Graph image URL
 */
export const usePageSeo = (meta: {
  title?: MaybeRefOrGetter<string | undefined>
  description?: MaybeRefOrGetter<string | undefined>
  ogType?: 'website' | 'article'
  ogImage?: MaybeRefOrGetter<string | undefined>
}) => {
  const seoMeta: UseSeoMetaInput = {
    title: () => toValue(meta.title),
    description: () => toValue(meta.description),
    ogTitle: () => toValue(meta.title),
    ogDescription: () => toValue(meta.description),
    ogType: meta.ogType || 'website',
    ogUrl: useRequestURL().href
  }
  if (meta.ogImage) { seoMeta.ogImage = () => toValue(meta.ogImage) }

  useSeoMeta(seoMeta)
}
