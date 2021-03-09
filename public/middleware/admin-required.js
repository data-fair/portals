export default async function ({ store, error }) {
  if (!store.state.session || !store.state.session.user) {
    // the error page will trigger a login when receiving this statusCode
    error({ message: 'Authentification nécessaire', statusCode: 401 })
  } else if (store.state.session.user.organization && store.state.session.user.organization.role !== 'admin') {
    error({
      message: 'Vous n\'avez pas la permission d\'accéder à cette page, il faut avoir le profil administrateur.',
      statusCode: 403,
    })
  }
}
