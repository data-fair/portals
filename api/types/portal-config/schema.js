export default {
  $id: 'https://github.com/data-fair/portals/portal-config',
  'x-exports': ['types', 'vjsf'],
  'x-vjsf': {
    pluginsImports: ['@koumoul/vjsf-markdown'],
    xI18n: true
  },
  'x-vjsf-locales': ['en', 'fr'],
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
      { title: 'Catalogue de données', children: ['datasets'] },
      { title: 'Catalogue de visualisations', children: ['applications'] },
      { title: 'Réutilisations', children: [{ text: 'TODO' }] },
      { title: 'Informations de contact', children: ['contactInformations'] },
      { title: 'Réseaux sociaux', children: ['socialShares', 'socialLinks'] },
      {
        title: 'Espace personnel',
        children: ['personal']
      }
    ]
  },
  required: ['title', 'authentication', 'theme', 'header', 'headerHome', 'menu', 'footer', 'datasets', 'applications', 'contactInformations', 'socialShares', 'socialLinks', 'personal'],
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
          layout: { comp: 'switch' },
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
    datasets: { $ref: 'https://github.com/data-fair/portals/portal-config-datasets' },
    applications: { $ref: 'https://github.com/data-fair/portals/portal-config-applications' },
    contactInformations: { $ref: 'https://github.com/data-fair/portals/portal-config-contact-informations' },
    socialShares: { $ref: 'https://github.com/data-fair/portals/portal-config-social-shares' },
    socialLinks: { $ref: 'https://github.com/data-fair/portals/portal-config-social-links' },
    personal: { $ref: 'https://github.com/data-fair/portals/portal-config-personal' }
  },
  $defs: {
    menuItem: {
      type: 'object',
      unevaluatedProperties: false,
      oneOfLayout: {
        emptyData: true,
      },
      oneOf: [{
        title: 'Page standard',
        required: ['type', 'subtype', 'title'],
        properties: {
          type: {
            const: 'standard'
          },
          subtype: {
            type: 'string',
            title: 'Type de page',
            default: 'home',
            oneOf: [{ const: 'home', title: 'Accueil' },
              { const: 'contact', title: 'Contact' },
              { const: 'privacy-policy', title: 'Politique de confidentialité' },
              { const: 'datasets', title: 'Catalogue de données' },
              { const: 'applications', title: 'Catalogue de visualisation' },
              { const: 'event', title: 'Liste des événements' },
              { const: 'news', title: 'Liste des actualités' },
              { const: 'sitemap', title: 'Plan du site' }
            ],
            layout: { cols: { md: 6 } }
          },
          title: {
            type: 'string',
            title: 'Libellé',
            layout: { cols: { md: 6 } }
          }
        }
      }, {
        title: 'Page d\'événements',
        required: ['type', 'title', 'pageRef'],
        properties: {
          type: { const: 'event' },
          pageRef: {
            type: 'object',
            required: ['slug', 'title'],
            title: 'Page',
            layout: {
              getItems: 'options.context.pages.event',
              cols: { md: 6 }
            },
            properties: {
              slug: { type: 'string' },
              title: { type: 'string' }
            }
          },
          title: {
            type: 'string',
            title: 'Libellé',
            default: 'Événements',
            layout: { cols: { md: 6 } }
          }
        }
      }, {
        title: 'Page d\'actualités',
        required: ['type', 'title', 'pageRef'],
        properties: {
          type: { const: 'news' },
          pageRef: {
            type: 'object',
            required: ['slug', 'title'],
            title: 'Page',
            layout: {
              getItems: 'options.context.pages.news',
              cols: { md: 6 }
            },
            properties: {
              slug: { type: 'string' },
              title: { type: 'string' }
            }
          },
          title: {
            type: 'string',
            title: 'Libellé',
            default: 'Actualités',
            layout: { cols: { md: 6 } }
          }
        }
      }, {
        title: 'Autre page',
        required: ['type', 'title', 'pageRef'],
        properties: {
          type: { const: 'generic' },
          pageRef: {
            type: 'object',
            required: ['slug', 'title'],
            title: 'Page',
            layout: {
              getItems: 'options.context.pages.generic',
              cols: { md: 6 }
            },
            properties: {
              slug: { type: 'string' },
              title: { type: 'string' },
              group: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  title: { type: 'string' },
                  slug: { type: 'string' }
                }
              }
            }
          },
          title: {
            type: 'string',
            title: 'Libellé',
            layout: { cols: { md: 6 } }
          }
        }
      }, {
        title: 'Sous-menu',
        required: ['type', 'title', 'children'],
        properties: {
          type: { const: 'submenu' },
          title: {
            type: 'string',
            title: 'Libellé'
          },
          children: {
            type: 'array',
            title: '',
            layout: { listEditMode: 'inline' },
            items: { $ref: '#/$defs/menuItem' }
          }
        }
      }, {
        title: 'Lien externe',
        required: ['type', 'title', 'href'],
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
