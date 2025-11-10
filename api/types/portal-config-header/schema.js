export default {
  $id: 'https://github.com/data-fair/portals/portal-config-header',
  'x-exports': [],
  title: 'Header',
  type: 'object',
  layout: { title: null },
  properties: {
    show: {
      type: 'boolean',
      layout: { comp: 'switch' },
      title: "Afficher l'entête",
      default: true
    },
    logoPrimaryType: {
      type: 'string',
      title: 'Logo principal',
      default: 'default',
      layout: {
        if: 'parent.data?.show',
        switch: [{
          if: 'parent.data?.logoPrimaryType === "local"',
          cols: { md: 6 }
        }]
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
        props: { clearable: true },
        cols: { md: 6 }
      }
    },
    logoSecondary: {
      type: 'object',
      title: 'Logo secondaire',
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
        if: 'parent.data?.show',
        props: { clearable: true },
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
    color: {
      type: 'string',
      title: "Couleur de l'entête",
      layout: {
        if: 'parent.data?.show',
        cols: { md: 6 }
      },
      default: 'navBar',
      oneOf: [
        { const: 'navBar', title: 'Couleur de la barre de navigation' },
        { const: 'background', title: 'Couleur du fond de page' }
      ]
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
