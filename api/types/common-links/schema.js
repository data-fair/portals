export default {
  $id: 'https://github.com/data-fair/portals/common-links',
  'x-exports': ['types'],
  $defs: {
    linkItem: {
      type: 'object',
      oneOfLayout: { label: 'Type de page', emptyData: true }, // "Empty data" clears fields when changing type to avoid error: "must NOT have unevaluated properties"
      discriminator: { propertyName: 'type' },
      // layout: { switch: [{ if: 'summary', slots: { component: 'link-item-summary' } }] },
      layout: { switch: [{ if: 'summary', children: [] }] },
      oneOf: [
        { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/standardPage' },
        { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/genericPage' },
        { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/eventPage' },
        { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/newsPage' },
        { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/externalLink' }
      ]
    },

    // Definitions of link item types
    standardPage: {
      title: 'Page standard (Accueil, Contact,...)',
      required: ['type', 'subtype'],
      properties: {
        type: { const: 'standard' },
        subtype: {
          type: 'string',
          title: 'Type de page',
          default: 'home',
          oneOf: [
            // Editable pages
            { const: 'home', title: 'Accueil' },
            { const: 'contact', title: 'Contact' },
            { const: 'accessibility', title: 'Accessibilité' },
            { const: 'terms-of-service', title: "Conditions générales d'utilisation" },
            { const: 'legal-notice', title: 'Mentions légales' },
            { const: 'privacy-policy', title: 'Politique de confidentialité' },
            { const: 'cookie-policy', title: 'Politique de cookies' },
            { const: 'datasets', title: 'Catalogue de données' },
            { const: 'applications', title: 'Catalogue de visualisations' },
            { const: 'reuses', title: 'Catalogue de réutilisations' },
            { const: 'event-catalog', title: "Catalogue d'événements" },
            { const: 'news-catalog', title: "Catalogue d'actualités" },

            // Fixed pages
            { const: 'sitemap', title: 'Plan du site' },
            { const: 'catalog-api-doc', title: "Documentation d'API" }
          ],
          layout: { cols: { md: 6 } }
        },
        title: {
          type: 'string',
          title: 'Libellé',
          layout: { cols: { md: 6 } }
        },
        target: {
          type: 'boolean',
          title: 'Ouvrir dans un nouvel onglet'
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' }
      }
    },
    genericPage: {
      title: 'Page libre',
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
            comp: 'autocomplete',
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
        target: {
          type: 'boolean',
          title: 'Ouvrir dans un nouvel onglet'
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' }
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
          layout: { cols: { md: 6 } }
        },
        target: {
          type: 'boolean',
          title: 'Ouvrir dans un nouvel onglet'
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' }
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
          layout: { cols: { md: 6 } }
        },
        target: {
          type: 'boolean',
          title: 'Ouvrir dans un nouvel onglet'
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' }
      }
    },
    externalLink: {
      title: 'Lien',
      required: ['type', 'title', 'href'],
      properties: {
        type: { const: 'external' },
        href: {
          title: 'URL',
          type: 'string',
          description: 'Si le lien est interne, privilégiez une URL commençant par /',
        },
        title: {
          type: 'string',
          title: 'Libellé',
          layout: { cols: { md: 6 } }
        },
        target: {
          type: 'boolean',
          title: 'Ouvrir dans un nouvel onglet',
          default: true
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' }
      }
    },

    // Link item type used for links without title and icon  (used for title, image and card pages elements)
    simpleLinkItem: {
      type: 'object',
      oneOfLayout: { label: 'Type de page', emptyData: true }, // "Empty data" clears fields when changing type to avoid error: "must NOT have unevaluated properties"
      discriminator: { propertyName: 'type' },
      // layout: { switch: [{ if: 'summary', slots: { component: 'link-item-summary' } }] },
      layout: { switch: [{ if: 'summary', children: [] }] },
      oneOf: [
        { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/baseStandardPage' },
        { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/baseGenericPage' },
        { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/baseEventPage' },
        { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/baseNewsPage' },
        { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/baseExternalLink' },
        {
          title: 'Aucun lien',
          required: ['type'],
          properties: { type: { const: 'none' } }
        }
      ]
    },

    // Definitions of link item types without title and icon (used for title, image and card pages elements)
    baseStandardPage: {
      title: 'Page standard (Accueil, Contact,...)',
      required: ['type'],
      properties: {
        type: { const: 'standard' },
        subtype: {
          type: 'string',
          title: 'Type de page',
          default: 'home',
          oneOf: [
            // Editable pages
            { const: 'home', title: 'Accueil' },
            { const: 'contact', title: 'Contact' },
            { const: 'accessibility', title: 'Accessibilité' },
            { const: 'terms-of-service', title: "Conditions générales d'utilisation" },
            { const: 'legal-notice', title: 'Mentions légales' },
            { const: 'privacy-policy', title: 'Politique de confidentialité' },
            { const: 'cookie-policy', title: 'Politique de cookies' },
            { const: 'datasets', title: 'Catalogue de données' },
            { const: 'applications', title: 'Catalogue de visualisations' },
            { const: 'reuses', title: 'Catalogue de réutilisations' },
            { const: 'event-catalog', title: "Catalogue d'événements" },
            { const: 'news-catalog', title: "Catalogue d'actualités" },

            // Fixed pages
            { const: 'sitemap', title: 'Plan du site' },
            { const: 'catalog-api-doc', title: "Documentation d'API" }
          ],
          layout: { cols: { md: 6 } }
        },
        title: {
          type: 'string',
          title: 'Texte alternatif',
          description: "Texte utilisé pour l'accessibilité par les lecteurs d'écran"
        },
        target: {
          type: 'boolean',
          title: 'Ouvrir dans un nouvel onglet'
        }
      }
    },
    baseGenericPage: {
      title: 'Page libre',
      required: ['type'],
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
            comp: 'autocomplete',
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
          title: 'Texte alternatif',
          description: "Texte utilisé pour l'accessibilité par les lecteurs d'écran"
        },
        target: {
          type: 'boolean',
          title: 'Ouvrir dans un nouvel onglet'
        }
      }
    },
    baseEventPage: {
      title: "Page d'événements",
      required: ['type'],
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
          title: 'Texte alternatif',
          description: "Texte utilisé pour l'accessibilité par les lecteurs d'écran"
        },
        target: {
          type: 'boolean',
          title: 'Ouvrir dans un nouvel onglet'
        }
      }
    },
    baseNewsPage: {
      title: "Page d'actualités",
      required: ['type'],
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
          title: 'Texte alternatif',
          description: "Texte utilisé pour l'accessibilité par les lecteurs d'écran"
        },
        target: {
          type: 'boolean',
          title: 'Ouvrir dans un nouvel onglet'
        }
      }
    },
    baseExternalLink: {
      title: 'Lien',
      required: ['type'],
      properties: {
        type: { const: 'external' },
        href: {
          title: 'URL',
          type: 'string',
          description: 'Si le lien est interne, privilégiez une URL commençant par /',
        },
        title: {
          type: 'string',
          title: 'Texte alternatif',
          description: "Texte utilisé pour l'accessibilité par les lecteurs d'écran"
        },
        target: {
          type: 'boolean',
          title: 'Ouvrir dans un nouvel onglet',
          default: true
        }
      }
    }
  }
}

// @ts-expect-error
const linkItemTitleFn = (item) => {
  const standardPageTitles = {
    home: 'Page d\'accueil',
    contact: 'Contact',
    accessibility: 'Accessibilité',
    'terms-of-service': "Conditions générales d'utilisation",
    'legal-notice': 'Mentions légales',
    'privacy-policy': 'Politique de confidentialité',
    'cookie-policy': 'Politique de cookies',
    datasets: 'Catalogue de données',
    applications: 'Catalogue de visualisations',
    reuses: 'Catalogue de réutilisations',
    'event-catalog': "Catalogue d'événements",
    'news-catalog': "Catalogue d'actualités",
    sitemap: 'Plan du site',
    'catalog-api-doc': "Documentation d'API"
  }

  // @ts-expect-error
  const formatPageRef = (pageRef) => pageRef?.title ? ` - ${pageRef.title} (${pageRef.slug})` : ''
  // @ts-expect-error
  const formatLabel = (title) => title ? ` - Libellé : ${title}` : ''

  if (item.type === 'standard') {
    // @ts-expect-error
    const pageTitle = standardPageTitles[item.subtype] || 'Page standard'
    return pageTitle + formatLabel(item.title)
  }
  if (item.type === 'event') {
    return 'Événement' + formatPageRef(item.pageRef) + formatLabel(item.title)
  }
  if (item.type === 'news') {
    return 'Actualité' + formatPageRef(item.pageRef) + formatLabel(item.title)
  }
  if (item.type === 'generic') {
    return 'Page éditée' + formatPageRef(item.pageRef) + formatLabel(item.title)
  }
  if (item.type === 'external') {
    const targetInfo = item.target ? ' - S\'ouvre dans un nouvel onglet' : ''
    return `Lien - Libellé : ${item.title} - URL : ${item.href}${targetInfo}`
  }
  if (item.type === 'submenu') {
    return `Sous-menu - Libellé : ${item.title}`
  }
  return 'Lien non configuré'
}

export const linkItemTitle = {
  expr: linkItemTitleFn.toString().replace(/^[^{]+{|}$/g, '').trim(),
  type: 'js-fn'
}
