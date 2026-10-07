import * as linkRelUtils from '#portal/app/utils/link-rel'

// Local const re-declarations (not `export ... from`) so unplugin-auto-import
// also emits the vueTemplate (template-scope) declarations these helpers need
// when called inside the shared portal components' templates.
export const isPrivatePath = linkRelUtils.isPrivatePath
export const linkRel = linkRelUtils.linkRel
