// Preserve portalId and draft query parameters when navigating

export default function({ store, route, redirect }) {
  const doRedirect = !!Object.keys(store.state.initialQuery).find(q => !route.query[q])
  if (doRedirect) redirect(route.path, { ...route.query, ...store.state.initialQuery })
}
