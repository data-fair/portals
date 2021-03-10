export default async ({ route, redirect }) => {
  // initial navigation from the iframe parent
  if (route.query.to && route.query.to !== route.path) {
    // cf https://nuxtjs.org/docs/2.x/internals-glossary/context#redirect
    window.onNuxtReady(() => { window.$nuxt.$router.replace(route.query.to) })
  }

  // dynamic navigation from the iframe parent
  window.addEventListener('message', (e) => {
    if (e.data && typeof e.data === 'object' && 'to' in e.data && e.data.to !== route.query.to) {
      window.$nuxt.$router.replace(route.query.to)
    }
  })
}
