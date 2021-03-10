export default async function ({ store, route }) {
  store.dispatch('setBreadcrumbs', [])
  // mirror all internal navigation in the iframe parent
  if (global.parent) parent.postMessage({ to: route.path })
}
