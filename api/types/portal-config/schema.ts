import { linkItemTitle, standardPage, genericPage, eventPage, newsPage, externalLink } from '../common-links/schema.js'

const menuBranch = (def: any) => ({ ...structuredClone(def), additionalProperties: false })

export default {
  $id: 'https://github.com/data-fair/portals/portal-config',
  'x-exports': ['types', 'vjsf'],
  'x-vjsf': {
    pluginsImports: ['@koumoul/vjsf-markdown'],
    xI18n: true,
    webmcp: true,
    ajvOptions: { discriminator: true }
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
            children: [
              {
                if: 'data?.theme?.dark || data?.theme?.hc || data?.theme?.hcDark',
                children: [{ name: 'theme-beta-warning' }]
              },
              'theme'
            ]
          },
          {
            title: 'Polices de caractères',
            comp: 'card',
            children: [
              { cols: 6, children: ['headingFontFamily', 'bodyFontFamily'] },
              { cols: 6, name: 'font-families-preview' }
            ]
          },
          {
            title: 'Style visuel par défaut',
            subtitle: "Paramètres visuels globaux appliqués par défaut à l'ensemble du portail. Ces valeurs peuvent être surchargées dans chaque bloc ou composant spécifique pour adapter le style selon les besoins. Ces paramètres impactent toutes les vignettes, les boutons et menu de navigations, les thématiques et mots clés, les blocs, boite, onglets, accordéons, barre de recherche, formulaire de contact,... quand leurs paramètres d'élévation, de densité et d'arrondi ne sont pas définis. Les effets au survol des éléments cliquables (vignettes, boites, thématiques) se configurent ici et peuvent aussi être surchargés par bloc.",
            comp: 'card',
            children: ['defaults']
          },
          {
            title: 'Rendu des boutons de navigation',
            comp: 'card',
            children: [
              'navLinksConfig',
              { name: 'nav-link-preview' }
            ]
          },
          {
            title: 'Rendu des liens texte',
            subtitle: 'Liens affichés dans les textes, descriptions et pied de page.',
            comp: 'card',
            children: [
              'linksConfig',
              { name: 'links-preview' }
            ]
          },
          {
            title: "Documentation d'API",
            comp: 'card',
            children: ['catalogApiDocFullLayout']
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
                title: 'Toutes les pages',
                children: ['header']
              },
              {
                cols: { md: 6 },
                title: "Page d'accueil",
                children: ['headerHome']
              },
              {
                name: 'app-bar-preview',
                props: { title: 'Toutes les pages' }
              },
              {
                name: 'app-bar-preview',
                props: { home: true, title: "Page d'accueil" }
              }
            ]
          },
          {
            if: '!data?.headerHomeActive',
            children: [
              'header',
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
      { title: "Fil d'Ariane", children: ['breadcrumb'] },
      { title: 'Pied de page', children: ['footer'] },
      { title: 'Contact', children: ['contactInformations'] },
      { title: 'Jeux de données', children: ['datasets'] },
      { title: 'Visualisations', children: ['applications'] },
      { title: 'Réutilisations', children: ['reuses'] },
      { title: 'Événements', children: ['events'] },
      { title: 'Actualités', children: ['news'] },
      {
        if: 'data?.authentication !== "none"',
        title: 'Espace personnel',
        children: ['personal']
      },
      {
        if: 'context.adminMode',
        title: 'Assistant IA (bêta)',
        children: ['agentChat']
      }
    ]
  },
  required: ['title', 'authentication', 'theme', 'header', 'navBar', 'menu', 'breadcrumb', 'footer', 'datasets', 'applications', 'reuses', 'events', 'news', 'contactInformations', 'socialShares', 'socialLinks', 'personal'],
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
    catalogApiDocFullLayout: {
      type: 'boolean',
      title: "Conserver l'entête et le pied de page sur la documentation d'API du catalogue",
      description: "Affiche la page de documentation de l'API du catalogue avec l'en-tête, la barre de navigation et le pied de page du portail plutôt qu'en mise en page minimale, pour un accès plus accessible (liens d'évitement, navigation, pied de page).",
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
    linksConfig: {
      type: 'object',
      properties: {
        underline: {
          type: 'string',
          title: 'Soulignement des liens',
          description: 'Le soulignement permanent distingue les liens autrement que par la couleur seule, comme recommandé par le RGAA.',
          default: 'always',
          layout: { cols: { md: 4 } },
          oneOf: [
            { const: 'always', title: 'Toujours' },
            { const: 'always-grow', title: 'Toujours + grossissement au survol' },
            { const: 'hover-grow', title: 'Petit trait grandissant au survol' },
            { const: 'hover', title: 'Au survol' },
            { const: 'never', title: 'Jamais' }
          ]
        },
        color: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-main',
          title: 'Couleur des liens',
          layout: {
            slots: {
              item: { name: 'color-select-item' },
              selection: { name: 'color-select-selection' }
            },
            cols: { md: 4 }
          }
        },
        underlineColor: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-main',
          title: 'Couleur du soulignement',
          description: 'Si vide, reprend la couleur du lien.',
          layout: {
            if: "parent.data?.underline !== 'never'",
            slots: {
              item: { name: 'color-select-item' },
              selection: { name: 'color-select-selection' }
            },
            cols: { md: 4 }
          }
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
      title: 'Logo - variante pour thème sombre',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Logo - variante pour thème sombre' }
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
    events: { $ref: 'https://github.com/data-fair/portals/portal-config-event' },
    news: { $ref: 'https://github.com/data-fair/portals/portal-config-news' },
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
        },
        mergeDatasetAppPaths: {
          type: 'boolean',
          title: 'Fusionner les pages datasets/applications',
          description: "Si activé, les sous-pages d'un dataset ou d'une application (ex: /datasets/123/table) seront comptabilisées comme la page parent (/datasets/123) dans les statistiques.",
          default: false
        }
      }
    },
    personal: { $ref: 'https://github.com/data-fair/portals/portal-config-personal' },
    topics: { $ref: 'https://github.com/data-fair/portals/portal-config-topics' },
    labelsOverrides: { $ref: 'https://github.com/data-fair/portals/portal-config-labels-overrides' },
    agentChat: { $ref: 'https://github.com/data-fair/portals/portal-config-agent-chat' },
    defaults: {
      type: 'object',
      properties: {
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          layout: { cols: { md: 4 } },
          default: 1
        },
        density: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density',
          layout: { cols: { md: 4 } },
          default: 'comfortable'
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
          layout: { cols: { md: 4 } },
          default: 'default'
        },
        hover: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/hoverConfig',
          title: 'Effets au survol des éléments cliquables (Boites, vignettes, thématiques, boutons et menu de navigation)',
        }
      }
    }
  },
  $defs: {
    menuItem: {
      type: 'object',
      oneOfLayout: { emptyData: true },
      discriminator: { propertyName: 'type' },
      // layout: { switch: [{ if: 'summary', slots: { component: 'link-item-summary' } }] },
      layout: { switch: [{ if: 'summary', children: [] }] },
      oneOf: [
        menuBranch(standardPage),
        menuBranch(genericPage),
        menuBranch(eventPage),
        menuBranch(newsPage),
        {
          title: 'Sous-menu',
          required: ['type', 'title', 'children'],
          additionalProperties: false,
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
        menuBranch(externalLink)
      ]
    }
  }
}
