// Pre-register the <d-frame> custom element before any component mounts.
// Otherwise Vue creates <d-frame> and sets `.adapter` on a not-yet-upgraded element;
// when customElements.define runs later the constructor overwrites `.adapter` (DFrameElement.js).
import '@data-fair/frame/lib/d-frame.js'
import { createVueRouterDFrameContent } from '@data-fair/frame/lib/vue-router/d-frame-content.js'
import { defineNuxtPlugin, useRouter } from '#app'

export default defineNuxtPlugin(async (app) => {
  const router = useRouter()
  const dFrameContent = createVueRouterDFrameContent(router)
  app.vueApp.use(dFrameContent)
})
