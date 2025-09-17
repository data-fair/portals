import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async (app) => {
  const session = useSession()
  const { $portalConfig } = useNuxtApp()
  if ($portalConfig.authentication === 'required' && !session.user.value) {
    session.login()
  }
})
