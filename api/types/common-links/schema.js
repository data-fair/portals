// Definitions of link item types
export const standardPage = {
  title: 'Standard page (Home, Contact,...)',
  'x-i18n-title': { fr: 'Page standard (Accueil, Contact,...)' },
  required: ['type', 'subtype'],
  properties: {
    type: { const: 'standard' },
    subtype: {
      type: 'string',
      title: 'Page type',
      'x-i18n-title': { fr: 'Type de page' },
      oneOf: [
        // Editable pages
        { const: 'home', title: 'Home', 'x-i18n-title': { fr: 'Accueil' } },
        { const: 'contact', title: 'Contact' },
        { const: 'accessibility', title: 'Accessibility', 'x-i18n-title': { fr: 'Accessibilité' } },
        { const: 'terms-of-service', title: 'Terms of service', 'x-i18n-title': { fr: "Conditions générales d'utilisation" } },
        { const: 'legal-notice', title: 'Legal notice', 'x-i18n-title': { fr: 'Mentions légales' } },
        { const: 'privacy-policy', title: 'Privacy policy', 'x-i18n-title': { fr: 'Politique de confidentialité' } },
        { const: 'cookie-policy', title: 'Cookie policy', 'x-i18n-title': { fr: 'Politique de cookies' } },
        { const: 'datasets', title: 'Data catalog', 'x-i18n-title': { fr: 'Catalogue de données' } },
        { const: 'applications', title: 'Application catalog', 'x-i18n-title': { fr: 'Catalogue de visualisations' } },
        { const: 'reuses', title: 'Reuse catalog', 'x-i18n-title': { fr: 'Catalogue de réutilisations' } },
        { const: 'event-catalog', title: 'Event catalog', 'x-i18n-title': { fr: "Catalogue d'événements" } },
        { const: 'news-catalog', title: 'News catalog', 'x-i18n-title': { fr: "Catalogue d'actualités" } },

        // Fixed pages
        { const: 'sitemap', title: 'Sitemap', 'x-i18n-title': { fr: 'Plan du site' } },
        { const: 'catalog-api-doc', title: 'API documentation', 'x-i18n-title': { fr: "Documentation d'API" } }
      ],
      layout: { cols: { md: 6 } }
    },
    title: {
      type: 'string',
      title: 'Label',
      'x-i18n-title': { fr: 'Libellé' },
      layout: { cols: { md: 6 } }
    },
    target: {
      type: 'boolean',
      title: 'Open in a new tab',
      'x-i18n-title': { fr: 'Ouvrir dans un nouvel onglet' }
    },
    icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' }
  }
}
export const genericPage = {
  title: 'Free page',
  'x-i18n-title': { fr: 'Page libre' },
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
      title: 'Label',
      'x-i18n-title': { fr: 'Libellé' },
      layout: { cols: { md: 6 } }
    },
    target: {
      type: 'boolean',
      title: 'Open in a new tab',
      'x-i18n-title': { fr: 'Ouvrir dans un nouvel onglet' }
    },
    icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' }
  }
}
export const eventPage = {
  title: 'Event page',
  'x-i18n-title': { fr: "Page d'événement" },
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
      title: 'Label',
      'x-i18n-title': { fr: 'Libellé' },
      layout: { cols: { md: 6 } }
    },
    target: {
      type: 'boolean',
      title: 'Open in a new tab',
      'x-i18n-title': { fr: 'Ouvrir dans un nouvel onglet' }
    },
    icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' }
  }
}
export const newsPage = {
  title: 'News page',
  'x-i18n-title': { fr: "Page d'actualité" },
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
      title: 'Label',
      'x-i18n-title': { fr: 'Libellé' },
      layout: { cols: { md: 6 } }
    },
    target: {
      type: 'boolean',
      title: 'Open in a new tab',
      'x-i18n-title': { fr: 'Ouvrir dans un nouvel onglet' }
    },
    icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' }
  }
}
export const externalLink = {
  title: 'Link',
  'x-i18n-title': { fr: 'Lien' },
  required: ['type', 'title', 'href'],
  properties: {
    type: { const: 'external' },
    href: {
      title: 'URL',
      type: 'string',
      description: 'If the link is internal, prefer a URL starting with /',
      'x-i18n-description': { fr: 'Si le lien est interne, privilégiez une URL commençant par /' },
    },
    title: {
      type: 'string',
      title: 'Label',
      'x-i18n-title': { fr: 'Libellé' },
      layout: { cols: { md: 6 } }
    },
    target: {
      type: 'boolean',
      title: 'Open in a new tab',
      'x-i18n-title': { fr: 'Ouvrir dans un nouvel onglet' },
      default: true
    },
    icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' }
  }
}

