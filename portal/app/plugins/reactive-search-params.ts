import { createReactiveSearchParams } from '@data-fair/lib-vue/reactive-search-params.js'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(({ vueApp }) => {
  const router = useRouter()

  vueApp.use(createReactiveSearchParams(router))
})
