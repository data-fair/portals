export default async ({ route, redirect }) => {
  // dynamic navigation from the iframe parent
  window.addEventListener('message', (e) => {
    if (e.data && typeof e.data === 'object' && 'to' in e.data && e.data.to !== route.query.to) {
      window.$nuxt.$router.replace(e.data.to)
    }
  })
}
