// Relative (not the portal's #api alias) so this file still resolves under the
// root tsconfig that type-checks the unit test importing it — that config has no
// #api alias, and the tests import api types relatively too.
import type { Effects as SchemaHoverEffects, ButtonConfig } from '../../../api/types/common-defs/index.ts'

// Derived from the generated schema types so the effect unions can never drift
// from the editor's options (hoverEffectsList / buttonConfig in common-defs)
export type HoverEffect = SchemaHoverEffects[number]

export type HoverLike = { effects?: HoverEffect[], color?: string }

export type ResolvedHoverConfig = { effects: HoverEffect[], color: string }

export type ButtonHoverEffect = NonNullable<ButtonConfig['hoverEffects']>[number]

export type ButtonHoverLike = { hoverEffects?: ButtonHoverEffect[], hoverColor?: string }

export type ResolvedButtonHover = { effects: ButtonHoverEffect[], color: string }

// Vuetify 4 (MD3) only ships elevation-0 to elevation-5 classes
export const HOVER_ELEVATION = 5
const themeColor = (color: string) => `rgb(var(--v-theme-${color}))`
const onThemeColor = (color: string) => `rgb(var(--v-theme-on-${color}))`

// Shared text-link color resolution so the portal render (app.vue global CSS) and
// the manager preview (links-preview) agree. Prefers the readable "text-<color>"
// theme variant the portal may emit, falling back to the base color otherwise.
export const linkColorValue = (color: string): string =>
  `rgb(var(--v-theme-text-${color}, var(--v-theme-${color})))`
// Uniform MD3 "short" hover tempo: cards, buttons and chips all settle their
// hover state in the same .15s whatever their size. Setting an inline transition
// overrides the stylesheet, so the Vuetify native transitions are re-declared at
// that tempo: v-card box-shadow/opacity/background/--v-elevation-overlay, v-chip
// everything, v-btn box-shadow/opacity/background.
const easing = 'cubic-bezier(0.4, 0, 0.2, 1)'
const HOVER_DURATION = '.15s'
const hoverTransition = (prop: string) => `${prop} ${HOVER_DURATION} ${easing}`
const cardNativeTransitions = ['box-shadow', 'opacity', 'background', '--v-elevation-overlay'].map(hoverTransition)
const chipNativeTransition = `all ${HOVER_DURATION} ${easing}`
const btnNativeTransitions = ['box-shadow', 'opacity', 'background'].map(hoverTransition)
const transformTransition = hoverTransition('transform')

// explicit effects: [] means no effect, absent means inherit
export const resolveHoverConfig = (config?: HoverLike, portalDefaults?: HoverLike, relevantEffects?: HoverEffect[]): ResolvedHoverConfig => {
  let effects = config?.effects ?? portalDefaults?.effects ?? ['darken' as HoverEffect]
  if (relevantEffects) {
    const filtered = effects.filter(e => relevantEffects.includes(e))
    if (filtered.length || !effects.length) effects = filtered
    else effects = ['darken'] // the filter removed everything the user picked
  }
  return { effects, color: config?.color ?? portalDefaults?.color ?? 'primary' }
}

export const hoverElevation = (resolved: { effects: readonly string[] }, isHovering: boolean, base?: number | string): number | string | undefined => {
  if (!resolved.effects.includes('elevate')) return base
  // Resolve the resting level explicitly (0 when nothing is configured): a v-btn's
  // "elevated" variant keeps a default shadow when :elevation is undefined, so the
  // +2 hover jump would otherwise start from that hidden default and stay invisible.
  const rest = Number(base) || 0
  return isHovering ? Math.min(rest + 2, HOVER_ELEVATION) : rest
}

export const hoverBackground = (resolved: ResolvedHoverConfig, isHovering: boolean, base?: string): string | undefined =>
  resolved.effects.includes('background') && isHovering ? resolved.color : base

export const hoverRootStyle = (resolved: ResolvedHoverConfig, isHovering: boolean, opts?: { hasBorder?: boolean, inlineBackground?: boolean, small?: boolean }): Record<string, string> | undefined => {
  const style: Record<string, string> = {}
  const transitions: string[] = []
  if (!resolved.effects.includes('darken')) style['--v-hover-opacity'] = '0'
  if (resolved.effects.includes('grow')) {
    style.transform = isHovering ? 'scale(1.02)' : 'scale(1)'
    transitions.push(transformTransition)
  }
  if (resolved.effects.includes('border')) {
    if (!opts?.hasBorder) style.border = '1px solid transparent'
    if (isHovering) style.borderColor = themeColor(resolved.color)
    transitions.push(hoverTransition('border-color'))
  }
  if (resolved.effects.includes('background') && opts?.inlineBackground) {
    if (isHovering) {
      style.backgroundColor = themeColor(resolved.color)
      style.color = onThemeColor(resolved.color)
    }
    transitions.push(hoverTransition('background-color'), hoverTransition('color'))
  }
  if (transitions.length) style.transition = [...(opts?.small ? [chipNativeTransition] : cardNativeTransitions), ...transitions].join(', ')
  return Object.keys(style).length ? style : undefined
}

// titleUnderlineAnimated takes precedence: the plain underline stays off and the bar takes over
export const hoverTitleStyle = (resolved: ResolvedHoverConfig, isHovering: boolean): Record<string, string> | undefined =>
  isHovering && resolved.effects.includes('titleUnderline') && !resolved.effects.includes('titleUnderlineAnimated')
    ? { textDecoration: 'underline' }
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
        transition: transformTransition,
        transform: isHovering ? 'scale(1.05)' : 'scale(1)'
      }
    : undefined

// Buttons inherit the portal default hover effects they support; the color effect stays opt-in per button
const buttonInheritedEffects = ['darken', 'elevate', 'grow'] as const

export const resolveButtonHover = (config?: ButtonHoverLike, portalDefaults?: HoverLike): ResolvedButtonHover => {
  let effects = config?.hoverEffects
  if (!effects && portalDefaults?.effects) {
    const inherited = portalDefaults.effects.filter((e): e is (typeof buttonInheritedEffects)[number] => (buttonInheritedEffects as readonly string[]).includes(e))
    // an explicitly empty default stays empty, but a default with nothing button-relevant falls back to darken
    if (inherited.length || !portalDefaults.effects.length) effects = inherited
  }
  return {
    effects: effects ?? ['darken'],
    color: config?.hoverColor ?? portalDefaults?.color ?? 'primary'
  }
}

export const hoverButtonColor = (resolved: ResolvedButtonHover, isHovering: boolean, base?: string): string | undefined =>
  resolved.effects.includes('color') && isHovering ? resolved.color : base

export const hoverButtonStyle = (resolved: ResolvedButtonHover, isHovering: boolean): Record<string, string> | undefined => {
  const style: Record<string, string> = {}
  const transitions: string[] = []
  if (!resolved.effects.includes('darken')) style['--v-hover-opacity'] = '0'
  if (resolved.effects.includes('color')) transitions.push(hoverTransition('background-color'), hoverTransition('color'))
  const grow = resolved.effects.includes('grow')
  if (grow) style.transform = isHovering ? 'scale(1.05)' : 'scale(1)'
  if (transitions.length || grow) {
    style.transition = [...btnNativeTransitions, transformTransition, ...transitions].join(', ')
  }
  return Object.keys(style).length ? style : undefined
}
