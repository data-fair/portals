export default async ({ store, req, env, app, route }) => {
  await store.dispatch('init', { req, env, app, route })
}
