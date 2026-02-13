export default {
  $id: 'https://github.com/data-fair/portals/portal-config-links',
  'x-exports': [],
  $defs: {
    // Link item present in footer or button element
    linkItem: {
      type: 'object',
      unevaluatedProperties: false,
      oneOfLayout: { label: 'Type de page', emptyData: true }, // "Empty data" clears fields when changing type to avoid error: "must NOT have unevaluated properties"
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
            { const: 'accessibility', title: 'Accessibilité' },
            { const: 'legal-notice', title: 'Mentions légales' },
            { const: 'cookie-policy', title: 'Politique de cookies' },
            { const: 'terms-of-service', title: 'Conditions générales d\'utilisation' },
            { const: 'datasets', title: 'Catalogue de données' },
            { const: 'applications', title: 'Catalogue de visualisations' },
            { const: 'reuses', title: 'Liste des réutilisations' },
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
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
      }
    },
    externalLink: {
      title: 'Lien',
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
        target: {
          type: 'boolean',
          title: 'Ouvrir dans un nouvel onglet',
          default: true
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
      }
    }
  }
}

// @ts-expect-error
const linkItemTitleFn = (item) => {
  const standardPageTitles = {
    home: 'Page d\'accueil',
    contact: 'Contact',
    'privacy-policy': 'Politique de confidentialité',
    accessibility: 'Accessibilité',
    'legal-notice': 'Mentions légales',
    'cookie-policy': 'Politique de cookies',
    'terms-of-service': 'Conditions générales d\'utilisation',
    datasets: 'Catalogue de données',
    applications: 'Catalogue de visualisations',
    reuses: 'Liste des réutilisations',
    event: 'Liste des événements',
    news: 'Liste des actualités',
    sitemap: 'Plan du site'
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
