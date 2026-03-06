import type { ImageRef } from '#api/types/image-ref/index.ts'

type ImageSrcFunction = (imageRef: ImageRef, mobile: boolean) => string

const getImageSrc: ImageSrcFunction = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portals-manager/api/images/${id}/data`
}

export const usePortalImageSrc = () => getImageSrc
export const usePageImageSrc = () => getImageSrc

export const providePageImageSrc = (_pageType: string, _pageSlug?: string) => {
  throw new Error('providePageImageSrc should only be called from portal, not portals-manager')
}
