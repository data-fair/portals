export default async ({ store, req, env, app, route, $vuetify }) => {
  if (!store.state.config) {
    await store.dispatch('init', { req, env, app, route })
  }
  $vuetify.theme.themes.light.primary = store.state.config.themeColor
}
