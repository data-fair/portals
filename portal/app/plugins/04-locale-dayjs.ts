import { createLocaleDayjs } from '@data-fair/lib-vue/locale-dayjs.js'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((app) => {
  const lang = useCookie<'fr' | 'en'>('i18n_lang', { default: () => 'fr' })

  app.vueApp.use(createLocaleDayjs(lang.value))
})
