export default {
  $id: 'https://github.com/data-fair/portals/portal-config-nav-bar',
  'x-exports': [],
  title: 'NavBar',
  type: 'object',
  layout: { title: null },
  properties: {
    logoType: {
      type: 'string',
      title: 'Logo principal',
      layout: {
        switch: [{
          if: 'parent.data?.logoType === "local"',
          cols: { md: 6 }
        }]
      },
      default: 'default',
      oneOf: [
        { const: 'default', title: 'Utiliser le logo principal' },
        { const: 'local', title: 'Charger une image' },
        { const: 'hidden', title: 'Ne pas afficher de logo' }
      ]
    },
    logo: {
      type: 'object',
      title: 'Logo principal',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        if: 'parent.data?.logoPrimaryType === "local"',
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Logo principal' }
          }
        },
        cols: { md: 6 }
      },
      properties: {
        _id: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        mimeType: {
          type: 'string'
        },
        mobileAlt: {
          type: 'boolean'
        }
      }
    },
    logoMobile: {
      type: 'object',
      title: 'Logo principal - Alternative mobile',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        if: 'parent.data?.logoType !== "hidden"',
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Logo principal - Alternative mobile' }
          }
        },
        cols: { md: 6 }
      },
      properties: {
        _id: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        mimeType: {
          type: 'string'
        },
        mobileAlt: {
          type: 'boolean'
        }
      }
    },
    logoLink: {
      type: 'string',
      title: 'Lien au clic sur le logo principal',
      description: 'Lien vers lequel l\'utilisateur sera redirigé en cliquant sur le logo. Par défaut, il sera redirigé vers la page d\'accueil.',
      layout: {
        if: 'parent.data?.logoType !== "hidden"',
        props: { clearable: true },
        cols: { md: 6 }
      }
    },
    color: {
      type: 'string',
      title: 'Couleur de la barre de navigation',
      layout: { cols: { md: 4 } },
      default: 'primary',
      oneOf: [
        { const: 'primary', title: 'Couleur principale' },
        { const: 'secondary', title: 'Couleur secondaire' },
        { const: 'accent', title: 'Couleur accentuée' },
        { const: 'surface', title: 'Couleur des surfaces' },
        { const: 'surface-inverse', title: 'Couleur inversée des surfaces' },
        { const: 'background', title: 'Couleur du fond de page' }
      ]
    },
    loginColor: {
      type: 'string',
      title: 'Couleur du bouton de connexion',
      layout: { cols: { md: 4 } },
      default: 'navBar',
      oneOf: [
        { const: 'navBar', title: 'Couleur de la barre de navigation' },
        { const: 'primary', title: 'Couleur principale' },
        { const: 'secondary', title: 'Couleur secondaire' },
        { const: 'accent', title: 'Couleur accentuée' },
        { const: 'surface', title: 'Couleur des surfaces' },
        { const: 'surface-inverse', title: 'Couleur inversée des surfaces' },
        { const: 'background', title: 'Couleur du fond de page' }
      ]
    },
    sliderColor: {
      type: 'string',
      title: "Couleur de l'indicateur de l'élément actif",
      layout: { cols: { md: 4 } },
      oneOf: [
        { const: 'default', title: 'Couleur par défaut' },
        { const: 'primary', title: 'Couleur principale' },
        { const: 'secondary', title: 'Couleur secondaire' },
        { const: 'accent', title: 'Couleur accentuée' },
        { const: 'surface', title: 'Couleur des surfaces' },
        { const: 'surface-inverse', title: 'Couleur inversée des surfaces' },
        { const: 'background', title: 'Couleur du fond de page' }
      ]
    },
    transparent: {
      type: 'boolean',
      title: 'Appliquer un effet de transparence',
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      }
    },
    keepOnScroll: {
      type: 'boolean',
      title: 'Garder la barre de navigation affichée au scroll',
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      }
    },
    uppercaseTitle: {
      type: 'boolean',
      title: 'Afficher les titres des onglets en majuscules',
      default: true,
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      }
    }
  }
}
