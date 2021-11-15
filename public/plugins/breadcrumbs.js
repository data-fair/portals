export default async ({ route, redirect }) => {
  // dynamic navigation from the iframe parent
  window.addEventListener('message', (e) => {
    // message does not come from parent window but from ourself or a child iframe
    if (e.source === window || e.source !== window.parent) return

    if (e.data && typeof e.data === 'object' && 'to' in e.data && e.data.to !== route.query.to) {
      window.$nuxt.$router.replace(e.data.to)
    }
  })
}
