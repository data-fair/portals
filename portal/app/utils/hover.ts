export type HoverEffect = 'darken' | 'elevate' | 'background' | 'border' | 'titleColor' | 'titleUnderline' | 'imageZoom' | 'grow'

export type HoverLike = { effects?: HoverEffect[], color?: string }

export type ResolvedHoverConfig = { effects: HoverEffect[], color: string }

export type ButtonHoverEffect = 'darken' | 'elevate' | 'color' | 'grow'

export type ButtonHoverLike = { hoverEffects?: ButtonHoverEffect[], hoverColor?: string }

export type ResolvedButtonHover = { effects: ButtonHoverEffect[], color: string }

const effectClasses: Partial<Record<HoverEffect, string>> = {
  elevate: 'pt-hover--elevate',
  background: 'pt-hover--background',
  border: 'pt-hover--border',
  titleColor: 'pt-hover--title-color',
  titleUnderline: 'pt-hover--title-underline',
  imageZoom: 'pt-hover--image-zoom'
}

const colorEffects: HoverEffect[] = ['background', 'border', 'titleColor']

const HOVER_ELEVATION = 8
const themeColor = (color: string) => `rgb(var(--v-theme-${color}))`
const onThemeColor = (color: string) => `rgb(var(--v-theme-on-${color}))`
// v-card transitionne nativement box-shadow/background : re-déclarer ces transitions
// quand on pose une transition inline (qui remplacerait sinon celle de la feuille de style)
const cardNativeTransitions = ['box-shadow .28s cubic-bezier(0.4, 0, 0.2, 1)', 'background .28s cubic-bezier(0.4, 0, 0.2, 1)']

// effects: [] explicite = aucun effet, absent = héritage (voir spec)
export const resolveHoverConfig = (config?: HoverLike, portalDefaults?: HoverLike, relevantEffects?: HoverEffect[]): ResolvedHoverConfig => {
  let effects = config?.effects ?? portalDefaults?.effects ?? ['darken' as HoverEffect]
  if (relevantEffects) {
    const filtered = effects.filter(e => relevantEffects.includes(e))
    effects = (filtered.length || !effects.length) ? filtered : ['darken']
  }
  return { effects, color: config?.color ?? portalDefaults?.color ?? 'primary' }
}

export const hoverElevation = (resolved: ResolvedHoverConfig, isHovering: boolean, base?: number | string): number | string | undefined =>
  resolved.effects.includes('elevate') && isHovering ? HOVER_ELEVATION : base

export const hoverBackground = (resolved: ResolvedHoverConfig, isHovering: boolean, base?: string): string | undefined =>
  resolved.effects.includes('background') && isHovering ? resolved.color : base

export const hoverRootStyle = (resolved: ResolvedHoverConfig, isHovering: boolean, opts?: { hasBorder?: boolean, inlineBackground?: boolean }): Record<string, string> | undefined => {
  const style: Record<string, string> = {}
  const transitions: string[] = []
  if (!resolved.effects.includes('darken')) style['--v-hover-opacity'] = '0'
  if (resolved.effects.includes('grow')) {
    style.transform = isHovering ? 'scale(1.02)' : 'scale(1)'
    transitions.push('transform .28s cubic-bezier(0.4, 0, 0.2, 1)')
  }
  if (resolved.effects.includes('border')) {
    if (!opts?.hasBorder) style.border = '1px solid transparent'
    if (isHovering) style.borderColor = themeColor(resolved.color)
    transitions.push('border-color .2s')
  }
  if (resolved.effects.includes('background') && opts?.inlineBackground) {
    if (isHovering) {
      style.backgroundColor = themeColor(resolved.color)
      style.color = onThemeColor(resolved.color)
    }
    transitions.push('background-color .2s', 'color .2s')
  }
  if (transitions.length) style.transition = [...cardNativeTransitions, ...transitions].join(', ')
  return Object.keys(style).length ? style : undefined
}

export const hoverTitleStyle = (resolved: ResolvedHoverConfig, isHovering: boolean): Record<string, string> | undefined =>
  resolved.effects.includes('titleColor')
    ? { transition: 'color .2s', ...(isHovering ? { color: themeColor(resolved.color) } : {}) }
    : undefined

export const hoverUnderlineBarStyle = (resolved: ResolvedHoverConfig, isHovering: boolean): Record<string, string> => ({
  display: 'block',
  height: '3px',
  width: '45px',
  backgroundColor: themeColor(resolved.color),
  transform: isHovering ? 'scaleX(1)' : 'scaleX(0)',
  transformOrigin: 'left',
  transition: 'transform .25s ease-out'
})

export const hoverImageStyle = (resolved: ResolvedHoverConfig, isHovering: boolean): Record<string, string> | undefined =>
  resolved.effects.includes('imageZoom')
    ? {
        transition: 'transform .28s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovering ? 'scale(1.05)' : 'scale(1)'
      }
    : undefined

export const resolveButtonHover = (config?: ButtonHoverLike, fallbackColor?: string): ResolvedButtonHover => {
  const color = config?.hoverColor ?? fallbackColor
  return {
    effects: config?.hoverEffects ?? (color ? ['color'] : ['darken']),
    color: color ?? 'primary'
  }
}

// v-btn n'a pas de transition native box-shadow/background : tout est déclaré inline
export const hoverButtonStyle = (resolved: ResolvedButtonHover, isHovering: boolean): Record<string, string> | undefined => {
  const style: Record<string, string> = {}
  const transitions: string[] = []
  if (!resolved.effects.includes('darken')) style['--v-hover-opacity'] = '0'
  if (resolved.effects.includes('color')) transitions.push('background-color .2s', 'color .2s')
  if (resolved.effects.includes('elevate')) transitions.push('box-shadow .28s cubic-bezier(0.4, 0, 0.2, 1)')
  if (resolved.effects.includes('grow')) {
    style.transform = isHovering ? 'scale(1.05)' : 'scale(1)'
    transitions.push('transform .28s cubic-bezier(0.4, 0, 0.2, 1)')
  }
  if (transitions.length) style.transition = transitions.join(', ')
  return Object.keys(style).length ? style : undefined
}

export const stripMotion = <T extends Record<string, string> | undefined>(style: T, reducedMotion: boolean): T => {
  if (style && reducedMotion) delete (style as Record<string, string>).transition
  return style
}

export const hoverConfigClasses = (resolved: ResolvedHoverConfig): string[] => {
  const classes = ['pt-hover']
  if (!resolved.effects.includes('darken')) classes.push('pt-hover--no-darken')
  for (const effect of resolved.effects) {
    const cssClass = effectClasses[effect]
    if (cssClass) classes.push(cssClass)
  }
  return classes
}

export const hoverConfigStyle = (resolved: ResolvedHoverConfig): Record<string, string> | undefined => {
  if (!resolved.effects.some(e => colorEffects.includes(e))) return undefined
  return {
    '--pt-hover-color': `var(--v-theme-${resolved.color})`,
    '--pt-hover-on-color': `var(--v-theme-on-${resolved.color})`
  }
}

export const buttonHoverClass = (config?: { hoverColor?: string }, fallbackColor?: string): string | undefined =>
  (config?.hoverColor ?? fallbackColor) ? 'pt-hover-btn' : undefined

export const buttonHoverStyle = (config?: { hoverColor?: string }, fallbackColor?: string): Record<string, string> | undefined => {
  const color = config?.hoverColor ?? fallbackColor
  return color
    ? {
        '--pt-hover-color': `var(--v-theme-${color})`,
        '--pt-hover-on-color': `var(--v-theme-on-${color})`
      }
    : undefined
}
