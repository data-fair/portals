export default async ({ store, req, env, app, route, $vuetify, redirect, error }) => {
  console.log('plugin init')
  await store.dispatch('init', { req, env, app, route })
  console.log('plugin init ok')

  if (store.state.config) {
    $vuetify.theme.themes.light.primary = store.state.config.themeColor
  }
  /* TODO: add store.state.config.themeColorDark ?
  if (app.$cookies.get('theme_dark') !== undefined) {
    $vuetify.theme.dark = app.$cookies.get('theme_dark')
  } */
}
