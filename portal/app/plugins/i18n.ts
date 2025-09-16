import { createI18n } from 'vue-i18n'

export default defineNuxtPlugin(({ vueApp }) => {
  const lang = useCookie<'fr' | 'en'>('i18n_lang', { default: () => 'fr' })
  const i18n = createI18n({
    locale: lang.value,
    legacy: false
  })

  vueApp.use(i18n)
})
