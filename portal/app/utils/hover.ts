export type HoverEffect = 'darken' | 'elevate' | 'background' | 'border' | 'titleColor' | 'titleUnderline' | 'imageZoom'

export type HoverLike = { effects?: HoverEffect[], color?: string }

export type ResolvedHoverConfig = { effects: HoverEffect[], color: string }

const effectClasses: Partial<Record<HoverEffect, string>> = {
  elevate: 'pt-hover--elevate',
  background: 'pt-hover--background',
  border: 'pt-hover--border',
  titleColor: 'pt-hover--title-color',
  titleUnderline: 'pt-hover--title-underline',
  imageZoom: 'pt-hover--image-zoom'
}

const colorEffects: HoverEffect[] = ['background', 'border', 'titleColor']

// effects: [] explicite = aucun effet, absent = héritage (voir spec)
export const resolveHoverConfig = (config?: HoverLike, portalDefaults?: HoverLike): ResolvedHoverConfig => ({
  effects: config?.effects ?? portalDefaults?.effects ?? ['darken'],
  color: config?.color ?? portalDefaults?.color ?? 'primary'
})

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
