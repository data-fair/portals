import { createLocaleDayjs } from '@data-fair/lib-vue/locale-dayjs.js'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(({ vueApp }) => {
  const lang = useCookie<'fr' | 'en'>('i18n_lang', { default: () => 'fr' })

  vueApp.use(createLocaleDayjs(lang.value))
})
