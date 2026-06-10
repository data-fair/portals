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
        title: 'Contenu',
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
      title: "Afficher l'entête",
      default: true
    },
    showSocial: {
      type: 'boolean',
      title: 'Afficher les liens de réseaux sociaux',
      description: "Aucun lien n'est affiché tant qu'aucun réseau social n'est renseigné dans « Paramètres généraux › Réseaux sociaux ».",
      layout: {
        if: 'parent.data?.show',
        comp: 'switch'
      }
    },
    logoPrimaryType: {
      type: 'string',
      title: 'Logo principal',
      default: 'default',
      layout: {
        if: 'parent.data?.show',
        switch: [
          { if: 'parent.data?.show && parent.data?.logoPrimaryType === "local"', cols: { md: 6 } },
          { if: 'parent.data?.show && parent.data?.logoPrimaryType === "default"', cols: { md: 4 } }
        ]
      },
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
        if: 'parent.data?.show && parent.data?.logoPrimaryType !== "hidden"',
        switch: [
          { if: 'parent.data?.show && parent.data?.logoPrimaryType === "default"', cols: { md: 4 } }
        ],
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
    logoPrimaryLink: {
      type: 'string',
      title: 'Lien au clic sur le logo principal',
      description: "Lien vers lequel l'utilisateur sera redirigé en cliquant sur le logo. Par défaut, il sera redirigé vers la page d'accueil.",
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
      title: 'Centrer le logo principal',
      description: "Centre le logo principal dans l'entête. Le titre du portail et le logo secondaire ne sont alors pas affichés.",
      layout: {
        if: 'parent.data?.show && parent.data?.logoPrimaryType !== "hidden"',
        comp: 'switch',
        cols: { md: 6 }
      },
      default: false
    },
    showTitle: {
      type: 'boolean',
      title: 'Afficher le titre du portail',
      layout: {
        if: 'parent.data?.show && !(parent.data?.logoPrimaryType !== "hidden" && parent.data?.logoPrimaryCentered)',
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
    },
    logoSecondary: {
      type: 'object',
      title: 'Logo secondaire',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        if: 'parent.data?.show && !(parent.data?.logoPrimaryType !== "hidden" && parent.data?.logoPrimaryCentered)',
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Logo secondaire' }
          }
        },
        cols: { md: 6 }
      },
      description: "Logo affiché à droite de l'entête",
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
      description: "Lien vers lequel sera redirigé l'utilisateur lors du clic sur le logo secondaire.",
      layout: {
        if: 'parent.data?.show && !(parent.data?.logoPrimaryType !== "hidden" && parent.data?.logoPrimaryCentered)',
        props: { clearable: true },
        cols: { md: 6 }
      }
    },
    color: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-background',
      title: "Couleur de l'entête",
      description: 'Laisser vide pour utiliser la couleur de la barre de navigation.',
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
      title: "Garder l'entête affiché au scroll",
      layout: {
        if: 'parent.data?.show',
        comp: 'switch',
        cols: { md: 6 }
      }
    }
  }
}