// Definitions of link item types without title and icon (used for title, image and card pages elements)
const baseStandardPage = {
  title: 'Standard page (Home, Contact,...)',
  'x-i18n-title': { fr: 'Page standard (Accueil, Contact,...)' },
  required: ['type'],
  properties: {
    type: { const: 'standard' },
    subtype: {
      type: 'string',
      title: 'Page type',
      'x-i18n-title': { fr: 'Type de page' },
      oneOf: [
        // Editable pages
        { const: 'home', title: 'Home', 'x-i18n-title': { fr: 'Accueil' } },
        { const: 'contact', title: 'Contact' },
        { const: 'accessibility', title: 'Accessibility', 'x-i18n-title': { fr: 'Accessibilité' } },
        { const: 'terms-of-service', title: 'Terms of service', 'x-i18n-title': { fr: "Conditions générales d'utilisation" } },
        { const: 'legal-notice', title: 'Legal notice', 'x-i18n-title': { fr: 'Mentions légales' } },
        { const: 'privacy-policy', title: 'Privacy policy', 'x-i18n-title': { fr: 'Politique de confidentialité' } },
        { const: 'cookie-policy', title: 'Cookie policy', 'x-i18n-title': { fr: 'Politique de cookies' } },
        { const: 'datasets', title: 'Data catalog', 'x-i18n-title': { fr: 'Catalogue de données' } },
        { const: 'applications', title: 'Application catalog', 'x-i18n-title': { fr: 'Catalogue de visualisations' } },
        { const: 'reuses', title: 'Reuse catalog', 'x-i18n-title': { fr: 'Catalogue de réutilisations' } },
        { const: 'event-catalog', title: 'Event catalog', 'x-i18n-title': { fr: "Catalogue d'événements" } },
        { const: 'news-catalog', title: 'News catalog', 'x-i18n-title': { fr: "Catalogue d'actualités" } },

        // Fixed pages
        { const: 'sitemap', title: 'Sitemap', 'x-i18n-title': { fr: 'Plan du site' } },
        { const: 'catalog-api-doc', title: 'API documentation', 'x-i18n-title': { fr: "Documentation d'API" } }
      ],
      layout: { cols: { md: 6 } }
    },
    title: {
      type: 'string',
      title: 'Alternative text',
      'x-i18n-title': { fr: 'Texte alternatif' },
      description: 'Text used for accessibility by screen readers',
      'x-i18n-description': { fr: "Texte utilisé pour l'accessibilité par les lecteurs d'écran" }
    },
    target: {
      type: 'boolean',
      title: 'Open in a new tab',
      'x-i18n-title': { fr: 'Ouvrir dans un nouvel onglet' }
    }
  }
}
const baseGenericPage = {
  title: 'Free page',
  'x-i18n-title': { fr: 'Page libre' },
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
      title: 'Alternative text',
      'x-i18n-title': { fr: 'Texte alternatif' },
      description: 'Text used for accessibility by screen readers',
      'x-i18n-description': { fr: "Texte utilisé pour l'accessibilité par les lecteurs d'écran" }
    },
    target: {
      type: 'boolean',
      title: 'Open in a new tab',
      'x-i18n-title': { fr: 'Ouvrir dans un nouvel onglet' }
    }
  }
}
const baseEventPage = {
  title: 'Event page',
  'x-i18n-title': { fr: "Page d'événement" },
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
      title: 'Alternative text',
      'x-i18n-title': { fr: 'Texte alternatif' },
      description: 'Text used for accessibility by screen readers',
      'x-i18n-description': { fr: "Texte utilisé pour l'accessibilité par les lecteurs d'écran" }
    },
    target: {
      type: 'boolean',
      title: 'Open in a new tab',
      'x-i18n-title': { fr: 'Ouvrir dans un nouvel onglet' }
    }
  }
}
const baseNewsPage = {
  title: 'News page',
  'x-i18n-title': { fr: "Page d'actualité" },
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
      title: 'Alternative text',
      'x-i18n-title': { fr: 'Texte alternatif' },
      description: 'Text used for accessibility by screen readers',
      'x-i18n-description': { fr: "Texte utilisé pour l'accessibilité par les lecteurs d'écran" }
    },
    target: {
      type: 'boolean',
      title: 'Open in a new tab',
      'x-i18n-title': { fr: 'Ouvrir dans un nouvel onglet' }
    }
  }
}
const baseExternalLink = {
  title: 'Link',
  'x-i18n-title': { fr: 'Lien' },
  required: ['type'],
  properties: {
    type: { const: 'external' },
    href: {
      title: 'URL',
      type: 'string',
      description: 'If the link is internal, prefer a URL starting with /',
      'x-i18n-description': { fr: 'Si le lien est interne, privilégiez une URL commençant par /' },
    },
    title: {
      type: 'string',
      title: 'Alternative text',
      'x-i18n-title': { fr: 'Texte alternatif' },
      description: 'Text used for accessibility by screen readers',
      'x-i18n-description': { fr: "Texte utilisé pour l'accessibilité par les lecteurs d'écran" }
    },
    target: {
      type: 'boolean',
      title: 'Open in a new tab',
      'x-i18n-title': { fr: 'Ouvrir dans un nouvel onglet' },
      default: true
    }
  }
}

