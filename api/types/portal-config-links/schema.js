export default {
  $id: 'https://github.com/data-fair/portals/portal-config-links',
  'x-exports': [],
  $defs: {
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
        icon: { $ref: '#/$defs/icon' },
      }
    },
    eventPage: {
      title: 'Page d\'événements',
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
        icon: { $ref: '#/$defs/icon' },
      }
    },
    newsPage: {
      title: 'Page d\'actualités',
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
        icon: { $ref: '#/$defs/icon' },
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
        },
        icon: { $ref: '#/$defs/icon' },
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
        icon: { $ref: '#/$defs/icon' },
      }
    },
    icon: {
      type: 'object',
      title: 'Configuration de l\'icône',
      layout: 'card',
      properties: {
        mdi: {
          type: 'object',
          title: 'Icône MDI',
          required: ['name', 'svg', 'svgPath'],
          layout: {
            getItems: {
              url: 'https://koumoul.com/data-fair/api/v1/datasets/icons-mdi-latest/lines?q={q}&select=name,svg,svgPath',
              itemKey: 'data.name',
              itemTitle: 'data.name',
              itemIcon: 'data.svg',
              itemsResults: 'data.results'
            },
            cols: { md: 4 }
          },
          properties: {
            name: { type: 'string' },
            svg: { type: 'string' },
            svgPath: { type: 'string' }
          }
        },
        custom: {
          type: 'string',
          title: 'Icône personnalisée',
          description: 'Seul les SVG Path sont supportés.',
          layout: { cols: { md: 4 } }
        },
        color: { $ref: '#/$defs/color' }
      }
    },
    color: {
      type: 'string',
      title: 'Couleur',
      layout: { cols: { md: 4 } },
      oneOf: [
        { const: 'primary', title: 'Primaire' },
        { const: 'secondary', title: 'Secondaire' },
        { const: 'accent', title: 'Accentuée' },
        { const: 'info', title: 'Information' },
        { const: 'success', title: 'Succès' },
        { const: 'error', title: 'Erreur' },
        { const: 'warning', title: 'Avertissement' }
      ]
    }
  }
}
