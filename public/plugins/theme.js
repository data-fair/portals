const debug = require('debug')('portals:theme')
debug.log = console.log.bind(console)

export default async ({ app, store, $vuetify, route }) => {
  if (store.state.inPortal && store.state.config) {
    $vuetify.theme.themes.light.primary = store.state.config.themeColor
    debug('apply color from config in store', store.state.config.themeColor)
  } else {
    debug('keep color from original vuetify config', $vuetify.theme.themes.light.primary)
  }
  if (process.client && route.path.startsWith('/manager/') && app.$cookies.get('theme_dark') !== undefined) {
    $vuetify.theme.dark = app.$cookies.get('theme_dark')
  }
}
