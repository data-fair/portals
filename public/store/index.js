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
    },
    getters: {
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
    },
    mutations: {
      setAny(state, params) {
        Object.assign(state, params)
      },
    },
    actions: {
      async fetchPortalInfos({ state, commit }, portalId) {
        const portal = await this.$axios.$get(`${process.env.publicUrl}/api/v1/portals/${portalId}`, { params: { noConfig: true } })
        commit('setAny', { portal })
      },
      async fetchConfig({ state, commit }, portalId) {
        const config = await this.$axios.$get(`${process.env.publicUrl}/api/v1/portals/${portalId}/config`, { params: { draft: state.draft } })
        commit('setAny', { config })
      },
      async init({ commit, dispatch, state }, { req, env, app, route }) {
        console.log('session init')
        dispatch('session/init', { cookies: this.$cookies, baseUrl: env.publicUrl + '/api/v1/session', cookieDomain: env.sessionDomain })
        console.log('session loop')
        dispatch('session/loop')
        const portalId = route.query.portalId || env.portalId || (req && req.headers && req.headers['x-portal-id'])

        // case where we are opening a portal
        if (portalId) {
          const initialQuery = {}
          if (route.query.draft) initialQuery.draft = route.query.draft
          if (route.query.portalId) initialQuery.portalId = route.query.portalId
          const draft = route.query.draft === 'true'
          console.log('set initial info')
          commit('setAny', {
            initialQuery,
            draft,
            portal: {
              _id: portalId,
            },
          })
          await dispatch('fetchConfig')

          // automatic swtich to the account that owns this portal if we are a member
          if (state.session.user) {
            const user = state.session.user
            if (
              user &&
              state.config.owner.type === 'organization' &&
              user.organizations.find(o => o.id === state.config.owner.id) &&
              (!user.organization || user.organization.id !== state.config.owner.id)
            ) {
              console.log('switch orga', state.config.owner.id)
              dispatch('session/switchOrganization', state.config.owner.id)
            }
            if (
              user &&
              state.config.owner.type === 'user' &&
              user.organization
            ) {
              console.log('no orga')
              dispatch('session/switchOrganization', null)
            }
          }
        }
      },
    },
  })
}
