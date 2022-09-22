import Vue from 'vue'
import Vuex from 'vuex'
import { sessionStoreBuilder } from '@data-fair/sd-vue/src'
import navigation from './navigation'

const debug = require('debug')('portals:store')
debug.log = console.log.bind(console)

Vue.use(Vuex)

export default () => {
  return new Vuex.Store({
    modules: {
      navigation: navigation(),
      session: sessionStoreBuilder()
    },
    state: {
      config: null,
      portal: null,
      draft: false,
      initialQuery: {},
      textDark: '#212121',
      breadcrumbs: null,
      publicUrl: '',
      publicBaseUrl: '',
      html: false,
      inPortal: false
    },
    getters: {
      embed () {
        try {
          return window.self !== window.top
        } catch (e) {
          return true
        }
      },
      backgroundColor (state) {
        if (!state.config) return
        if (state.config.backgroundColor === 'white' || !state.config.backgroundColor) return '#FFFFFF'
        if (state.config.backgroundColor === 'lightGrey') return '#FAFAFA'
      },
      secondaryColor (state) {
        if (!state.config) return
        return state.config.secondaryColor || state.config.themeColor
      },
      readableThemeColor (state) {
        if (!state.config) return
        return Vue.prototype.$readableColor(state.config.themeColor)
      },
      backgroundableThemeColor (state, getters) {
        if (!state.config) return
        return Vue.prototype.$backgroundableColor(state.config.themeColor)
      },
      readableSecondaryColor (state, getters) {
        if (!state.config) return
        return Vue.prototype.$readableColor(getters.secondaryColor)
      },
      backgroundableSecondaryColor (state, getters) {
        if (!state.config) return
        return Vue.prototype.$backgroundableColor(getters.secondaryColor)
      },
      themeColorDark (state) {
        if (!state.config) return
        return Vue.prototype.$color(state.config.themeColor).getLuminance() < 0.4
      },
      appBarMainColor (state) {
        const appBarColor = state.config.appBarColor || 'primary'
        if (appBarColor.startsWith('secondary')) return 'secondary'
        if (appBarColor.startsWith('primary')) return 'primary'
        if (appBarColor === 'grey') return '#424242'
        return appBarColor
      },
      appBarMainColorDark (state, getters) {
        if (getters.appBarMainColor === 'secondary') return getters.secondaryColorDark
        if (getters.appBarMainColor === 'primary') return getters.themeColorDark
        if (state.config.appBarColor === 'grey') return true
        if (state.config.appBarColor === 'white') return false
        return true
      },
      headerColor (state, getters) {
        if (state.config.headerColor === 'page' || !state.config.headerColor) return getters.backgroundColor
        if (state.config.headerColor === 'appBar') return 'transparent'
      },
      headerColorDark (state, getters) {
        if (getters.headerColor === 'transparent') return getters.appBarMainColorDark
        return false
      },
      footerColor (state, getters) {
        if (state.config.footerColor === 'primary') return state.config.themeColor
        if (state.config.footerColor === 'secondary') return getters.secondaryColor
        if (state.config.footerColor === 'grey' || !state.config.footerColor) return '#424242'
        if (state.config.footerColor === 'white') return '#FFFFFF'
        return state.config.footerColor
      },
      footerColorDark (state, getters) {
        if (!state.config) return
        return Vue.prototype.$color(getters.footerColor).getLuminance() < 0.4
      },
      personalNavigationColor (state, getters) {
        if (state.config.personalNavigationColor === 'primary' || !state.config.personalNavigationColor) return state.config.themeColor
        if (state.config.personalNavigationColor === 'secondary') return getters.secondaryColor
        if (state.config.personalNavigationColor === 'grey' || !state.config.footerColor) return '#424242'
        if (state.config.personalNavigationColor === 'white') return '#FFFFFF'
        return state.config.personalNavigationColor
      },
      personalNavigationColorDark (state, getters) {
        if (!state.config) return
        return Vue.prototype.$color(getters.personalNavigationColor).getLuminance() < 0.4
      },
      secondaryColorDark (state, getters) {
        if (!state.config) return
        return Vue.prototype.$color(getters.secondaryColor).getLuminance() < 0.4
      },
      bodyFontFamily (state) {
        if (!state.config || !state.config.bodyFont) return '"Nunito", serif'
        return `"${state.config.bodyFont.name}", ${state.config.bodyFont.category}`
      },
      headingsFontFamily (state, getters) {
        if (!state.config || !state.config.headingsFont) return getters.bodyFontFamily
        return `"${state.config.headingsFont.name}", ${state.config.headingsFont.category}`
      },
      owner (state) {
        if (!state.config) return
        let owner = state.config.owner.type + ':' + state.config.owner.id
        if (state.config.department) owner += ':' + state.config.owner.department
        return owner
      },
      directoryUrl (state) {
        return state.publicBaseUrl + '/simple-directory'
      },
      dataFairUrl (state) {
        return state.publicBaseUrl + '/data-fair'
      },
      openapiViewerUrl (state) {
        return state.publicBaseUrl + '/openapi-viewer'
      },
      notifyUrl (state) {
        return state.publicBaseUrl + '/notify'
      },
      notifyWSUrl (state, getters) {
        let url = getters.notifyUrl.replace('http://', 'ws://').replace('https://', 'wss://')
        if (!url.endsWith('/')) url += '/'
        return url
      },
      captureUrl (state) {
        return state.publicBaseUrl + '/capture'
      },
      hasSocialLinks (state) {
        return state.config &&
          (state.config.twitter || state.config.facebook || state.config.linkedin || state.config.instagram || state.config.youtube || state.config.vimeo)
      },
      logoUrl (state) {
        return `${state.publicUrl}/api/v1/portals/${state.portal._id}/assets/logo?draft=${state.draft}&hash=${state.config.assets.logo && state.config.assets.logo.hash}`
      },
      portalHead (state) {
        return (route) => {
          // For i18n support, see https://github.com/nuxt/nuxtjs.org/blob/master/layouts/default.vue
          const canonical = state.publicUrl + route.path
          const link = [
            { rel: 'canonical', href: canonical }
          ]
          link.push({ rel: 'icon', type: 'image/x-icon', href: `${state.publicUrl}/api/v1/portals/${state.portal._id}/assets/favicon?draft=${state.draft}&hash=${state.config.assets.favicon && state.config.assets.favicon.hash}` })
          link.forEach((l) => {
            if (l.href.slice(-1) === '/') {
              l.href = l.href.slice(0, -1)
            }
          })
          const fonts = []
          if (state.config.bodyFont) fonts.push(state.config.bodyFont.name)
          if (state.config.headingsFont) fonts.push(state.config.headingsFont.name)
          if (fonts.length) {
            link.push({ rel: 'stylesheet', href: `https://fonts.googleapis.com/css?family=${fonts.join('|')}&display=swap` })
          }
          const meta = [
            { name: 'twitter:card', content: 'summary' },
            { hid: 'og:title', property: 'og:title', content: state.config.title },
            { property: 'og:locale', content: 'fr_FR' },
            { hid: 'og:image', property: 'og:image', content: `${state.publicUrl}/api/v1/portals/${state.portal._id}/assets/home?draft=${state.draft}&hash=${state.config.assets.home && state.config.assets.home.hash}` },
            { hid: 'og:image:width', property: 'og:image:width', content: 567 },
            { hid: 'og:image:height', property: 'og:image:height', content: 383 }
          ]
          if (state.config.twitter) meta.push({ name: 'twitter:site', content: state.config.twitter })
          return {
            meta,
            link
          }
        }
      }
    },
    mutations: {
      setAny (state, params) {
        Object.assign(state, params)
      }
    },
    actions: {
      async fetchPortalInfos ({ state, commit }, portalId) {
        const portal = await this.$axios.$get(`api/v1/portals/${portalId}`, { params: { noConfig: true } })
        commit('setAny', { portal })
      },
      async fetchConfig ({ state, commit }, portalId) {
        debug('fetch config', `${state.publicUrl}/api/v1/portals/${portalId}/config`)
        try {
          const config = await this.$axios.$get(`${state.publicUrl}/api/v1/portals/${portalId}/config`, {
            params: { draft: state.draft, html: state.html }
          })
          commit('setAny', { config })
        } catch (err) {
          console.error('failure to fetch config', err)
          throw err
        }
      },
      setBreadcrumbs ({ commit }, breadcrumbs) {
        breadcrumbs.forEach(b => { b.exact = true })
        commit('setAny', { breadcrumbs })
        if (global.parent) parent.postMessage({ breadcrumbs }, '*')
      },
      // called both on the server and the client by plugins/init.js
      // on the server it is called before nuxtServerInit
      async init ({ state, dispatch, commit, getters }, { req, env, app, route }) {
        debug('init')
        if (req && req.headers && req.headers.host && new URL(env.mainPublicUrl).host !== req.headers.host) {
          debug('init in external domain mode')
          // portal exposed on an external domain has to be at the root
          const publicUrl = `http${env.development ? '' : 's'}://${req.headers.host}`
          // console.log('portal served on specific domain', publicUrl)
          commit('setAny', { publicUrl, publicBaseUrl: publicUrl })
        } else if (!state.publicUrl) {
          // accessing the portal simply as a page of the portals manager
          const publicUrlInfo = { publicUrl: env.mainPublicUrl, publicBaseUrl: new URL(env.mainPublicUrl).origin }
          debug('init publicUrlInfo', publicUrlInfo)
          // console.log('portal served on default domain', publicUrlInfo)
          commit('setAny', publicUrlInfo)
        }
        dispatch('session/init', {
          cookies: this.$cookies,
          directoryUrl: getters.directoryUrl
        })
        if (!state.portal) {
          const portalId = route.query.portalId || env.portalId || (req && req.headers && req.headers['x-portal-id'])
          debug('init portal from id ?', portalId)
          if (portalId) {
            const initialQuery = {}
            if (route.query.draft) initialQuery.draft = route.query.draft
            if (route.query.portalId) initialQuery.portalId = route.query.portalId
            const draft = route.query.draft === 'true'
            commit('setAny', {
              initialQuery,
              draft,
              portal: {
                _id: portalId
              },
              html: true,
              inPortal: true
            })
            await dispatch('fetchConfig', portalId)
          }
        }
      },
      // called only on the server, used to prefill the store
      async nuxtServerInit ({ dispatch, state, commit }, { route, req, env, redirect }) {
        debug('nuxtServerInit in portal mode ?', !!state.portal)
        // case where we are opening a portal
        if (state.portal) {
          // automatic switch to the account that owns this portal if we are a member
          if (state.session.user) {
            const user = state.session.user
            if (
              user &&
              state.config.owner.type === 'organization' &&
              user.organizations.find(o => o.id === state.config.owner.id) &&
              (!user.organization || user.organization.id !== state.config.owner.id)
            ) {
              dispatch('session/switchOrganization', state.config.owner.id)
              // the switch param is necessary to actually trigger a redirect, it is removed in plugins/session.js
              redirect({ path: route.path, query: { ...route.query, switch: 1 } })
            }
            if (
              user &&
              state.config.owner.type === 'user' &&
              user.organization
            ) {
              dispatch('session/switchOrganization', null)
              // the switch param is necessary to actually trigger a redirect, it is removed in plugins/session.js
              redirect({ path: route.path, query: { ...route.query, switch: 1 } })
            }
          }
        }
      }
    }
  })
}
