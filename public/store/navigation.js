export default () => ({
  state: {
    pages: null
  },
  mutations: {
    setAny (state, params) {
      Object.assign(state, params)
    }
  },
  getters: {
    navigation (state) {
      if (!state.pages) return null
      const config = state.config
      const navigation = []
      if (config.website || !config.headerHide) {
        navigation.push({ title: 'Accueil', to: '/' })
      }
      if (!config.datasetsPage || config.datasetsPage.type !== 'none') {
        navigation.push({ title: 'Données', to: '/datasets' })
      }
      if (!config.applicationsPage || config.applicationsPage.type !== 'none') {
        navigation.push({ title: 'Visualisations', to: '/applications' })
      }
      // DEPRECATED
      if (config.externalReusesPage && config.externalReusesPage.type !== 'none') {
        navigation.push({ title: 'Réutilisations', to: '/external-reuses' })
      }
      if (config.usesPage && config.usesPage.type !== 'none') {
        navigation.push({ title: 'Réutilisations', to: '/uses' })
      }
      if (config.newsPage && config.newsPage.type !== 'none') {
        navigation.push({ title: 'Actualités', to: '/news' })
      }
      for (const page of state.pages) {
        if (page.navigation && page.navigation.type === 'direct') {
          navigation.push({ title: page.title, to: `/pages/${page.id}` })
        }
        if (page.navigation && page.navigation.type === 'menu') {
          let menuItem = navigation.find(item => item.title === page.navigation.title)
          if (!menuItem) {
            menuItem = { title: page.navigation.title, children: [] }
            navigation.push(menuItem)
          }
          menuItem.children.push({ title: page.title, to: `/pages/${page.id}` })
        }
      }
      if (config.contactEmail) {
        navigation.push({ title: 'Contact', to: '/contact' })
      }
      return navigation
    }
  },
  actions: {
    async fetchPages ({ state, commit }) {
      const pages = (await this.$axios.$get(state.publicUrl + `/api/v1/portals/${state.portal._id}/pages`, { params: { size: 1000, select: 'id,title,navigation', published: true } })).results
      commit('setAny', { pages })
    }
  }
})
