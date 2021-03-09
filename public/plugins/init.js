export default async ({ store, req, env, app, route, $vuetify, redirect, error }) => {
  await store.dispatch('init', { req, env, app, route })
}
