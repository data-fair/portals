export default {
  $id: 'https://github.com/data-fair/portals/portal-config-header',
  'x-exports': [],
  title: 'Header',
  type: 'object',
  layout: {
    title: null
  },
  required: ['show', 'logoPrimaryType', 'showTitle', 'navBarColor', 'density', 'scrollBehavior'],
  properties: {
    show: {
      type: 'boolean',
      layout: { comp: 'switch' },
      title: 'Afficher l\'entête',
      default: true
    },
    logoPrimaryType: {
      type: 'string',
      title: 'Logo principal de l\'entête',
      description: 'Il s\'affiche dans l\'entête ou à gauche de la barre de navigation si l\'entête est masqué ou en vue mobile.',
      default: 'default',
      oneOf: [
        { const: 'default', title: 'Utiliser le logo principal' },
        { const: 'local', title: 'Charger une image' },
        { const: 'hidden', title: 'Ne pas afficher de logo' }
      ]
    },
    logoPrimary: {
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
    logoPrimaryMobile: {
      type: 'object',
      title: 'Logo principal - Alternative mobile',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        if: 'parent.data?.logoPrimaryType !== "hidden"',
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
        if: 'parent.data?.logoPrimaryType !== "hidden"',
        switch: [
          {
            if: 'parent.data?.logoPrimaryType === "default" ',
            props: { clearable: true },
            cols: { md: 6 }
          },
          {
            props: { clearable: true }
          }
        ]
      }
    },
    logoSecondary: {
      type: 'object',
      title: 'Logo secondaire de l\'entête',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        if: 'parent.data?.show',
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Logo secondaire' }
          }
        },
        cols: { md: 6 }
      },
      description: 'Logo affiché à droite de l\'entête',
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
    logoSecondaryLink: {
      type: 'string',
      title: 'Lien au clic sur le logo secondaire',
      description: 'Lien vers lequel sera redirigé l\'utilisateur lors du clic sur le logo secondaire.',
      layout: {
        if: 'parent.data?.show',
        props: {
          clearable: true
        },
        cols: { md: 6 }
      }
    },
    showTitle: {
      type: 'boolean',
      title: 'Afficher le titre du portail',
      layout: {
        if: 'parent.data?.show',
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
    },
    showSocial: {
      type: 'boolean',
      title: 'Afficher les liens de réseaux sociaux',
      layout: {
        if: 'parent.data?.show',
        comp: 'switch',
        cols: { md: 6 }
      }
    },
    headerColor: {
      layout: { if: 'parent.data?.show' },
      type: 'string',
      title: 'Couleur de l\'entête',
      default: 'navBar',
      oneOf: [
        { const: 'navBar', title: 'Couleur de la barre de navigation' },
        { const: 'background', title: 'Couleur du fond de page' }
      ]
    },
    navBarColor: {
      type: 'string',
      title: 'Couleur de la barre de navigation',
      default: 'primary',
      oneOf: [
        { const: 'primary', title: 'Couleur principale' },
        { const: 'secondary', title: 'Couleur secondaire' },
        { const: 'accent', title: 'Couleur accentuée' },
        { const: 'surface', title: 'Couleur des surfaces' },
        { const: 'background', title: 'Couleur du fond de page' }
      ]
    },
    loginColor: {
      type: 'string',
      title: 'Couleur du bouton de connexion',
      default: 'navBar',
      oneOf: [
        { const: 'navBar', title: 'Couleur de la barre de navigation' },
        { const: 'primary', title: 'Couleur principale' },
        { const: 'secondary', title: 'Couleur secondaire' },
        { const: 'accent', title: 'Couleur accentuée' },
        { const: 'surface', title: 'Couleur des surfaces' }
      ]
    },
    transparent: {
      type: 'boolean',
      title: 'Appliquer un effet de transparence',
      layout: { comp: 'switch' },
      default: false
    },
    scrollBehavior: {
      type: 'string',
      title: 'Comportement au scroll',
      default: 'hide',
      oneOf: [
        { const: 'hide', title: 'Masquer l\'entête' },
        { const: 'fully-hide', title: 'Masquer l\'entête et la barre de navigation' },
        { const: 'default', title: 'Ne rien masquer' }
      ]
    },
    density: {
      type: 'string',
      title: 'Densité',
      default: 'default',
      oneOf: [
        { const: 'default', title: 'Normale' },
        // { const: 'prominent', title: 'Étendue' },
        { const: 'comfortable', title: 'Confortable' },
        { const: 'compact', title: 'Compacte' }
      ]
    }
  }
}
