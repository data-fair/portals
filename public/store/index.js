import Vue from 'vue'
import Vuex from 'vuex'
import { sessionStoreBuilder } from '@data-fair/sd-vue/src'

const debug = require('debug')('portals:store')
debug.log = console.log.bind(console)

Vue.use(Vuex)

export default () => {
  return new Vuex.Store({
    modules: {
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
        console.log(state.config.backgroundColor)
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
      hasSocialLinks (state) {
        return state.config &&
          (state.config.twitter || state.config.facebook || state.config.linkedin || state.config.instagram || state.config.youtube || state.config.vimeo)
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
