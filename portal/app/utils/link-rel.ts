import * as linkRelUtils from '../../../shared/markdown/link-rel.ts'

// Local const re-declarations (not `export ... from`) so the Nuxt auto-import
// also exposes these helpers to the shared components' templates.
export const isPrivatePath = linkRelUtils.isPrivatePath
export const linkRel = linkRelUtils.linkRel
