export default () => ({
  state: {
    pages: null,
    datasetsList: null,
    applicationsList: null,
    usesList: null
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
          navigation.push({ title: page.title, to: `/pages/${page.id}`, position: page.navigation.position, updatedAt: page.updated.date })
        }
        if (page.navigation && page.navigation.type === 'menu') {
          let menuItem = navigation.find(item => !!item.children && item.title.toLowerCase() === page.navigation.title.toLowerCase())
          if (!menuItem) {
            menuItem = { title: page.navigation.title, children: [] }
            navigation.push(menuItem)
          }
          menuItem.children.push({ title: page.title, to: `/pages/${page.id}`, position: page.navigation.position, updatedAt: page.updated.date })
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
    },
    sitemapShort (state, getters, rootState) {
      const pages = [
        { to: '/', title: 'Accueil', updatedAt: rootState.config.updatedAt, priority: 1 },
        { to: '/sitemap', title: 'Plan du site', priority: 1 }
      ]
      for (const nav of getters.navigation) {
        if (nav.to && !pages.find(p => p.to === nav.to)) pages.push({ to: nav.to, title: nav.title, updatedAt: nav.updatedAt || rootState.config.updatedAt })
        for (const child of nav.children || []) {
          if (child.to && !pages.find(p => p.to === child.to)) pages.push({ to: child.to, title: child.title, updatedAt: child.updatedAt || rootState.config.updatedAt })
        }
      }
      if (rootState.config.contactFooter && !pages.find(p => p.to === '/contact')) {
        pages.push({ to: '/contact', title: 'Contactez-nous' })
      }
      for (const link of (rootState.config.footerLinks || []).concat(rootState.config.footerImportantLinks || [])) {
        if (link.type === 'internal' && link.page) {
          const page = state.pages.find(p => p.id === link.page.id)
          if (page) {
            const info = { to: '/pages/' + page.id, title: page.title, updatedAt: page.updated.date }
            if (!pages.find(p => p.to === info.to)) pages.push(info)
          }
        } else if (link.href && link.title) {
          const to = link.href.replace(state.publicUrl + '/', '/')
          if (to.startsWith('/')) {
            if (to.startsWith('/pages/')) {
              const page = state.pages.find(p => p.id === to.replace('/pages/', ''))
              if (page) {
                const info = { to: '/pages/' + page.id, title: page.title, updatedAt: page.updated.date }
                if (!pages.find(p => p.to === info.to)) pages.push(info)
              }
            } else {
              if (!pages.find(p => p.to === to)) pages.push({ to, title: link.title })
            }
          }
        }
      }
      return pages
    },
    sitemapFull (state, getters, rootState) {
      const pages = [...getters.sitemapShort]

      // add news
      for (const page of state.pages.filter(p => p.template === 'news')) {
        const to = '/pages/' + page.id
        if (!pages.find(p => p.to === to)) pages.push({ to, title: page.title, updatedAt: page.updated.date })
      }

      // add all datasets of catalog
      for (const dataset of state.datasetsList || []) {
        const to = '/datasets/' + dataset.slug
        if (!pages.find(p => p.to === to)) pages.push({ to, title: dataset.title, updatedAt: dataset.updatedAt })
      }

      // add all applications of catalog
      for (const application of state.applicationsList || []) {
        const to = '/applications/' + application.slug
        if (!pages.find(p => p.to === to)) pages.push({ to, title: application.title, updatedAt: application.updatedAt })
      }

      // add all uses of catalog
      for (const use of state.usesList || []) {
        const to = '/uses/' + use._id
        if (!pages.find(p => p.to === to)) pages.push({ to, title: use.title, updatedAt: use.updated.date })
      }
      return pages
    }
  },
  actions: {
    async fetchPages ({ state, commit }) {
      const pages = (await this.$axios.$get(state.publicUrl + `/api/v1/portals/${state.portal._id}/pages`, { params: { size: 1000, select: 'id,title,navigation,template,updated.date', published: true } })).results
      commit('setAny', { pages })
    },
    async fetchDatasetsList ({ state, commit, rootState, rootGetters }) {
      const params = { size: 10000, count: false, raw: true, select: 'id,slug,title,updatedAt', owner: rootGetters.owner, publicationSites: 'data-fair-portals:' + rootState.portal._id }
      const datasetsList = (await this.$axios.$get(`${rootGetters.dataFairUrl}/api/v1/datasets`, { params })).results
      commit('setAny', { datasetsList })
    },
    async fetchApplicationsList ({ state, commit, rootState, rootGetters }) {
      const params = { size: 10000, count: false, raw: true, select: 'id,slug,title,updatedAt', owner: rootGetters.owner, publicationSites: 'data-fair-portals:' + rootState.portal._id }
      const applicationsList = (await this.$axios.$get(`${rootGetters.dataFairUrl}/api/v1/applications`, { params })).results
      commit('setAny', { applicationsList })
    },
    async fetchUsesList ({ state, commit, rootState, rootGetters }) {
      const params = { size: 10000, select: '_id,title,updated.date' }
      const usesList = (await this.$axios.$get(`/api/v1/portals/${rootState.portal._id}/uses`, { params })).results
      commit('setAny', { usesList })
    }
  }
})
