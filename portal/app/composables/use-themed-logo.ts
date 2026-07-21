import { useTheme } from 'vuetify'
import type { ImageRef } from '#api/types/image-ref/index.ts'

/**
 * The logo variant follows the applied theme, not the lightness of the
 * background behind it: it is up to the portal admin to provide the logo that
 * suits each theme. theme.current.value.dark covers both 'dark' and 'hc-dark'.
 */
export const useThemedLogo = () => {
  const theme = useTheme()
  return (logo?: ImageRef, logoDark?: ImageRef) =>
    theme.current.value.dark && logoDark ? logoDark : logo
}
