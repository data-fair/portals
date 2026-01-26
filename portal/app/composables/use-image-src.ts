import type { ImageRef } from '#api/types/image-ref/index.ts'

type ImageSrcFunction = (imageRef: ImageRef, mobile: boolean) => string

export const usePortalImageSrc = () => getPortalImageSrc
const getPortalImageSrc: ImageSrcFunction = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/images/${id}`
}

const pageImageSrcKey = Symbol('page-image-src')

const createPageImageSrc = (pageType: string, pageSlug?: string) => {
  const slug = pageSlug ?? pageType

  const getPageImageSrc: ImageSrcFunction = (imageRef: ImageRef, mobile: boolean) => {
    let id = imageRef._id
    if (mobile && imageRef.mobileAlt) id += '-mobile'
    return `/portal/api/pages/${pageType}/${slug}/images/${id}`
  }

  return getPageImageSrc
}

export const providePageImageSrc = (pageType: string, pageSlug?: string) => {
  const store = createPageImageSrc(pageType, pageSlug)
  provide(pageImageSrcKey, store)
  return store
}

export const usePageImageSrc = () => {
  const store = inject(pageImageSrcKey) as ReturnType<typeof createPageImageSrc> | undefined
  if (!store) throw new Error('Image source was not initialized')
  return store
}
