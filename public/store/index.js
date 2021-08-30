import Vue from 'vue'
import Vuex from 'vuex'
import tinycolor from 'tinycolor2'
import { sessionStoreBuilder } from '@koumoul/sd-vue/src'

Vue.use(Vuex)

export default () => {
  return new Vuex.Store({
    modules: {
      session: sessionStoreBuilder(),
    },
    state: {
      config: null,
      portal: null,
      draft: false,
      initialQuery: {},
      textDark: '#212121',
      breadcrumbs: null,
      publicUrl: '',
    },
    getters: {
      embed() {
        try {
          return window.self !== window.top
        } catch (e) {
          return true
        }
      },
      linkColor(state) {
        if (!state.config) return
        const c = tinycolor(state.config.themeColor)
        const darkness = 1 - c.getLuminance()
        if (darkness > 0.7) return state.config.themeColor
        return c.darken((0.7 - darkness) * 100).toString()
      },
      themeColorDark(state) {
        if (!state.config) return
        return tinycolor(state.config.themeColor).getLuminance() < 0.4
      },
      footerColorDark(state) {
        if (!state.config) return
        return tinycolor(state.config.footerColor).getLuminance() < 0.4
      },
      owner(state) {
        if (!state.config) return
        return state.config.owner.type + ':' + state.config.owner.id
      },
      directoryUrl(state) {
        return state.publicUrl + '/simple-directory'
      },
      dataFairUrl(state) {
        return state.publicUrl + '/data-fair'
      },
      openapiViewerUrl(state) {
        return state.publicUrl + '/openapi-viewer'
      },
      notifyUrl(state) {
        return state.publicUrl + '/notify'
      },
      notifyWSUrl(state, getters) {
        return getters.notifyUrl.replace('ws://', 'http://').replace('wss://', 'https://')
      },
    },
    mutations: {
      setAny(state, params) {
        Object.assign(state, params)
      },
    },
    actions: {
      async fetchPortalInfos({ state, commit }, portalId) {
        const portal = await this.$axios.$get(`${state.publicUrl}/api/v1/portals/${portalId}`, { params: { noConfig: true } })
        commit('setAny', { portal })
      },
      async fetchConfig({ state, commit }, portalId) {
        console.log('fetch config', `${state.publicUrl}/api/v1/portals/${portalId}/config`)
        try {
          const config = await this.$axios.$get(`${state.publicUrl}/api/v1/portals/${portalId}/config`, { params: { draft: state.draft } })
          commit('setAny', { config })
        } catch (err) {
          console.error('failure to fetch config', err)
          throw err
        }
      },
      setBreadcrumbs({ commit }, breadcrumbs) {
        breadcrumbs.forEach(b => { b.exact = true })
        commit('setAny', { breadcrumbs })
        if (global.parent) parent.postMessage({ breadcrumbs }, '*')
      },
      // called both on the server and the client by plugins/init.js
      // on the server it is called before nuxtServerInit
      init({ state, dispatch, commit, getters }, { req, env, app, route }) {
        if (req && req.headers && req.headers.host) {
          const publicUrl = `http${env.development ? '' : 's'}://${req.headers.host}`
          console.log('current public url', publicUrl)
          commit('setAny', { publicUrl })
        }
        dispatch('session/init', {
          cookies: this.$cookies,
          directoryUrl: getters.directoryUrl,
        })
      },
      // called only on the server, used to prefill the store
      async nuxtServerInit({ dispatch, state, commit }, { route, req, env, redirect }) {
        const portalId = route.query.portalId || env.portalId || (req && req.headers && req.headers['x-portal-id'])
        // case where we are opening a portal
        if (portalId) {
          const initialQuery = {}
          if (route.query.draft) initialQuery.draft = route.query.draft
          if (route.query.portalId) initialQuery.portalId = route.query.portalId
          const draft = route.query.draft === 'true'
          commit('setAny', {
            initialQuery,
            draft,
            portal: {
              _id: portalId,
            },
          })
          await dispatch('fetchConfig', portalId)

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
      },
    },
  })
}
