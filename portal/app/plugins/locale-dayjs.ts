import { createLocaleDayjs } from '@data-fair/lib-vue/locale-dayjs.js'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const lang = (nuxtApp.$i18n?.locale?.value as 'fr' | 'en') || useCookie<'fr' | 'en'>('i18n_lang', { readonly: true, default: () => 'fr' }).value

  nuxtApp.vueApp.use(createLocaleDayjs(lang))
})