export default {
  $id: 'https://github.com/data-fair/portals/common-links',
  'x-exports': ['types'],
  $defs: {
    linkItem: {
      type: 'object',
      oneOfLayout: { label: 'Page type', 'x-i18n-label': { fr: 'Type de page' }, emptyData: true }, // "Empty data" clears fields when changing type to avoid error: "must NOT have unevaluated properties"
      discriminator: { propertyName: 'type' },
      // layout: { switch: [{ if: 'summary', slots: { component: 'link-item-summary' } }] },
      layout: { switch: [{ if: 'summary', children: [] }] },
      oneOf: [
        structuredClone(standardPage),
        structuredClone(genericPage),
        structuredClone(eventPage),
        structuredClone(newsPage),
        structuredClone(externalLink)
      ]
    },

    // Link item type used for links without title and icon  (used for title, image and card pages elements)
    simpleLinkItem: {
      type: 'object',
      oneOfLayout: { label: 'Page type', 'x-i18n-label': { fr: 'Type de page' }, emptyData: true }, // "Empty data" clears fields when changing type to avoid error: "must NOT have unevaluated properties"
      discriminator: { propertyName: 'type' },
      // layout: { switch: [{ if: 'summary', slots: { component: 'link-item-summary' } }] },
      layout: { switch: [{ if: 'summary', children: [] }] },
      oneOf: [
        baseStandardPage,
        baseGenericPage,
        baseEventPage,
        baseNewsPage,
        baseExternalLink,
        {
          title: 'No link',
          'x-i18n-title': { fr: 'Aucun lien' },
          required: ['type'],
          properties: { type: { const: 'none' } }
        }
      ]
    }
  }
}

// @ts-expect-error
const linkItemTitleFn = (item) => {
  const standardPageTitles = {
    home: 'Home page',
    contact: 'Contact',
    accessibility: 'Accessibility',
    'terms-of-service': 'Terms of service',
    'legal-notice': 'Legal notice',
    'privacy-policy': 'Privacy policy',
    'cookie-policy': 'Cookie policy',
    datasets: 'Data catalog',
    applications: 'Application catalog',
    reuses: 'Reuse catalog',
    'event-catalog': 'Event catalog',
    'news-catalog': 'News catalog',
    sitemap: 'Sitemap',
    'catalog-api-doc': 'API documentation'
  }

  // @ts-expect-error
  const formatPageRef = (pageRef) => pageRef?.title ? ` - ${pageRef.title} (${pageRef.slug})` : ''
  // @ts-expect-error
  const formatLabel = (title) => title ? ` - Label: ${title}` : ''

  if (item.type === 'standard') {
    // @ts-expect-error
    const pageTitle = standardPageTitles[item.subtype] || 'Standard page'
    return pageTitle + formatLabel(item.title)
  }
  if (item.type === 'event') {
    return 'Event' + formatPageRef(item.pageRef) + formatLabel(item.title)
  }
  if (item.type === 'news') {
    return 'News' + formatPageRef(item.pageRef) + formatLabel(item.title)
  }
  if (item.type === 'generic') {
    return 'Edited page' + formatPageRef(item.pageRef) + formatLabel(item.title)
  }
  if (item.type === 'external') {
    const targetInfo = item.target ? ' - Opens in a new tab' : ''
    return `Link - Label: ${item.title} - URL: ${item.href}${targetInfo}`
  }
  if (item.type === 'submenu') {
    return `Submenu - Label: ${item.title}`
  }
  return 'Link not configured'
}

// @ts-expect-error
const linkItemTitleFrFn = (item) => {
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

/** @param {Function} fn */
export const jsFn = (fn) => ({ expr: fn.toString().replace(/^[^{]+{|}$/g, '').trim(), type: 'js-fn' })

export const linkItemTitle = jsFn(linkItemTitleFn)
export const linkItemTitleFr = jsFn(linkItemTitleFrFn)
