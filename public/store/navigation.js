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
      let navigation = []
      if (config.website || !config.headerHide) {
        navigation.push({ title: 'Accueil', to: '/', position: 0 })
      }
      if (!config.datasetsPage || config.datasetsPage.type !== 'none') {
        navigation.push({ title: 'Données', to: '/datasets', position: 1 })
      }
      if (!config.applicationsPage || config.applicationsPage.type !== 'none') {
        navigation.push({ title: 'Visualisations', to: '/applications', position: 2 })
      }
      // DEPRECATED
      if (config.externalReusesPage && config.externalReusesPage.type !== 'none') {
        navigation.push({ title: 'Réutilisations', to: '/external-reuses', position: 3 })
      }
      if (config.usesPage && config.usesPage.type !== 'none') {
        navigation.push({ title: 'Réutilisations', to: '/uses', position: 3 })
      }
      if (config.newsPage && config.newsPage.type !== 'none') {
        navigation.push({ title: 'Actualités', to: '/news', position: 4 })
      }
      for (const page of state.pages) {
        if (page.navigation && page.navigation.type === 'direct') {
          navigation.push({ title: page.title, to: `/pages/${page.id}`, position: page.navigation.position })
        }
        if (page.navigation && page.navigation.type === 'menu') {
          let menuItem = navigation.find(item => !!item.children && item.title.toLowerCase() === page.navigation.title.toLowerCase())
          if (!menuItem) {
            menuItem = { title: page.navigation.title, children: [] }
            navigation.push(menuItem)
          }
          menuItem.children.push({ title: page.title, to: `/pages/${page.id}`, position: page.navigation.position })
        }
      }
      if (config.contactEmail && !config.contactFooter) {
        navigation.push({ title: 'Contact', to: '/contact', position: 100 })
      }

      // merge standard pages into menu items if there is a name conflict
      for (const standardTitle of [['Données', 'Catalogue des données'], ['Visualisations', 'Catalogue des visualisations'], ['Réutilisations', 'Liste des réutilisations'], ['Actualités', 'Liste des actualités']]) {
        const matchingPage = navigation.find(n => !n.children && n.title === standardTitle[0])
        const matchingMenuItem = navigation.find(n => !!n.children && n.title.toLowerCase() === standardTitle[0].toLocaleLowerCase())
        if (matchingPage && matchingMenuItem) {
          matchingMenuItem.children.push({ ...matchingPage, title: standardTitle[1] })
          navigation = navigation.filter(n => n !== matchingPage)
        }
      }

      // sort based on navigation.position
      navigation.filter(n => !!n.children).forEach(menuItem => {
        menuItem.children.sort((c1, c2) => c1.position - c2.position)
        menuItem.position = menuItem.children[0].position
      })

      navigation.sort((c1, c2) => c1.position - c2.position)
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
