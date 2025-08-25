export default {
  $id: 'https://github.com/data-fair/portals/portal-config',
  'x-exports': ['types', 'vjsf'],
  title: 'Portal config',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    comp: 'expansion-panels',
    children: [
      { title: 'Métadonnées', children: ['title', 'description', 'authentication'] },
      { title: 'Couleurs', children: ['theme'] },
      {
        title: 'Polices de caractères',
        children: [
          { cols: 6, children: ['bodyFontFamily', 'headingFontFamily'] },
          { cols: 6, name: 'font-families-preview' }
        ]
      },
      { title: 'Images', children: ['logo', 'logoDark', 'favicon'] },
      { title: 'Entête', children: [{ text: 'TODO' }] },
      {
        title: 'Barre de navigation',
        children: [
          'appBar',
          { name: 'app-bar-preview' },
          'appBarHome',
          'menu'
        ]
      },
      { title: 'Pied de page', children: [{ text: 'TODO' }] },
      { title: 'Catalogue de données', children: [{ text: 'TODO' }] },
      { title: 'Catalogue de visualisations', children: [{ text: 'TODO' }] },
      { title: 'Réutilisations', children: [{ text: 'TODO' }] },
      { title: 'Contact', children: [{ text: 'TODO' }] },
      { title: 'Espace personnel', children: [{ text: 'TODO' }] }
    ]
  },
  required: ['title', 'authentication', 'theme', 'appBar', 'appBarHome', 'menu'],
  properties: {
    title: {
      type: 'string',
      title: 'Titre'
    },
    description: {
      type: 'string',
      title: 'Description',
      layout: 'textarea'
    },
    authentication: {
      type: 'string',
      oneOf: [
        {
          const: 'none',
          title: 'Aucune'
        },
        {
          const: 'optional',
          title: 'Optionnelle pour voir les contenus protégés, configurer des notifications, etc'
        },
        {
          const: 'required',
          title: 'Requise pour accéder au portail'
        }
      ],
      title: 'Authentification',
      default: 'optional'
    },
    logo: {
      type: 'object',
      title: 'Logo',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Logo' }
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
    logoDark: {
      type: 'object',
      title: 'Logo - variante pour fond sombre',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Logo - variante pour fond sombre' }
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
    favicon: {
      type: 'object',
      title: 'Favicon',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 512, height: 512, label: 'Favicon' }
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
    theme: { $ref: 'https://github.com/data-fair/lib/theme' },
    bodyFontFamily: {
      type: 'string',
      title: 'Police principale',
      layout: {
        getItems: {
          url: '/portals-manager/api/assets/fonts.json'
        }
      }
    },
    headingFontFamily: {
      type: 'string',
      title: 'Police des titres',
      hint: 'laissez vide pour utiliser la police principale',
      layout: {
        getItems: {
          url: '/portals-manager/api/assets/fonts.json'
        }
      }
    },
    appBar: {
      type: 'object',
      unevaluatedProperties: false,
      required: ['color', 'density'],
      properties: {
        color: { $ref: '#/$defs/appBarColor' },
        density: { $ref: '#/$defs/appBarDensity' }
      }
    },
    appBarHome: {
      type: 'object',
      title: 'Options spécifiques pour la page d\'accueil',
      unevaluatedProperties: false,
      required: ['color', 'density'],
      layout: {
        comp: 'card',
        switch: [
          { if: 'data?.active', children: ['active', 'color', 'density', { name: 'app-bar-preview', props: { home: true } }] },
          ['active']
        ]
      },
      properties: {
        active: {
          type: 'boolean',
          title: 'activer un rendu différent sur la page d\'accueil',
          layout: { props: { color: 'primary' } }
        },
        color: { $ref: '#/$defs/appBarColor' },
        density: { $ref: '#/$defs/appBarDensity' }
      }
    },
    menu: {
      type: 'object',
      unevaluatedProperties: false,
      required: ['children'],
      properties: {
        children: {
          type: 'array',
          title: 'Éléments du menu de navigation',
          items: { $ref: '#/$defs/menuItem' }
        }
      }
    }
  },
  $defs: {
    appBarColor: {
      type: 'string',
      title: 'couleur',
      default: 'primary',
      oneOf: [
        { const: 'primary', title: 'couleur principale' },
        { const: 'secondary', title: 'couleur secondaire' },
        { const: 'accent', title: 'couleur accentuée' },
        { const: 'surface', title: 'couleur des surfaces' }
      ]
    },
    appBarDensity: {
      type: 'string',
      title: 'densité',
      default: 'default',
      oneOf: [
        { const: 'default', title: 'normale' },
        { const: 'prominent', title: 'étendue' },
        { const: 'comfortable', title: 'un peu plus dense' },
        { const: 'compact', title: 'très dense' }
      ]
    },
    menuItem: {
      type: 'object',
      unevaluatedProperties: false,
      default: { type: 'custom' },
      oneOf: [{
        required: ['title'],
        title: 'catalogue de jeux de données',
        properties: {
          type: {
            const: 'datasets',
          },
          title: {
            type: 'string',
            default: 'jeux de données',
            title: 'libellé'
          }
        }
      }, {
        required: ['title'],
        title: 'catalogue de visualisations',
        properties: {
          type: {
            const: 'applications'
          },
          title: {
            type: 'string',
            default: 'visualisations',
            title: 'libellé'
          }
        }
      }, {
        required: ['title'],
        title: 'page de contact',
        properties: {
          type: {
            const: 'contact'
          },
          title: {
            type: 'string',
            default: 'contact',
            title: 'libellé'
          }
        }
      }, {
        title: 'page éditée',
        properties: {
          type: {
            const: 'custom'
          },
          pageRef: {
            type: 'object',
            required: ['_id', 'title'],
            title: 'page',
            layout: {
              getItems: {
                url: '/portals-manager/api/pages?select=_id,title',
                itemsResults: 'data.results.map(r => ({_id: r._id, title: r.title}))',
                itemTitle: 'item.title',
                itemKey: 'item._id'
              }
            },
            properties: {
              _id: {
                type: 'string'
              },
              title: {
                type: 'string'
              }
            }
          },
          title: {
            type: 'string',
            title: 'libellé'
          }
        }
      }, {
        title: 'sous-menu',
        required: ['children'],
        properties: {
          type: {
            const: 'menu'
          },
          title: {
            type: 'string',
            title: 'libellé'
          },
          children: {
            type: 'array',
            title: '',
            items: { $ref: '#/$defs/menuItem' }
          }
        }
      }]
    }
  }
}
