export default {
  $id: 'https://github.com/data-fair/portals/portal-config',
  'x-exports': ['types', 'vjsf'],
  'x-vjsf': {
    pluginsImports: ['@koumoul/vjsf-markdown'],
  },
  'x-jstt': { additionalProperties: false },
  title: 'Portal Config',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    title: null,
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
      {
        title: 'Entête & Barre de navigation',
        children: [
          'header',
          { name: 'app-bar-preview' },
          'headerHome',
          'menu'
        ]
      },
      { title: 'Pied de page', children: ['footer', { name: 'footer-preview' }] },
      { title: 'Catalogue de données', children: [{ text: 'TODO' }] },
      { title: 'Catalogue de visualisations', children: [{ text: 'TODO' }] },
      { title: 'Réutilisations', children: [{ text: 'TODO' }] },
      { title: 'Informations de contact', children: ['contactInformations'] },
      { title: 'Réseaux sociaux', children: ['socialLinks'] },
      {
        title: 'Espace personnel',
        children: ['personal']
      }
    ]
  },
  required: ['title', 'authentication', 'theme', 'header', 'headerHome', 'menu', 'footer', 'contactInformations', 'socialLinks', 'personal'],
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
    header: { $ref: 'https://github.com/data-fair/portals/portal-config-header' },
    headerHome: {
      type: 'object',
      title: 'Options spécifiques pour la page d\'accueil',
      unevaluatedProperties: false,
      layout: {
        comp: 'card',
        switch: [
          {
            if: 'data?.active',
            children: [
              'active',
              'header',
              { name: 'app-bar-preview', props: { home: true } }
            ]
          },
          ['active']
        ]
      },
      required: ['active'],
      properties: {
        active: {
          type: 'boolean',
          title: 'Utiliser un rendu différent sur la page d\'accueil',
          layout: { props: { color: 'primary' }, comp: 'switch' },
          default: false
        },
        header: { $ref: 'https://github.com/data-fair/portals/portal-config-header' }
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
    },
    footer: { $ref: 'https://github.com/data-fair/portals/portal-config-footer' },
    contactInformations: { $ref: 'https://github.com/data-fair/portals/portal-config-contact-informations' },
    socialLinks: { $ref: 'https://github.com/data-fair/portals/portal-config-social-links' },
    personal: { $ref: 'https://github.com/data-fair/portals/portal-config-personal' }
  },
  $defs: {
    menuItem: {
      type: 'object',
      unevaluatedProperties: false,
      default: { type: 'custom' },
      oneOf: [{
        required: ['title'],
        title: 'Page d\'accueil',
        properties: {
          type: { const: 'home' },
          title: {
            type: 'string',
            title: 'Libellé',
            default: 'Accueil'
          }
        }
      }, {
        required: ['title'],
        title: 'Catalogue des jeux de données',
        properties: {
          type: { const: 'datasets' },
          title: {
            type: 'string',
            title: 'Libellé',
            default: 'Jeux de données'
          }
        }
      }, {
        required: ['title'],
        title: 'Catalogue des visualisations',
        properties: {
          type: { const: 'applications' },
          title: {
            type: 'string',
            title: 'Libellé',
            default: 'Visualisations'
          }
        }
      }, {
        required: ['title'],
        title: 'Page de contact',
        properties: {
          type: { const: 'contact' },
          title: {
            type: 'string',
            title: 'Libellé',
            default: 'Contact'
          }
        }
      }, {
        required: ['title'],
        title: 'Page éditée',
        properties: {
          type: { const: 'custom' },
          pageRef: {
            type: 'object',
            required: ['_id', 'title'],
            title: 'Page',
            layout: {
              getItems: {
                url: '/portals-manager/api/pages?select=_id,title',
                itemsResults: 'data.results.map(r => ({_id: r._id, title: r.title}))',
                itemTitle: 'item.title',
                itemKey: 'item._id'
              }
            },
            properties: {
              _id: { type: 'string' },
              title: { type: 'string' }
            }
          },
          title: {
            type: 'string',
            title: 'Libellé'
          }
        }
      }, {
        title: 'Sous-menu',
        required: ['children'],
        properties: {
          type: { const: 'submenu' },
          title: {
            type: 'string',
            title: 'Libellé'
          },
          children: {
            type: 'array',
            title: '',
            items: { $ref: '#/$defs/menuItem' }
          }
        }
      }, {
        title: 'Lien externe',
        required: ['title', 'href'],
        properties: {
          type: { const: 'external' },
          title: {
            type: 'string',
            title: 'Libellé'
          },
          href: {
            title: 'URL',
            type: 'string'
          }
        }
      }]
    }
  }
}
