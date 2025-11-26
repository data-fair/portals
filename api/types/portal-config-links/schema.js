export default {
  $id: 'https://github.com/data-fair/portals/portal-config-links',
  'x-exports': [],
  $defs: {
    linkConfig: {
      type: 'object',
      properties: {
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color' },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          default: 1, // TODO: check if default can be overwrite the $ref
          layout: { cols: { md: 4 } }
        },
        density: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density',
          layout: { cols: { md: 4 } }
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
          layout: { cols: { md: 4 } }
        },
        variant: {
          type: 'string',
          title: 'Variante',
          layout: { cols: { md: 4 } },
          default: 'default',
          oneOf: [
            { const: 'default', title: 'Par défaut' },
            { const: 'outlined', title: 'Avec bordure' },
            { const: 'tonal', title: 'Tonale' }
          ]
        },
        showIcon: {
          type: 'boolean',
          title: "Afficher l'icône",
          layout: {
            comp: 'switch',
            cols: { md: 4 }
          },
          default: true
        },
        uppercase: {
          type: 'boolean',
          title: 'Texte en majuscules',
          layout: {
            comp: 'switch',
            cols: { md: 4 }
          },
          default: true
        }
      }
    },

    // Link item present in footer or button element
    linkItem: {
      type: 'object',
      unevaluatedProperties: false,
      oneOfLayout: { label: 'Type de page' },
      discriminator: { propertyName: 'type' },
      // layout: { switch: [{ if: 'summary', slots: { component: 'link-item-summary' } }] },
      layout: { switch: [{ if: 'summary', children: [] }] },
      oneOf: [
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/standardPage' },
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/eventPage' },
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/newsPage' },
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/genericPage' },
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/externalLink' }
      ]
    },

    // Definitions of link item types
    standardPage: {
      title: 'Page standard',
      required: ['type', 'subtype'],
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
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
      }
    },
    eventPage: {
      title: "Page d'événements",
      required: ['type', 'pageRef'],
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
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
      }
    },
    newsPage: {
      title: "Page d'actualités",
      required: ['type', 'pageRef'],
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
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
      }
    },
    genericPage: {
      title: 'Autre page',
      required: ['type', 'pageRef'],
      properties: {
        type: { const: 'generic' },
        pageRef: {
          type: 'object',
          required: ['slug', 'title'],
          title: 'Page',
          layout: {
            getItems: {
              expr: 'options.context.pages.generic',
              // eslint-disable-next-line no-template-curly-in-string
              itemTitle: 'item.header ? item.title : `${item.titleBackOffice} (${item.slug})`'
            },
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
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
      }
    },
    externalLink: {
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
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
      }
    }
  }
}
