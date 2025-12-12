import { createVueRouterDFrameContent } from '@data-fair/frame/lib/vue-router/d-frame-content.js'
import { defineNuxtPlugin, useRouter } from '#app'

export default defineNuxtPlugin(async (app) => {
  const router = useRouter()
  const dFrameContent = createVueRouterDFrameContent(router)
  app.vueApp.use(dFrameContent)
})
