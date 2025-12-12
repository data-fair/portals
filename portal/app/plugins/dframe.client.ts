import dFrameContentVueRouter from '@data-fair/frame/lib/vue-router/d-frame-content.js'
import useDFrameParentUrls from '@data-fair/frame/lib/vue/use-parent-urls'
import { defineNuxtPlugin, useRouter } from '#app'

export default defineNuxtPlugin(async (app) => {
  const router = useRouter()
  const dFrameContent = dFrameContentVueRouter(router)
  const dFrameParentUrls = useDFrameParentUrls(dFrameContent, router)
  return { provide: { dFrameContent, dFrameParentUrls } }
})
