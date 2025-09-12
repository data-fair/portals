import { createSession } from '@data-fair/lib-vue/session.js'
import { defineNuxtPlugin, useRoute } from '#app'

export default defineNuxtPlugin(async (app) => {
  app.vueApp.use(await createSession({ req: app.ssrContext?.event.node.req, route: useRoute() }))
})
