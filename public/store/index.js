import Vue from 'vue'
import Vuex from 'vuex'
import { sessionStoreBuilder } from '@koumoul/sd-vue/src'

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
      publicBaseUrl: ''
    },
    getters: {
      embed () {
        try {
          return window.self !== window.top
        } catch (e) {
          return true
        }
      },
      linkColor (state) {
        if (!state.config) return
        return Vue.prototype.$readableColor(state.config.themeColor)
      },
      themeColorDark (state) {
        if (!state.config) return
        return Vue.prototype.$color(state.config.themeColor).getLuminance() < 0.4
      },
      footerColorDark (state) {
        if (!state.config) return
        return Vue.prototype.$color(state.config.footerColor).getLuminance() < 0.4
      },
      owner (state) {
        if (!state.config) return
        return state.config.owner.type + ':' + state.config.owner.id
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
        console.log('fetch config', `${state.publicUrl}/api/v1/portals/${portalId}/config`)
        try {
          const config = await this.$axios.$get(`${state.publicUrl}/api/v1/portals/${portalId}/config`, { params: { draft: state.draft } })
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
        if (req && req.headers && req.headers.host && new URL(env.mainPublicUrl).host !== req.headers.host) {
          // portal exposed on an external domain has to be at the root
          const publicUrl = `http${env.development ? '' : 's'}://${req.headers.host}`
          // console.log('portal served on specific domain', publicUrl)
          commit('setAny', { publicUrl, publicBaseUrl: publicUrl })
        } else if (!state.publicUrl) {
          // accessing the portal simply as a page the portals manager
          const publicUrlInfo = { publicUrl: env.mainPublicUrl, publicBaseUrl: new URL(env.mainPublicUrl).origin }
          // console.log('portal served on default domain', publicUrlInfo)
          commit('setAny', publicUrlInfo)
        }
        dispatch('session/init', {
          cookies: this.$cookies,
          directoryUrl: getters.directoryUrl
        })
        if (!state.portal) {
          const portalId = route.query.portalId || env.portalId || (req && req.headers && req.headers['x-portal-id'])
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
              }
            })
            await dispatch('fetchConfig', portalId)
          }
        }
      },
      // called only on the server, used to prefill the store
      async nuxtServerInit ({ dispatch, state, commit }, { route, req, env, redirect }) {
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
