export default defineNuxtRouteMiddleware((to, from) => {
  const session = useSession()
  if (!session.user.value) {
    // the error page will trigger a login when receiving this statusCode
    return abortNavigation({ message: 'Authentification nécessaire', statusCode: 401 })
  }
})
