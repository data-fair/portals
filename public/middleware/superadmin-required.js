export default async function ({ store, error }) {
  if (!store.state.session || !store.state.session.user) {
    return store.dispatch('session/login')
  } else if (!store.state.session.user.adminMode) {
    error({
      message: 'Vous n\'avez pas la permission d\'accéder à cette page, il faut avoir activé le mode administration.',
      statusCode: 403,
    })
  }
}
