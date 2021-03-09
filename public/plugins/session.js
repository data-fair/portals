// keep the session alive, only on the client

export default async ({ store, req, env, app, route, $vuetify, redirect, error }) => {
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
}
