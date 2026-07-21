import { useTheme } from 'vuetify'
import type { ImageRef } from '#api/types/image-ref/index.ts'

// mirrors portal/app/composables/use-themed-logo.ts: shared layout components
// resolve their auto-imports here, and the ui build stage of the Dockerfile does
// not copy portal/app/composables. In the editor previews the theme is always
// light, so this always returns the base logo.
export const useThemedLogo = () => {
  const theme = useTheme()
  return (logo?: ImageRef, logoDark?: ImageRef) =>
    theme.current.value.dark && logoDark ? logoDark : logo
}
