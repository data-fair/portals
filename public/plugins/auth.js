export default ({ store, env, app }) => {
  if (!store.state.config) return
  if (store.state.config.authentication === 'required' && (!store.state.session || !store.state.session.user)) {
    return store.dispatch('session/login', window.location.href)
  }
}
