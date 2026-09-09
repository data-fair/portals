// Relative (not the portal's #api alias) so this file still resolves under the
// root tsconfig that type-checks the unit test importing it, cf utils/hover.ts.
import type { ImageRef } from '../../../api/types/image-ref/index.ts'
import type { ApplicationCard, DatasetCard, PortalConfigTopics, ReuseCard } from '../../../api/types/portal-config/index.ts'

// mobile is required, not optional: the manager declares its own image getter with a
// required parameter (ui/src/composables/use-image-src.ts) and a function whose
// parameter is optional would not be assignable to it. Callers always pass it.
type ImageSrc = (imageRef: ImageRef, mobile: boolean) => string

// structural shapes rather than the full Dataset/Application types: these helpers only
// read the thumbnail sources, and staying structural keeps them checkable from the unit
// tests without building a whole resource
type DatasetSources = {
  image?: string
  topics?: { id: string }[]
  extras?: { applications?: { id: string, updatedAt: string }[] }
}

type ApplicationSources = {
  id: string
  updatedAt: string
  image?: string
  summary?: string
  topics?: { id: string }[]
}

type ThumbnailConfig = {
  show?: boolean
  location?: string
  useTopic?: boolean
  useApplication?: boolean
  useSummary?: boolean
  default?: ImageRef
}

export const applicationCaptureUrl = (id: string, updatedAt: string) =>
  `/data-fair/api/v1/applications/${id}/capture?updatedAt=${updatedAt}`

const compact = (urls: (string | undefined)[]) =>
  [...new Set(urls.filter((url): url is string => !!url))]

// the schemas say "the image of the first topic", not "of the first topic that has one"
const firstTopicThumbnail = (
  topics: { id: string }[] | undefined,
  portalTopics: PortalConfigTopics | undefined,
  portalImageSrc: ImageSrc
) => {
  const first = topics?.[0]
  if (!first) return undefined
  const topicConfig = portalTopics?.find((topic) => topic.id === first.id)
  return topicConfig?.thumbnail ? portalImageSrc(topicConfig.thumbnail, false) : undefined
}

export const datasetThumbnailCandidates = (
  dataset: DatasetSources,
  cardConfig: DatasetCard,
  portalTopics: PortalConfigTopics | undefined,
  portalImageSrc: ImageSrc,
  defaultImageSrc: ImageSrc
) => {
  const thumbnail = cardConfig.thumbnail as ThumbnailConfig | undefined
  if (!thumbnail?.show) return []
  const application = dataset.extras?.applications?.[0]
  return compact([
    dataset.image,
    thumbnail.useTopic ? firstTopicThumbnail(dataset.topics, portalTopics, portalImageSrc) : undefined,
    thumbnail.useApplication && application
      ? applicationCaptureUrl(application.id, application.updatedAt)
      : undefined,
    thumbnail.default ? defaultImageSrc(thumbnail.default, false) : undefined
  ])
}

export const applicationThumbnailCandidates = (
  application: ApplicationSources,
  cardConfig: ApplicationCard,
  portalTopics: PortalConfigTopics | undefined,
  portalImageSrc: ImageSrc
) => {
  const thumbnail = cardConfig.thumbnail as ThumbnailConfig | undefined
  if (!thumbnail?.show) return []
  // the schema puts the summary before the automatic capture
  const preferSummary = !!thumbnail.useSummary && thumbnail.location === 'center' && !!application.summary?.length
  return compact([
    application.image,
    thumbnail.useTopic ? firstTopicThumbnail(application.topics, portalTopics, portalImageSrc) : undefined,
    preferSummary ? undefined : applicationCaptureUrl(application.id, application.updatedAt)
  ])
}

export const reuseThumbnailCandidates = (
  image: ImageRef | undefined,
  cardConfig: ReuseCard,
  reuseImageSrc: ImageSrc,
  defaultImageSrc: ImageSrc
) => {
  const thumbnail = cardConfig.thumbnail as ThumbnailConfig | undefined
  if (!thumbnail?.show) return []
  return compact([
    image ? reuseImageSrc(image, false) : undefined,
    thumbnail.default ? defaultImageSrc(thumbnail.default, false) : undefined
  ])
}
