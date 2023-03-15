export default ({ store, env, app }) => {
  if (!store.state.config) return
  if (store.state.config.authentication === 'required' && (!store.state.session || !store.state.session.user)) {
    window.location.href = store.getters['session/loginUrl'](
      window.location.href,
      false
    )
  }
}
