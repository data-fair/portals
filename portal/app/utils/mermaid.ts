/**
 * Mermaid's 'base' theme derives its whole palette (borders, contrasting labels,
 * secondary and tertiary fills) from a handful of variables, so we only feed it the
 * portal colors and let it compute the rest — hand-picking every derived variable
 * would have to be redone for each diagram type.
 */
export const mermaidThemeVariables = (colors: Record<string, unknown>, dark: boolean) => {
  // vuetify types a theme color as hex string, rgb or hsv, portal themes only use hex
  const color = (name: string) => String(colors[name])
  return {
    darkMode: dark,
    background: color('background'),
    primaryColor: color('primary'),
    primaryTextColor: color('on-primary'),
    lineColor: color('on-background'),
    textColor: color('on-background'),
    // resolved against the block in the DOM, so the diagram uses the portal body font
    fontFamily: 'inherit'
  }
}
