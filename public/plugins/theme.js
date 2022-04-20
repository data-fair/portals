const debug = require('debug')('portals:theme')
debug.log = console.log.bind(console)

export default async ({ store, $vuetify }) => {
  if (store.state.config) {
    $vuetify.theme.themes.light.primary = store.state.config.themeColor
    debug('apply color from config in store', store.state.config.themeColor)
  } else {
    debug('keep color from original vuetify config', $vuetify.theme.themes.light.primary)
  }
  /* TODO: add store.state.config.themeColorDark ?
  if (app.$cookies.get('theme_dark') !== undefined) {
    $vuetify.theme.dark = app.$cookies.get('theme_dark')
  } */
}
