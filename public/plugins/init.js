export default async ({ store, req, env, app, route, $vuetify, redirect, error }) => {
  await store.dispatch('init', { req, env, app, route })

  if (store.state.config) {
    $vuetify.theme.themes.light.primary = store.state.config.themeColor
  }
  store.dispatch('session/loop')
  store.watch(
    (state, getters) => getters['session/activeAccount'],
    (newValue, oldValue) => {
      if (!oldValue && newValue) {
        console.log(`activating account ${newValue.name}`)
        app.router.go()
      }
      if (oldValue && !newValue) {
        console.log(`desactivating account ${oldValue.name}`)
        app.router.go()
      }
    },
  )
  /* TODO: add store.state.config.themeColorDark ?
  if (app.$cookies.get('theme_dark') !== undefined) {
    $vuetify.theme.dark = app.$cookies.get('theme_dark')
  } */
}
