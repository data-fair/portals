import dFrameContent from '@data-fair/frame/lib/vue-router/d-frame-content.js'
import { defineNuxtPlugin, useRouter } from '#app'

export default defineNuxtPlugin(async (app) => {
  dFrameContent(useRouter())
})
