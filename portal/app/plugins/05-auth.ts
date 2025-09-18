import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async (app) => {
  const session = useSession()
  const { $portal } = useNuxtApp()
  if ($portal.config.authentication === 'required' && !session.user.value) {
    session.login()
  }
})
