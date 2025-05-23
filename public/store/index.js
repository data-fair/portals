import Vue from 'vue'
import Vuex from 'vuex'
import { sessionStoreBuilder } from '@data-fair/sd-vue/src'
import navigation from './navigation'
import style from './style'

const debug = require('debug')('portals:store')
debug.log = console.log.bind(console)

Vue.use(Vuex)

export default () => {
  return new Vuex.Store({
    modules: {
      navigation: navigation(),
      style: style(),
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
      mainPublicUrl: '',
      html: false,
      inPortal: false,
      concepts: null,
      userPartners: null,
      whiteLabelOwners: [],
      childBreadcrumbsRouteName: null,
      childBreadcrumbItems: null,
      processingsBasePath: null,
      notifyBasePath: '/notify',
      pageImages: {}
    },
    getters: {
      embed () {
        try {
          return window.self !== window.top
        } catch (e) {
          return true
        }
      },
      isPublished (state) {
        return state.mainPublicUrl !== state.publicUrl
      },
      owner (state) {
        if (!state.config) return
        let owner = state.config.owner.type + ':' + state.config.owner.id
        if (state.config.department) owner += ':' + state.config.owner.department
        return owner
      },
      canAdmin (state, getters) {
        if (!state.config) return false
        const activeAccount = getters['session/activeAccount']
        if (!activeAccount) return false
        return getters['session/isAccountAdmin'] && activeAccount.type === state.config.owner.type && activeAccount.id === state.config.owner.id && (!activeAccount.department || activeAccount.department === state.config.owner.department)
      },
      whiteLabel (state, getters) {
        return state.whiteLabelOwners.includes(getters.owner)
      },
      directoryUrl (state) {
        return state.publicBaseUrl + '/simple-directory'
      },
      dataFairUrl (state) {
        return state.publicBaseUrl + '/data-fair'
      },
      processingsUrl (state) {
        if (!state.processingsBasePath) return null
        return state.publicBaseUrl + state.processingsBasePath
      },
      imagesDatasetUrl (state, getters) {
        return `${getters.dataFairUrl}/api/v1/datasets/portals-images-${state.portal._id.toLowerCase().replace(/_/g, '').replace(/^-/, '').replace(/-$/, '')}`
      },
      eventsDatasetUrl (state, getters) {
        return `${getters.dataFairUrl}/api/v1/datasets/portals-events-${state.portal._id.toLowerCase().replace(/_/g, '').replace(/^-/, '').replace(/-$/, '')}`
      },
      openapiViewerUrl (state) {
        return state.publicBaseUrl + '/openapi-viewer'
      },
      notifyUrl (state) {
        return state.publicBaseUrl + state.notifyBasePath
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
      footerBackgroundUrl (state) {
        return state.config.assets.footerBackground && `${state.publicUrl}/api/v1/portals/${state.portal._id}/assets/footerBackground?draft=${state.draft}&hash=${state.config.assets.footerBackground.hash}`
      },
      portalHead (state, getters) {
        return (route, locale, applyFonts = true, htmlOverflow = 'auto') => {
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
          const googleFonts = []
          if (state.config.bodyFont && state.config.bodyFont.source === 'google-fonts') {
            googleFonts.push(state.config.bodyFont.name)
          }
          if (state.config.headingsFont && state.config.headingsFont.source === 'google-fonts') {
            googleFonts.push(state.config.headingsFont.name)
          }
          if (googleFonts.length) {
            link.push({ rel: 'stylesheet', href: `https://fonts.googleapis.com/css?family=${googleFonts.join('|')}&display=swap` })
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
            htmlAttrs: { lang: locale }, // TODO: this should be set by nuxt-i18n but it isn't for some reason
            meta,
            link,
            style: [{ vmid: 'config-style', cssText: getters.fullConfigStyle(applyFonts, htmlOverflow), type: 'text/css' }],
            // __dangerouslyDisableSanitizersByTagID: { 'config-style': ['cssText'] }
            __dangerouslyDisableSanitizers: ['style']
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
      childBreadcrumbs ({ commit }, childBreadcrumbItems) {
        commit('setAny', { childBreadcrumbItems, childBreadcrumbsRouteName: this.$router.currentRoute.name })
      },
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
      async fetchVocabulary ({ state, commit, getters }) {
        if (state.concepts) return
        const concepts = (await this.$axios.$get(getters.dataFairUrl + '/api/v1/vocabulary')).map(c => {
          const { identifiers, ...concept } = c
          concept.id = identifiers.shift()
          return concept
        })
        commit('setAny', { concepts })
      },
      async fetchUserPartners ({ state, commit, getters }) {
        if (!state.session.user) return
        if (state.config.owner.type !== 'organization') return
        if (state.userPartners) return
        try {
          const userPartners = (await this.$axios.$get(`${getters.directoryUrl}/api/organizations/${state.config.owner.id}/partners/_user-partners`))
          commit('setAny', { userPartners })
        } catch (err) {
          // errors are none-blocking to tolerate an older SD instance or one with MANGE_PARTNERS != true
          console.warn('failure to fetch user partners', err)
        }
      },
      async fetchPageImages ({ state, commit, getters }, pageId) {
        if (state.pageImages[pageId]) return state.pageImages[pageId]
        const lines = await this.$axios.$get(getters.imagesDatasetUrl + '/lines', {
          params: {
            select: 'assetId,_attachment_url',
            qs: `pageId:"${pageId}"`,
            thumbnail: '1785x800' // max width of the vertical layout
          }
        })
        const images = lines.results.reduce((a, image) => { a[image.assetId] = image._thumbnail || image._attachment_url; return a }, {})
        const pageImages = { ...state.pageImages, [pageId]: images }
        commit('setAny', { pageImages })
        return images
      },
      setManagerBreadcrumbs ({ commit }, breadcrumbs) {
        breadcrumbs.forEach(b => { b.exact = true })
        commit('setAny', { breadcrumbs })
        if (global.parent) parent.postMessage({ breadcrumbs }, '*')
      },
      autoSwitchOrganization ({ state, dispatch }, { route, redirect }) {
        // case where we are opening a portal
        if (!state.portal || route.path.startsWith('/me/') || route.path.startsWith('/manager/')) {
          return
        }
        // automatic switch to the account that owns this portal if we are a member
        // or a partner if we are member of a partner available
        if (state.session.user) {
          const user = state.session.user
          if (
            user &&
            state.config.owner.type === 'organization' &&
            user.organizations.find(o => o.id === state.config.owner.id) &&
            (!user.organization || user.organization.id !== state.config.owner.id)
          ) {
            console.log('switch to portal organization owner account')
            dispatch('session/switchOrganization', state.config.owner.id)
            // the switch param is necessary to actually trigger a redirect, it is removed in plugins/session.js
            if (redirect) redirect({ path: route.path, query: { ...route.query, switch: 1 } })
          } else if (
            user &&
            state.config.owner.type === 'user' &&
            user.organization
          ) {
            console.log('switch to portal user owner account')
            dispatch('session/switchOrganization', null)
            // the switch param is necessary to actually trigger a redirect, it is removed in plugins/session.js
            if (redirect) redirect({ path: route.path, query: { ...route.query, switch: 1 } })
          } else if (
            state.config.owner.type === 'organization' &&
            state.userPartners &&
            state.userPartners.find(p => p.id === state.config.owner.id)
          ) {
            console.log('switch to portal partner account')
            const partner = state.userPartners.find(p => p.id === state.config.owner.id)
            dispatch('session/switchOrganization', partner.id)
          }
        }
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
          commit('setAny', { publicUrl, publicBaseUrl: publicUrl, mainPublicUrl: env.mainPublicUrl })
        } else if (!state.publicUrl) {
          // accessing the portal simply as a page of the portals manager
          const publicUrlInfo = { publicUrl: env.mainPublicUrl, publicBaseUrl: new URL(env.mainPublicUrl).origin, mainPublicUrl: env.mainPublicUrl }
          debug('init publicUrlInfo', publicUrlInfo)
          // console.log('portal served on default domain', publicUrlInfo)
          commit('setAny', publicUrlInfo)
        }
        if (env.processingsUrl) {
          commit('setAny', { processingsBasePath: new URL(env.processingsUrl).pathname })
        }
        if (env.notifyUrl) {
          commit('setAny', { notifyBasePath: new URL(env.notifyUrl).pathname })
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
            await dispatch('fetchUserPartners')
          }
        }

        commit('setAny', { whiteLabelOwners: env.whiteLabelOwners.split(',') })
      },
      // called only on the server, used to prefill the store
      async nuxtServerInit ({ dispatch, state, commit }, { route, req, env, redirect }) {
        debug('nuxtServerInit in portal mode ?', !!state.portal)
        dispatch('autoSwitchOrganization', { route, redirect })
      }
    }
  })
}
