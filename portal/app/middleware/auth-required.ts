export default defineNuxtRouteMiddleware((to) => {
  const session = useSession()
  if (session.user.value) return

  // on a client side navigation the router swallows the error below (it only renders the error
  // page on the server and during hydration), so the login has to be triggered from here
  if (import.meta.client && !useNuxtApp().isHydrating) {
    session.login(window.location.origin + useRouter().resolve(to).href)
    return abortNavigation()
  }

  // the error page will trigger a login when receiving this statusCode
  return abortNavigation({ message: 'Authentification nécessaire', statusCode: 401 })
})
