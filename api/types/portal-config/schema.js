import { linkItemTitle } from '../portal-config-links/schema.js'

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
    comp: 'vertical-tabs',
    props: { color: 'primary' },
    children: [
      {
        title: 'Paramètres généraux',
        children: [{
          title: 'Métadonnées',
          comp: 'card',
          children: ['title', 'description']
        },
        {
          title: 'Thématiques',
          subtitle: 'Vous pouvez configurer le rendu de vos thématiques dans ce portail. La définition initiale des thématiques se fait dans les paramètres du back-office.',
          comp: 'card',
          children: ['topics']
        },
        {
          title: 'Libellés',
          subtitle: 'Vous pouvez surcharger certains des libellés standards du portail',
          comp: 'card',
          children: ['labelsOverrides']
        },
        {
          title: 'Réseaux sociaux',
          comp: 'card',
          children: ['socialShares', 'socialLinks']
        },
        {
          title: 'Suivi d\'activité (Web analytics)',
          subtitle: 'Vous pouvez configurer votre propre système de suivi d\'activité parmi une liste de systèmes supportés. Par défaut aucun suivi n\'est effectué par la plateforme hormis les métriques de consommation des APIs.',
          comp: 'card',
          children: ['analytics']
        },
        {
          title: 'Sécurité',
          comp: 'card',
          children: ['allowRobots', 'authentication', 'allowedFrameAncestors', 'allowedFrameSources']
        },
        {
          title: 'Moteur de recherche',
          comp: 'card',
          children: ['searchEngine']
        }]
      },
      {
        title: 'Apparence',
        children: [
          {
            title: 'Images',
            subtitle: 'Ces images seront utilisées pour l\'apparence globale du site, la mire d\'authentification, etc. Vous pouvez charger de nombreuses autres images de manière plus ciblée dans les autres sections et dans les pages.',
            comp: 'card',
            children: ['logo', 'logoDark', 'favicon', 'errorImages']
          },
          {
            title: 'Couleurs',
            comp: 'card',
            children: ['theme']
          },
          {
            title: 'Polices de caractères',
            comp: 'card',
            children: [
              { cols: 6, children: ['bodyFontFamily', 'headingFontFamily'] },
              { cols: 6, name: 'font-families-preview' }
            ]
          },
          {
            title: 'Rendu des liens de navigation',
            comp: 'card',
            children: [
              'navLinksConfig',
              { name: 'nav-link-preview' }
            ]
          }
        ]
      },
      {
        title: 'Entête',
        children: [
          'headerHomeActive',
          {
            if: 'data?.headerHomeActive',
            children: [
              {

                cols: { md: 6 },
                comp: 'card',
                title: 'Options',
                children: ['header']
              },
              {
                cols: { md: 6 },
                comp: 'card',
                title: 'Options - Accueil',
                children: ['headerHome']
              },
              {
                name: 'app-bar-preview'
              },
              {
                name: 'app-bar-preview',
                props: { home: true }
              }
            ]
          },
          {
            if: '!data?.headerHomeActive',
            children: [
              {
                comp: 'card',
                title: 'Options',
                children: ['header']
              },
              { name: 'app-bar-preview' }
            ]
          },
        ]
      },
      {
        title: 'Barre de navigation',
        children: [
          'navBarHomeActive',
          {
            if: 'data?.navBarHomeActive',
            children: [
              {
                cols: { md: 6 },
                comp: 'card',
                title: 'Options',
                children: ['navBar']
              },
              {
                cols: { md: 6 },
                comp: 'card',
                title: 'Options - Accueil',
                children: ['navBarHome']
              },
              {
                name: 'app-bar-preview'
              },
              {
                name: 'app-bar-preview',
                props: { home: true }
              }
            ]
          },
          {
            if: '!data?.navBarHomeActive',
            children: [
              {
                comp: 'card',
                title: 'Options',
                children: [
                  'navBar'
                ]
              },
              { name: 'app-bar-preview' }
            ]
          },
          {
            comp: 'card',
            title: 'Éléments du menu de navigation',
            children: ['menu']
          }
        ]
      },
      { title: "Fil d'Ariane", children: ['breadcrumb', { name: 'breadcrumb-preview' }] },
      { title: 'Pied de page', children: ['footer'] },
      { title: 'Contact', children: ['contactInformations'] },
      { title: 'Jeux de données', children: ['datasets'] },
      { title: 'Visualisations', children: ['applications'] },
      { title: 'Réutilisations', children: ['reuses'] },
      {
        if: 'data?.authentication !== "none"',
        title: 'Espace personnel',
        children: ['personal']
      }
    ]
  },
  required: ['title', 'authentication', 'theme', 'header', 'navBar', 'menu', 'breadcrumb', 'footer', 'datasets', 'applications', 'reuses', 'contactInformations', 'socialShares', 'socialLinks', 'personal'],
  properties: {
    title: {
      type: 'string',
      title: 'Titre'
    },
    description: {
      type: 'string',
      title: 'Description',
      layout: {
        comp: 'textarea',
        props: {
          autoGrow: true,
          counter: true,
          rows: 3,
          placeholder: 'Une brève description du portail utilisée par les moteurs de recherche et lors du partage sur les réseaux sociaux.'
        }
      }
    },
    allowRobots: {
      type: 'boolean',
      title: 'Rendre le portail visible sur les moteurs de recherche',
      description: "Permettre à Google et aux autres moteurs de recherche d'indexer ce portail pour qu'il soit visible dans les résultats de recherche.",
      layout: 'switch'
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
    allowedFrameAncestors: {
      type: 'array',
      title: 'Domaines autorisés à intégrer ce portail en iframe',
      description: 'Liste des domaines (ex: https://example.com) autorisés à afficher ce portail dans une iframe. Laissez vide pour interdire toute intégration en iframe.',
      items: { type: 'string' }
    },
    allowedFrameSources: {
      type: 'array',
      title: 'Domaines autorisés pour les iframes intégrées dans ce portail',
      description: 'Liste des domaines (ex: https://example.com) dont les contenus peuvent être affichés dans des iframes sur ce portail. Laissez vide pour interdire toute iframe externe.',
      items: { type: 'string' }
    },
    theme: { $ref: 'https://github.com/data-fair/lib/theme' },
    bodyFontFamily: {
      type: 'string',
      title: 'Police principale',
      layout: {
        comp: 'autocomplete',
        getItems: {
          url: '/portals-manager/api/fonts'
        }
      }
    },
    headingFontFamily: {
      type: 'string',
      title: 'Police des titres',
      hint: 'laissez vide pour utiliser la police principale',
      layout: {
        comp: 'autocomplete',
        getItems: {
          url: '/portals-manager/api/fonts'
        }
      }
    },
    navLinksConfig: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/buttonConfig' },
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
    errorImages: { $ref: 'https://github.com/data-fair/portals/portal-config-error-images' },
    headerHomeActive: {
      type: 'boolean',
      title: "Utiliser un rendu différent sur la page d'accueil",
      layout: 'switch'
    },
    header: { $ref: 'https://github.com/data-fair/portals/portal-config-header' },
    headerHome: { $ref: 'https://github.com/data-fair/portals/portal-config-header' },
    navBarHomeActive: {
      type: 'boolean',
      title: "Utiliser un rendu différent sur la page d'accueil",
      layout: 'switch'
    },
    navBar: { $ref: 'https://github.com/data-fair/portals/portal-config-nav-bar' },
    navBarHome: { $ref: 'https://github.com/data-fair/portals/portal-config-nav-bar' },
    menu: {
      type: 'object',
      unevaluatedProperties: false,
      required: ['children'],
      properties: {
        children: {
          type: 'array',
          title: 'Éléments du menu de navigation',
          layout: {
            title: '',
            itemTitle: linkItemTitle,
            messages: { addItem: 'Ajouter un lien' }
          },
          items: { $ref: '#/$defs/menuItem' }
        }
      }
    },
    breadcrumb: { $ref: 'https://github.com/data-fair/portals/portal-config-breadcrumb' },
    footer: { $ref: 'https://github.com/data-fair/portals/portal-config-footer' },
    datasets: { $ref: 'https://github.com/data-fair/portals/portal-config-datasets' },
    applications: { $ref: 'https://github.com/data-fair/portals/portal-config-applications' },
    reuses: { $ref: 'https://github.com/data-fair/portals/portal-config-reuses' },
    contactInformations: { $ref: 'https://github.com/data-fair/portals/portal-config-contact-informations' },
    socialShares: { $ref: 'https://github.com/data-fair/portals/portal-config-social-shares' },
    socialLinks: { $ref: 'https://github.com/data-fair/portals/portal-config-social-links' },
    analytics: {
      type: 'object',
      unevaluatedProperties: false,
      required: ['tracker'],
      properties: {
        tracker: {
          $ref: 'https://github.com/data-fair/portals/portal-config-analytics-tracker'
        }
      }
    },
    searchEngine: {
      type: 'object',
      title: 'Moteur de recherche',
      unevaluatedProperties: false,
      properties: {
        active: {
          type: 'boolean',
          title: 'Activer le moteur de recherche',
          default: false,
          layout: 'switch'
        },
        types: {
          type: 'array',
          title: 'Types de contenus à inclure',
          items: {
            type: 'string',
            enum: ['dataset', 'application', 'page', 'reuse']
          }
        }
      }
    },
    personal: { $ref: 'https://github.com/data-fair/portals/portal-config-personal' },
    topics: { $ref: 'https://github.com/data-fair/portals/portal-config-topics' },
    labelsOverrides: { $ref: 'https://github.com/data-fair/portals/portal-config-labels-overrides' }
  },
  $defs: {
    menuItem: {
      type: 'object',
      unevaluatedProperties: false,
      oneOfLayout: { emptyData: true },
      discriminator: { propertyName: 'type' },
      // layout: { switch: [{ if: 'summary', slots: { component: 'link-item-summary' } }] },
      layout: { switch: [{ if: 'summary', children: [] }] },
      oneOf: [
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/standardPage' },
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/eventPage' },
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/newsPage' },
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/genericPage' },
        {
          title: 'Sous-menu',
          required: ['type', 'title', 'children'],
          properties: {
            type: { const: 'submenu' },
            title: {
              type: 'string',
              title: 'Libellé'
            },
            icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
            children: {
              type: 'array',
              title: '',
              layout: {
                itemTitle: linkItemTitle,
                messages: { addItem: 'Ajouter un lien' }
              },
              items: { $ref: '#/$defs/menuItem' }
            }
          }
        },
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/externalLink' }
      ]
    }
  }
}
