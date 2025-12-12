import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { createVuetify } from 'vuetify'
import { createRulesPlugin } from 'vuetify/labs/rules'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { vuetifySessionOptions } from '@data-fair/lib-vuetify'
import '@data-fair/lib-vuetify/style/global.scss'
import dFrameContent from '@data-fair/frame/lib/vue-router/d-frame-content.js'
import { createReactiveSearchParams } from '@data-fair/lib-vue/reactive-search-params.js'
import { createLocaleDayjs } from '@data-fair/lib-vue/locale-dayjs.js'
import { createSession } from '@data-fair/lib-vue/session.js'
import { createUiNotif } from '@data-fair/lib-vue/ui-notif.js'
import { createI18n } from 'vue-i18n'
import App from './App.vue'

(async function () {
  const router = createRouter({ history: createWebHistory($sitePath + '/portals-manager/'), routes })
  dFrameContent(router)
  const reactiveSearchParams = createReactiveSearchParams(router)
  const session = await createSession({})
  const localeDayjs = createLocaleDayjs(session.state.lang)
  const uiNotif = createUiNotif()
  const vuetify = createVuetify({
    ...vuetifySessionOptions(session, $cspNonce),
    icons: { defaultSet: 'mdi', aliases, sets: { mdi, } }
  })
  const vuetifyRules = createRulesPlugin({}, vuetify.locale)
  vuetify.defaults.value!.VColorPicker = { mode: 'hex', modes: ['hex', 'rgb', 'hsl'] }
  vuetify.defaults.value!['VjsfVerticalTabs-VSheet'] = { border: false }

  const i18n = createI18n({ locale: session.state.lang })

  createApp(App)
    .use(router)
    .use(reactiveSearchParams)
    .use(session)
    .use(localeDayjs)
    .use(uiNotif)
    .use(vuetify)
    .use(vuetifyRules)
    .use(i18n)
    .mount('#app')
})()
