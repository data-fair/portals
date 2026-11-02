import { agentGuide } from './agent-guide.js'
import { linkItemTitle, linkItemTitleFr, standardPage, genericPage, eventPage, newsPage, externalLink } from '../common-links/schema.js'

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
  'x-agent-guide': agentGuide.en,
  'x-i18n-x-agent-guide': { fr: agentGuide.fr },
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    title: null,
    comp: 'vertical-tabs',
    props: { color: 'primary' },
    children: [
      {
        title: 'General settings',
        'x-i18n-title': { fr: 'Paramètres généraux' },
        children: [{
          title: 'Metadata',
          'x-i18n-title': { fr: 'Métadonnées' },
          comp: 'card',
          children: ['title', 'description']
        },
        {
          title: 'Topics',
          'x-i18n-title': { fr: 'Thématiques' },
          subtitle: 'You can configure how your topics are rendered in this portal. Topics are initially defined in the back-office settings.',
          'x-i18n-subtitle': { fr: 'Vous pouvez configurer le rendu de vos thématiques dans ce portail. La définition initiale des thématiques se fait dans les paramètres du back-office.' },
          comp: 'card',
          children: ['topics']
        },
        {
          title: 'Labels',
          'x-i18n-title': { fr: 'Libellés' },
          subtitle: 'You can override some of the portal standard labels',
          'x-i18n-subtitle': { fr: 'Vous pouvez surcharger certains des libellés standards du portail' },
          comp: 'card',
          children: ['labelsOverrides']
        },
        {
          title: 'Social networks',
          'x-i18n-title': { fr: 'Réseaux sociaux' },
          comp: 'card',
          children: ['socialShares', 'socialLinks']
        },
        {
          title: 'Activity tracking (web analytics)',
          'x-i18n-title': { fr: "Suivi d'activité (Web analytics)" },
          subtitle: 'You can set up your own activity tracking system from a list of supported systems. By default, the platform does not track anything except API usage metrics.',
          'x-i18n-subtitle': { fr: "Vous pouvez configurer votre propre système de suivi d'activité parmi une liste de systèmes supportés. Par défaut aucun suivi n'est effectué par la plateforme hormis les métriques de consommation des APIs." },
          comp: 'card',
          children: ['analytics']
        },
        {
          title: 'Security',
          'x-i18n-title': { fr: 'Sécurité' },
          comp: 'card',
          children: ['allowRobots', 'authentication', 'allowedFrameAncestors', 'allowedFrameSources']
        }]
      },
      {
        title: 'Appearance',
        'x-i18n-title': { fr: 'Apparence' },
        children: [
          {
            title: 'Images',
            subtitle: 'These images are used for the overall look of the site, the login screen, etc. You can upload many other images in a more targeted way in the other sections and in the pages.',
            'x-i18n-subtitle': { fr: "Ces images seront utilisées pour l'apparence globale du site, la mire d'authentification, etc. Vous pouvez charger de nombreuses autres images de manière plus ciblée dans les autres sections et dans les pages." },
            comp: 'card',
            children: ['logo', 'logoDark', 'favicon', 'errorImages']
          },
          {
            title: 'Colors',
            'x-i18n-title': { fr: 'Couleurs' },
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
            title: 'Fonts',
            'x-i18n-title': { fr: 'Polices de caractères' },
            comp: 'card',
            children: [
              { cols: 6, children: ['headingFontFamily', 'bodyFontFamily'] },
              { cols: 6, name: 'font-families-preview' }
            ]
          },
          {
            title: 'Default visual style',
            'x-i18n-title': { fr: 'Style visuel par défaut' },
            subtitle: 'Global visual settings applied by default to the whole portal. These values can be overridden in each specific block or component to adapt the style as needed. These settings affect all cards, navigation buttons and menus, topics, blocks, boxes, tabs, accordions, contact form, etc. when their elevation, density and rounded corners settings are not defined. Hover effects on clickable elements (cards, boxes, topics) are configured here and can also be overridden per block.',
            'x-i18n-subtitle': { fr: "Paramètres visuels globaux appliqués par défaut à l'ensemble du portail. Ces valeurs peuvent être surchargées dans chaque bloc ou composant spécifique pour adapter le style selon les besoins. Ces paramètres impactent toutes les vignettes, les boutons et menu de navigations, les thématiques, les blocs, boîte, onglets, accordéons, formulaire de contact,... quand leurs paramètres d'élévation, de densité et d'arrondi ne sont pas définis. Les effets au survol des éléments cliquables (vignettes, boîtes, thématiques) se configurent ici et peuvent aussi être surchargés par bloc." },
            comp: 'card',
            children: ['defaults']
          },
          {
            title: 'Navigation buttons appearance',
            'x-i18n-title': { fr: 'Rendu des boutons de navigation' },
            comp: 'card',
            children: [
              'navLinksConfig',
              { name: 'nav-link-preview' }
            ]
          },
          {
            title: 'Text links appearance',
            'x-i18n-title': { fr: 'Rendu des liens texte' },
            subtitle: 'Links displayed in texts, descriptions and the footer.',
            'x-i18n-subtitle': { fr: 'Liens affichés dans les textes, descriptions et pied de page.' },
            comp: 'card',
            children: [
              'linksConfig',
              { name: 'links-preview' }
            ]
          },
          {
            title: 'API documentation',
            'x-i18n-title': { fr: "Documentation d'API" },
            comp: 'card',
            children: ['catalogApiDocFullLayout']
          }
        ]
      },
      {
        title: 'Header',
        'x-i18n-title': { fr: 'Entête' },
        children: [
          'headerHomeActive',
          {
            if: 'data?.headerHomeActive',
            children: [
              {
                cols: { md: 6 },
                title: 'All pages',
                'x-i18n-title': { fr: 'Toutes les pages' },
                children: ['header']
              },
              {
                cols: { md: 6 },
                title: 'Home page',
                'x-i18n-title': { fr: "Page d'accueil" },
                children: ['headerHome']
              },
              {
                name: 'app-bar-preview',
                props: { title: 'All pages', 'x-i18n-title': { fr: 'Toutes les pages' } }
              },
              {
                name: 'app-bar-preview',
                props: { home: true, title: 'Home page', 'x-i18n-title': { fr: "Page d'accueil" } }
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
        title: 'Navigation bar',
        'x-i18n-title': { fr: 'Barre de navigation' },
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
                title: 'Options - Home',
                'x-i18n-title': { fr: 'Options - Accueil' },
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
            title: 'Navigation menu items',
            'x-i18n-title': { fr: 'Éléments du menu de navigation' },
            children: ['menu']
          }
        ]
      },
      { title: 'Breadcrumbs', 'x-i18n-title': { fr: "Fil d'Ariane" }, children: ['breadcrumb'] },
      { title: 'Footer', 'x-i18n-title': { fr: 'Pied de page' }, children: ['footer'] },
      { title: 'Contact', children: ['contactInformations'] },
      { title: 'Datasets', 'x-i18n-title': { fr: 'Jeux de données' }, children: ['datasets'] },
      { title: 'Applications', 'x-i18n-title': { fr: 'Visualisations' }, children: ['applications'] },
      { title: 'Reuses', 'x-i18n-title': { fr: 'Réutilisations' }, children: ['reuses'] },
      { title: 'Events', 'x-i18n-title': { fr: 'Événements' }, children: ['events'] },
      { title: 'News', 'x-i18n-title': { fr: 'Actualités' }, children: ['news'] },
      {
        if: 'data?.authentication !== "none"',
        title: 'Personal space',
        'x-i18n-title': { fr: 'Espace personnel' },
        children: ['personal']
      },
      {
        if: 'context.adminMode',
        title: 'AI assistant (beta)',
        'x-i18n-title': { fr: 'Assistant IA (bêta)' },
        children: ['agentChat']
      }
    ]
  },
  required: ['title', 'authentication', 'theme', 'header', 'navBar', 'menu', 'breadcrumb', 'footer', 'datasets', 'applications', 'reuses', 'events', 'news', 'contactInformations', 'socialShares', 'socialLinks', 'personal'],
  properties: {
    title: {
      type: 'string',
      title: 'Title',
      'x-i18n-title': { fr: 'Titre' }
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
          placeholder: 'A short description of the portal, used by search engines and when sharing on social networks.',
          'x-i18n-placeholder': { fr: 'Une brève description du portail utilisée par les moteurs de recherche et lors du partage sur les réseaux sociaux.' }
        }
      }
    },
    allowRobots: {
      type: 'boolean',
      title: 'Make the portal visible on search engines',
      'x-i18n-title': { fr: 'Rendre le portail visible sur les moteurs de recherche' },
      description: 'Allow Google and other search engines to index this portal so that it is visible in search results.',
      'x-i18n-description': { fr: "Permettre à Google et aux autres moteurs de recherche d'indexer ce portail pour qu'il soit visible dans les résultats de recherche." },
      layout: 'switch'
    },
    catalogApiDocFullLayout: {
      type: 'boolean',
      title: 'Keep the header and footer on the catalog API documentation',
      'x-i18n-title': { fr: "Conserver l'entête et le pied de page sur la documentation d'API du catalogue" },
      description: 'Displays the catalog API documentation page with the portal header, navigation bar and footer instead of a minimal layout, for better accessibility (skip links, navigation, footer).',
      'x-i18n-description': { fr: "Affiche la page de documentation de l'API du catalogue avec l'en-tête, la barre de navigation et le pied de page du portail plutôt qu'en mise en page minimale, pour un accès plus accessible (liens d'évitement, navigation, pied de page)." },
      layout: 'switch'
    },
    authentication: {
      type: 'string',
      oneOf: [
        {
          const: 'none',
          title: 'None',
          'x-i18n-title': { fr: 'Aucune' }
        },
        {
          const: 'optional',
          title: 'Optional to view protected content, configure notifications, etc',
          'x-i18n-title': { fr: 'Optionnelle pour voir les contenus protégés, configurer des notifications, etc' }
        },
        {
          const: 'required',
          title: 'Required to access the portal',
          'x-i18n-title': { fr: 'Requise pour accéder au portail' }
        }
      ],
      title: 'Authentication',
      'x-i18n-title': { fr: 'Authentification' },
      default: 'optional'
    },
    allowedFrameAncestors: {
      type: 'array',
      title: 'Domains allowed to embed this portal in an iframe',
      'x-i18n-title': { fr: 'Domaines autorisés à intégrer ce portail en iframe' },
      description: 'List of domains (e.g. https://example.com) allowed to display this portal in an iframe. Leave empty to forbid any iframe embedding.',
      'x-i18n-description': { fr: 'Liste des domaines (ex: https://example.com) autorisés à afficher ce portail dans une iframe. Laissez vide pour interdire toute intégration en iframe.' },
      items: { type: 'string' }
    },
    allowedFrameSources: {
      type: 'array',
      title: 'Domains allowed for iframes embedded in this portal',
      'x-i18n-title': { fr: 'Domaines autorisés pour les iframes intégrées dans ce portail' },
      description: 'List of domains (e.g. https://example.com) whose content can be displayed in iframes on this portal. Leave empty to forbid any external iframe.',
      'x-i18n-description': { fr: 'Liste des domaines (ex: https://example.com) dont les contenus peuvent être affichés dans des iframes sur ce portail. Laissez vide pour interdire toute iframe externe.' },
      items: { type: 'string' }
    },
    theme: { $ref: 'https://github.com/data-fair/lib/theme' },
    bodyFontFamily: {
      type: 'string',
      title: 'Main font',
      'x-i18n-title': { fr: 'Police principale' },
      layout: {
        comp: 'autocomplete',
        getItems: {
          url: '/portals-manager/api/fonts'
        }
      }
    },
    headingFontFamily: {
      type: 'string',
      title: 'Heading font',
      'x-i18n-title': { fr: 'Police des titres' },
      hint: 'Leave empty to use the main font',
      'x-i18n-hint': { fr: 'laissez vide pour utiliser la police principale' },
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
          title: 'Link underline',
          'x-i18n-title': { fr: 'Soulignement des liens' },
          description: 'A permanent underline distinguishes links by more than color alone, as recommended by RGAA.',
          'x-i18n-description': { fr: 'Le soulignement permanent distingue les liens autrement que par la couleur seule, comme recommandé par le RGAA.' },
          default: 'always',
          layout: { cols: { md: 4 } },
          oneOf: [
            { const: 'always', title: 'Always', 'x-i18n-title': { fr: 'Toujours' } },
            { const: 'always-grow', title: 'Always + grows on hover', 'x-i18n-title': { fr: 'Toujours + grossissement au survol' } },
            { const: 'hover-grow', title: 'Small line growing on hover', 'x-i18n-title': { fr: 'Petit trait grandissant au survol' } },
            { const: 'hover', title: 'On hover', 'x-i18n-title': { fr: 'Au survol' } },
            { const: 'never', title: 'Never', 'x-i18n-title': { fr: 'Jamais' } }
          ]
        },
        color: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-main',
          title: 'Link color',
          'x-i18n-title': { fr: 'Couleur des liens' },
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
          title: 'Underline color',
          'x-i18n-title': { fr: 'Couleur du soulignement' },
          description: 'If empty, uses the link color.',
          'x-i18n-description': { fr: 'Si vide, reprend la couleur du lien.' },
          layout: {
            if: "parent.data?.underline !== 'never'",
            slots: {
              item: { name: 'color-select-item' },
              selection: { name: 'color-select-selection' }
            },
            cols: { md: 4 }
          }
        },
        newWindowIcon: {
          type: 'boolean',
          title: 'Show an icon on links that open in a new tab',
          'x-i18n-title': { fr: "Afficher un picto sur les liens qui s'ouvrent dans un nouvel onglet" },
          description: 'Recommended for accessibility: complements with a visual cue the "New window" information already given to screen readers.',
          'x-i18n-description': { fr: "Recommandé pour l'accessibilité : complète par un repère visuel l'information « Nouvelle fenêtre » déjà donnée aux lecteurs d'écran." },
          default: false
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
      title: 'Logo - dark theme variant',
      'x-i18n-title': { fr: 'Logo - variante pour thème sombre' },
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Logo - dark theme variant', 'x-i18n-label': { fr: 'Logo - variante pour thème sombre' } }
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
      title: 'Use a different appearance on the home page',
      'x-i18n-title': { fr: "Utiliser un rendu différent sur la page d'accueil" },
      layout: 'switch'
    },
    header: { $ref: 'https://github.com/data-fair/portals/portal-config-header' },
    headerHome: { $ref: 'https://github.com/data-fair/portals/portal-config-header' },
    navBarHomeActive: {
      type: 'boolean',
      title: 'Use a different appearance on the home page',
      'x-i18n-title': { fr: "Utiliser un rendu différent sur la page d'accueil" },
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
          title: 'Navigation menu items',
          'x-i18n-title': { fr: 'Éléments du menu de navigation' },
          layout: {
            title: '',
            itemTitle: linkItemTitle,
            'x-i18n-itemTitle': { fr: linkItemTitleFr },
            messages: { addItem: 'Add a link', 'x-i18n-addItem': { fr: 'Ajouter un lien' } }
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
          title: 'Merge dataset/application pages',
          'x-i18n-title': { fr: 'Fusionner les pages datasets/applications' },
          description: 'If enabled, the subpages of a dataset or an application (e.g. /datasets/123/table) are counted as the parent page (/datasets/123) in the statistics.',
          'x-i18n-description': { fr: "Si activé, les sous-pages d'un dataset ou d'une application (ex: /datasets/123/table) seront comptabilisées comme la page parent (/datasets/123) dans les statistiques." },
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
          title: 'Hover effects on clickable elements (boxes, cards, topics, buttons and navigation menu)',
          'x-i18n-title': { fr: 'Effets au survol des éléments cliquables (Boîtes, vignettes, thématiques, boutons et menu de navigation)' },
        }
      }
    }
  },
  $defs: {
    menuItem: {
      type: 'object',
      // named, or the drop-down of a new « Lien non configuré » row had no label to point to
      oneOfLayout: { label: 'Link type', 'x-i18n-label': { fr: 'Type de lien' }, emptyData: true },
      discriminator: { propertyName: 'type' },
      // layout: { switch: [{ if: 'summary', slots: { component: 'link-item-summary' } }] },
      layout: { switch: [{ if: 'summary', children: [] }] },
      oneOf: [
        menuBranch(standardPage),
        menuBranch(genericPage),
        menuBranch(eventPage),
        menuBranch(newsPage),
        {
          title: 'Submenu',
          'x-i18n-title': { fr: 'Sous-menu' },
          required: ['type', 'title', 'children'],
          additionalProperties: false,
          properties: {
            type: { const: 'submenu' },
            title: {
              type: 'string',
              title: 'Label',
              'x-i18n-title': { fr: 'Libellé' }
            },
            icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
            children: {
              type: 'array',
              title: '',
              layout: {
                itemTitle: linkItemTitle,
                'x-i18n-itemTitle': { fr: linkItemTitleFr },
                messages: { addItem: 'Add a link', 'x-i18n-addItem': { fr: 'Ajouter un lien' } }
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
