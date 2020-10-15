import Vue from 'vue'
import Vuex from 'vuex'
import tinycolor from 'tinycolor2'
import { sessionStoreBuilder } from '@koumoul/sd-vue/src'

Vue.use(Vuex)

export default () => {
  return new Vuex.Store({
    modules: {
      session: sessionStoreBuilder()
    },
    state: {
      owner: null,
      config: null,
      draft: false,
      initialQuery: {},
      textDark: '#212121'
    },
    getters: {
      linkColor(state) {
        const c = tinycolor(state.config.themeColor)
        const darkness = 1 - c.getLuminance()
        if (darkness > 0.7) return state.config.themeColor
        return c.darken((0.7 - darkness) * 100).toString()
      },
      themeColorDark(state) {
        return tinycolor(state.config.themeColor).getLuminance() < 0.4
      },
      footerColorDark(state) {
        return tinycolor(state.config.footerColor).getLuminance() < 0.4
      }
    },
    mutations: {
      setAny(state, params) {
        Object.assign(state, params)
      }
    },
    actions: {
      async fetchConfig({ state, commit }) {
        const config = await this.$axios.$get(`${process.env.publicUrl}/api/v1/config`, { params: { draft: state.draft } })
        commit('setAny', { config })
      },
      async init({ commit, dispatch }, { req, env, app, route }) {
        dispatch('session/init', { cookies: this.$cookies, baseUrl: env.publicUrl + '/api/v1/session', cookieDomain: env.sessionDomain })
        await dispatch('fetchConfig')
        // const initialQuery = {}
        // env = { ...env }
        //
        // if (route.query.draft) initialQuery.draft = route.query.draft
        // if (route.query.portalId) initialQuery.portalId = route.query.portalId
        // const draft = route.query.draft === 'true'
        // const portalId = req.headers['x-portal-id']
        // if (!portalId) {
        //   // portal was called outside of portals-manager re-exposition
        //   return commit('setAny', { env, images: {}, config: {} })
        // }
        //
        // commit('setAny', {
        //   env,
        //   initialQuery,
        //   owner: req.headers['x-owner'],
        //   portalId,
        //   draft
        // })
        //
      }
    }
  })
}
