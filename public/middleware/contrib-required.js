export default async function ({ store, error }) {
  if (!store.state.session || !store.state.session.user) {
    return store.dispatch('session/login')
  } else if (!store.state.session.user.organization || store.state.session.user.organization.role === 'user') {
    error({
      message: 'Vous n\'avez pas les permissions d\'accéder à cette page',
      statusCode: 403,
    })
  }
}
