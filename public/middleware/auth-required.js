export default async function ({ store, error }) {
  if (!store.state.session || !store.state.session.user) {
    // the error page will trigger a login when receiving this statusCode
    error({ message: 'Authentification nécessaire', statusCode: 401 })
  }
}
