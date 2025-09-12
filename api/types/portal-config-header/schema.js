export default {
  $id: 'https://github.com/data-fair/portals/portal-config-header',
  'x-exports': [],
  title: 'Header',
  type: 'object',
  layout: {
    title: null
  },
  required: ['show', 'logoPrimaryType', 'navBarColor', 'density'],
  properties: {
    show: {
      type: 'boolean',
      layout: { props: { color: 'primary' }, comp: 'switch' },
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
        }
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
      layout: {
        if: 'parent.data?.logoPrimaryType !== "hidden"',
        props: {
          clearable: true
        }
      },
      type: 'string',
      title: 'Lien au clic sur le logo principal',
      description: 'Lien vers lequel l\'utilisateur sera redirigé en cliquant sur le logo. Par défaut, il sera redirigé vers la page d\'accueil.'
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
        }
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
      layout: {
        if: 'parent.data?.show',
        props: {
          clearable: true
        }
      },
      type: 'string',
      title: 'Lien au clic sur le logo secondaire',
      description: 'Lien vers lequel sera redirigé l\'utilisateur lors du clic sur le logo secondaire.'
    },
    social: {
      type: 'boolean',
      title: 'Afficher les liens de réseaux sociaux',
      layout: {
        if: 'parent.data?.show',
        props: { color: 'primary' },
        comp: 'switch'
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
        { const: 'surface', title: 'Couleur des surfaces' }
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
    density: {
      type: 'string',
      title: 'Densité',
      default: 'default',
      oneOf: [
        { const: 'default', title: 'Normale' },
        // { const: 'prominent', title: 'Étendue' },
        { const: 'comfortable', title: 'Un peu plus dense' },
        { const: 'compact', title: 'Très dense' }
      ]
    }
  }
}
