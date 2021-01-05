export default async function ({ store, error, redirect }) {
  if (!store.state.config) {
    redirect('/manager/portals')
  }
}
