export default {
  $id: 'https://github.com/data-fair/portals/portal-config-header',
  'x-exports': [],
  title: 'Header',
  type: 'object',
  layout: {
    title: null,
    // Two cards: "Options" for header-level display settings, "Contenu" for
    // what the header shows. Inside each card, nested arrays group fields into
    // discrete rows so half-width (cols md:6) fields only pair with siblings of
    // the same group (a field left alone stays on its own line).
    children: [
      {
        comp: 'card',
        title: 'Options',
        children: ['show', 'color', 'keepOnScroll']
      },
      {
        comp: 'card',
        title: 'Content',
        'x-i18n-title': { fr: 'Contenu' },
        if: 'data?.show',
        children: [
          'showSocial',
          ['logoPrimaryType', 'logoPrimary', 'logoPrimaryMobile', 'logoPrimaryLink'],
          ['logoPrimaryCentered', 'showTitle'],
          ['logoSecondary', 'logoSecondaryLink']
        ]
      }
    ]
  },
  properties: {
    show: {
      type: 'boolean',
      layout: 'switch',
      title: 'Show the header',
      'x-i18n-title': { fr: "Afficher l'entête" },
      default: true
    },
    showSocial: {
      type: 'boolean',
      title: 'Show social network links',
      'x-i18n-title': { fr: 'Afficher les liens de réseaux sociaux' },
      description: 'No link is shown until a social network is set in "Contact › Social networks".',
      'x-i18n-description': { fr: "Aucun lien n'est affiché tant qu'aucun réseau social n'est renseigné dans « Contact › Réseaux sociaux »." },
      layout: {
        if: 'parent.data?.show',
        comp: 'switch'
      }
    },
    logoPrimaryType: {
      type: 'string',
      title: 'Main logo',
      'x-i18n-title': { fr: 'Logo principal' },
      default: 'default',
      layout: {
        if: 'parent.data?.show',
        switch: [
          { if: 'parent.data?.show && parent.data?.logoPrimaryType === "local"', cols: { md: 6 } },
          { if: 'parent.data?.show && parent.data?.logoPrimaryType === "default"', cols: { md: 4 } }
        ]
      },
      oneOf: [
        { const: 'default', title: 'Use the main logo', 'x-i18n-title': { fr: 'Utiliser le logo principal' } },
        { const: 'local', title: 'Upload an image', 'x-i18n-title': { fr: 'Charger une image' } },
        { const: 'hidden', title: 'Do not show a logo', 'x-i18n-title': { fr: 'Ne pas afficher de logo' } }
      ]
    },
    logoPrimary: {
      type: 'object',
      title: 'Main logo',
      'x-i18n-title': { fr: 'Logo principal' },
      required: ['_id', 'name', 'mimeType'],
      layout: {
        if: 'parent.data?.logoPrimaryType === "local"',
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
    logoPrimaryMobile: {
      type: 'object',
      title: 'Main logo - mobile alternative',
      'x-i18n-title': { fr: 'Logo principal - Alternative mobile' },
      required: ['_id', 'name', 'mimeType'],
      layout: {
        if: 'parent.data?.show && parent.data?.logoPrimaryType !== "hidden"',
        switch: [
          { if: 'parent.data?.show && parent.data?.logoPrimaryType === "default"', cols: { md: 4 } }
        ],
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
    logoPrimaryLink: {
      type: 'string',
      title: 'Link when clicking the main logo',
      'x-i18n-title': { fr: 'Lien au clic sur le logo principal' },
      description: 'Link the user is redirected to when clicking the logo. By default, they are redirected to the home page.',
      'x-i18n-description': { fr: "Lien vers lequel l'utilisateur sera redirigé en cliquant sur le logo. Par défaut, il sera redirigé vers la page d'accueil." },
      layout: {
        if: 'parent.data?.show && parent.data?.logoPrimaryType !== "hidden"',
        switch: [
          { if: 'parent.data?.show && parent.data?.logoPrimaryType === "default"', cols: { md: 4 } }
        ],
        props: { clearable: true },
        cols: { md: 6 }
      }
    },
    logoPrimaryCentered: {
      type: 'boolean',
      title: 'Center the main logo',
      'x-i18n-title': { fr: 'Centrer le logo principal' },
      description: 'Centers the main logo in the header. The portal title and the secondary logo are then not displayed.',
      'x-i18n-description': { fr: "Centre le logo principal dans l'entête. Le titre du portail et le logo secondaire ne sont alors pas affichés." },
      layout: {
        if: 'parent.data?.show && parent.data?.logoPrimaryType !== "hidden"',
        comp: 'switch',
        cols: { md: 6 }
      },
      default: false
    },
    showTitle: {
      type: 'boolean',
      title: 'Show the portal title',
      'x-i18n-title': { fr: 'Afficher le titre du portail' },
      layout: {
        if: 'parent.data?.show && !(parent.data?.logoPrimaryType !== "hidden" && parent.data?.logoPrimaryCentered)',
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
    },
    logoSecondary: {
      type: 'object',
      title: 'Secondary logo',
      'x-i18n-title': { fr: 'Logo secondaire' },
      required: ['_id', 'name', 'mimeType'],
      layout: {
        if: 'parent.data?.show && !(parent.data?.logoPrimaryType !== "hidden" && parent.data?.logoPrimaryCentered)',
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Secondary logo', 'x-i18n-label': { fr: 'Logo secondaire' } }
          }
        },
        cols: { md: 6 }
      },
      description: 'Logo displayed on the right of the header',
      'x-i18n-description': { fr: "Logo affiché à droite de l'entête" },
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
      title: 'Link when clicking the secondary logo',
      'x-i18n-title': { fr: 'Lien au clic sur le logo secondaire' },
      description: 'Link the user is redirected to when clicking the secondary logo.',
      'x-i18n-description': { fr: "Lien vers lequel sera redirigé l'utilisateur lors du clic sur le logo secondaire." },
      layout: {
        if: 'parent.data?.show && !(parent.data?.logoPrimaryType !== "hidden" && parent.data?.logoPrimaryCentered)',
        props: { clearable: true },
        cols: { md: 6 }
      }
    },
    color: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-background',
      title: 'Header color',
      'x-i18n-title': { fr: "Couleur de l'entête" },
      description: 'Leave empty to use the navigation bar color.',
      'x-i18n-description': { fr: 'Laisser vide pour utiliser la couleur de la barre de navigation.' },
      layout: {
        if: 'parent.data?.show',
        slots: {
          item: { name: 'color-select-item' },
          selection: { name: 'color-select-selection' }
        },
        props: { background: true },
        cols: { md: 6 }
      }
    },
    keepOnScroll: {
      type: 'boolean',
      title: 'Header always visible at the top of the screen',
      'x-i18n-title': { fr: "En-tête toujours visible en haut de l'écran" },
      layout: {
        if: 'parent.data?.show',
        comp: 'switch',
        cols: { md: 6 }
      }
    }
  }
}
