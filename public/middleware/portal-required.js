export default async function ({ store, error, redirect, route }) {
  if (!store.state.config) {
    redirect('/manager/portals')
  } else {
    const doRedirect = !!Object.keys(store.state.initialQuery).find(q => !route.query[q])
    if (doRedirect) {
      console.log('redirect to preserve initial query params')
      redirect(route.path, { ...route.query, ...store.state.initialQuery })
    }
  }
}
