import * as thumbnail from '#portal/app/utils/thumbnail'

// Local const re-declarations (not `export ... from`) so unplugin-auto-import
// also emits the vueTemplate (template-scope) declarations these helpers need
// when called inside the shared portal components' templates.
export const applicationCaptureUrl = thumbnail.applicationCaptureUrl
export const datasetThumbnailCandidates = thumbnail.datasetThumbnailCandidates
export const applicationThumbnailCandidates = thumbnail.applicationThumbnailCandidates
export const reuseThumbnailCandidates = thumbnail.reuseThumbnailCandidates
