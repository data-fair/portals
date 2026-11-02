export default {
  $id: 'https://github.com/data-fair/portals/portal-config-nav-bar',
  'x-exports': [],
  title: 'NavBar',
  type: 'object',
  layout: { title: null },
  properties: {
    logoType: {
      type: 'string',
      title: 'Main logo',
      'x-i18n-title': { fr: 'Logo principal' },
      layout: {
        switch: [{
          if: 'parent.data?.logoType === "local"',
          cols: { md: 6 }
        }]
      },
      default: 'default',
      oneOf: [
        { const: 'default', title: 'Use the main logo', 'x-i18n-title': { fr: 'Utiliser le logo principal' } },
        { const: 'local', title: 'Upload an image', 'x-i18n-title': { fr: 'Charger une image' } },
        { const: 'hidden', title: 'Do not show a logo', 'x-i18n-title': { fr: 'Ne pas afficher de logo' } }
      ]
    },
    logo: {
      type: 'object',
      title: 'Main logo',
      'x-i18n-title': { fr: 'Logo principal' },
      required: ['_id', 'name', 'mimeType'],
      layout: {
        if: 'parent.data?.logoType === "local"',
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Main logo', 'x-i18n-label': { fr: 'Logo principal' } }
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
      title: 'Main logo - mobile alternative',
      'x-i18n-title': { fr: 'Logo principal - Alternative mobile' },
      required: ['_id', 'name', 'mimeType'],
      layout: {
        if: 'parent.data?.logoType !== "hidden"',
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Main logo - mobile alternative', 'x-i18n-label': { fr: 'Logo principal - Alternative mobile' } }
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
      title: 'Link when clicking the main logo',
      'x-i18n-title': { fr: 'Lien au clic sur le logo principal' },
      description: 'Link the user is redirected to when clicking the logo. By default, they are redirected to the home page.',
      'x-i18n-description': { fr: "Lien vers lequel l'utilisateur sera redirigé en cliquant sur le logo. Par défaut, il sera redirigé vers la page d'accueil." },
      layout: {
        if: 'parent.data?.logoType !== "hidden"',
        props: { clearable: true },
        cols: { md: 6 }
      }
    },
    color: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-background',
      layout: {
        slots: {
          item: { name: 'color-select-item' },
          selection: { name: 'color-select-selection' }
        },
        props: { background: true },
        cols: { md: 4 }
      }
    },
    loginColor: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-background',
      title: 'Login button color',
      'x-i18n-title': { fr: 'Couleur du bouton de connexion' },
      description: 'Leave empty to use the navigation bar color.',
      'x-i18n-description': { fr: 'Laisser vide pour utiliser la couleur de la barre de navigation.' },
      layout: {
        slots: {
          item: { name: 'color-select-item' },
          selection: { name: 'color-select-selection' }
        },
        props: { background: true },
        cols: { md: 4 }
      }
    },
    sliderColor: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-background',
      title: 'Active item indicator color',
      'x-i18n-title': { fr: "Couleur de l'indicateur de l'élément actif" },
      description: 'Leave empty to use the default color.',
      'x-i18n-description': { fr: 'Laisser vide pour utiliser la couleur par défaut.' },
      layout: {
        slots: {
          item: { name: 'color-select-item' },
          selection: { name: 'color-select-selection' }
        },
        cols: { md: 4 }
      }
    },
    align: {
      type: 'string',
      title: 'Tabs position',
      'x-i18n-title': { fr: 'Position des onglets' },
      layout: { cols: { md: 4 } },
      default: 'center',
      oneOf: [
        { const: 'left', title: 'Align left', 'x-i18n-title': { fr: 'Aligner à gauche' } },
        { const: 'center', title: 'Center', 'x-i18n-title': { fr: 'Centrer' } },
      ]
    },
    tabsStyle: {
      type: 'array',
      title: 'Tab titles style',
      'x-i18n-title': { fr: 'Style des titres des onglets' },
      items: {
        type: 'string',
        oneOf: [
          { const: 'uppercaseTitle', title: 'Show in uppercase', 'x-i18n-title': { fr: 'Afficher en majuscules' } },
          { const: 'boldTitle', title: 'Show in bold', 'x-i18n-title': { fr: 'Afficher en gras' } },
          { const: 'largerFont', title: 'Larger font', 'x-i18n-title': { fr: 'Police plus grande' } },
        ]
      },
      layout: { cols: { md: 4 } }
    },
    transparent: {
      type: 'boolean',
      title: 'Slightly transparent bar when the page scrolls under it',
      'x-i18n-title': { fr: 'Barre légèrement transparente quand la page passe dessous' },
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      }
    },
    keepOnScroll: {
      type: 'boolean',
      title: 'Navigation bar always visible at the top of the screen',
      'x-i18n-title': { fr: "Barre de navigation toujours visible en haut de l'écran" },
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      }
    },
    fluid: {
      type: 'boolean',
      title: 'Show the navigation bar full width',
      'x-i18n-title': { fr: 'Afficher la barre de navigation en pleine largeur' },
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      },
      default: true
    }
  }
}
