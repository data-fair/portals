
export default async ({ store, $vuetify }) => {
  if (store.state.config) {
    $vuetify.theme.themes.light.primary = store.state.config.themeColor
  }
  /* TODO: add store.state.config.themeColorDark ?
  if (app.$cookies.get('theme_dark') !== undefined) {
    $vuetify.theme.dark = app.$cookies.get('theme_dark')
  } */
}
