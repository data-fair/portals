import * as hover from '../../../portal/app/utils/hover'

// Local const re-declarations (not `export ... from`) so unplugin-auto-import
// also emits the vueTemplate (template-scope) declarations these helpers need
// when called inside the shared portal components' templates.
export const resolveHoverConfig = hover.resolveHoverConfig
export const hoverConfigClasses = hover.hoverConfigClasses
export const hoverConfigStyle = hover.hoverConfigStyle
export const buttonHoverClass = hover.buttonHoverClass
export const buttonHoverStyle = hover.buttonHoverStyle
export const hoverElevation = hover.hoverElevation
export const hoverBackground = hover.hoverBackground
export const hoverRootStyle = hover.hoverRootStyle
export const hoverTitleStyle = hover.hoverTitleStyle
export const hoverUnderlineBarStyle = hover.hoverUnderlineBarStyle
export const hoverImageStyle = hover.hoverImageStyle
export const resolveButtonHover = hover.resolveButtonHover
export const hoverButtonStyle = hover.hoverButtonStyle
export const stripMotion = hover.stripMotion

export type { HoverEffect, HoverLike, ResolvedHoverConfig } from '../../../portal/app/utils/hover'
export type { ButtonHoverEffect, ButtonHoverLike, ResolvedButtonHover } from '../../../portal/app/utils/hover'
