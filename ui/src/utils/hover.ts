import * as hover from '../../../portal/app/utils/hover'

// Local const re-declarations (not `export ... from`) so unplugin-auto-import
// also emits the vueTemplate (template-scope) declarations these helpers need
// when called inside the shared portal components' templates.
export const resolveHoverConfig = hover.resolveHoverConfig
export const hoverConfigClasses = hover.hoverConfigClasses
export const hoverConfigStyle = hover.hoverConfigStyle
export const buttonHoverClass = hover.buttonHoverClass
export const buttonHoverStyle = hover.buttonHoverStyle

export type { HoverEffect, HoverLike, ResolvedHoverConfig } from '../../../portal/app/utils/hover'
