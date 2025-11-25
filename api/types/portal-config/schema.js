/* eslint-disable no-template-curly-in-string */
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
      { title: 'Métadonnées', children: ['title', 'description', 'allowRobots', 'authentication'] },
      { title: 'Couleurs', children: ['theme'] },
      {
        title: 'Polices de caractères',
        children: [
          { cols: 6, children: ['bodyFontFamily', 'headingFontFamily'] },
          { cols: 6, name: 'font-families-preview' }
        ]
      },
      {
        title: 'Styles',
        children: [
          {
            title: 'Liens de navigation',
            comp: 'card',
            children: [
              'navLinksConfig',
              { name: 'nav-link-preview' }
            ]
          }
        ]
      },
      { title: 'Images', children: ['logo', 'logoDark', 'favicon'] },
      {
        title: 'Entête',
        children: [
          {
            if: 'data?.headerHomeActive',
            children: [
              'headerHomeActive',
              {
                cols: { md: 6 },
                comp: 'card',
                title: 'Options générales',
                children: [
                  'header',
                  { name: 'app-bar-preview' }
                ]
              },
              {
                cols: { md: 6 },
                comp: 'card',
                title: "Options spécifiques pour la page d'accueil",
                children: [
                  'headerHome',
                  { name: 'app-bar-preview', props: { home: true } }
                ]
              }
            ]
          },
          {
            if: '!data?.headerHomeActive',
            children: [
              'headerHomeActive',
              'header',
              { name: 'app-bar-preview' }
            ]
          }
        ]
      },
      {
        title: 'Barre de navigation',
        children: [
          {
            if: 'data?.navBarHomeActive',
            children: [
              'navBarHomeActive',
              {
                cols: { md: 6 },
                comp: 'card',
                title: 'Options générales',
                children: [
                  'navBar',
                  { name: 'app-bar-preview' }
                ]
              },
              {
                cols: { md: 6 },
                comp: 'card',
                title: "Options spécifiques pour la page d'accueil",
                children: [
                  'navBarHome',
                  { name: 'app-bar-preview', props: { home: true } }
                ]
              },
              'menu'
            ]
          },
          {
            if: '!data?.navBarHomeActive',
            children: [
              'navBarHomeActive',
              'navBar',
              { name: 'app-bar-preview' },
              'menu'
            ]
          }
        ]
      },
      { title: 'Fil d\'arianne', children: ['breadcrumb'] },
      { title: 'Pied de page', children: ['footer', { name: 'footer-preview' }] },
      { title: 'Jeux de données', children: ['datasets'] },
      { title: 'Visualisations', children: ['applications'] },
      // { title: 'Réutilisations', children: [] }, // TODO: add reuses
      { title: 'Thématiques', children: ['topics'] },
      { title: 'Informations de contact', children: ['contactInformations'] },
      { title: 'Réseaux sociaux', children: ['socialShares', 'socialLinks'] },
      { title: 'Suivi d\'activité', children: ['analytics'] },
      {
        title: 'Espace personnel',
        children: ['personal']
      }
    ]
  },
  required: ['title', 'authentication', 'theme', 'header', 'navBar', 'menu', 'breadcrumb', 'footer', 'datasets', 'applications', 'contactInformations', 'socialShares', 'socialLinks', 'personal'],
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
    theme: { $ref: 'https://github.com/data-fair/lib/theme' },
    bodyFontFamily: {
      type: 'string',
      title: 'Police principale',
      layout: {
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
        getItems: {
          url: '/portals-manager/api/fonts'
        }
      }
    },
    navLinksConfig: { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/linkConfig' },
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
    headerHomeActive: {
      type: 'boolean',
      title: "Utiliser un rendu différent sur la page d'accueil",
      layout: { comp: 'switch' }
    },
    header: { $ref: 'https://github.com/data-fair/portals/portal-config-header' },
    headerHome: { $ref: 'https://github.com/data-fair/portals/portal-config-header' },
    navBarHomeActive: {
      type: 'boolean',
      title: "Utiliser un rendu différent sur la page d'accueil",
      layout: { comp: 'switch' }
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
            itemTitle: 'item.type === "standard" ? (item.subtype === "home" ? "Page d\'accueil" : item.subtype === "contact" ? "Page de contact" : item.subtype === "privacy-policy" ? "Page de politique de confidentialité" : item.subtype === "datasets" ? "Catalogue de données" : item.subtype === "applications" ? "Catalogue de visualisation" : item.subtype === "event" ? "Liste des évènements" : item.subtype === "news" ? "Liste des actualités" : item.subtype === "sitemap" ? "Plan du site" : "Page standard") + (item.title ? ` - Libellé : ${item.title}` : "") : item.type === "event" ? `Événement${item.pageRef?.title ? " - " + item.pageRef.title + "(" + item.pageRef.slug + ")" : ""}${item.title ? " - Libellé : " + item.title : ""}` : item.type === "news" ? `Actualité${item.pageRef?.title ? " - " + item.pageRef.title + "(" + item.pageRef.slug + ")"  : ""}${item.title ? " - Libellé : " + item.title : ""}` : item.type === "generic" ? `Page éditée${item.pageRef?.title ? " - " + item.pageRef.title + "(" + item.pageRef.slug + ")"  : ""}${item.title ? " - Libellé : " + item.title : ""}` : item.type === "external" ? `Lien externe - Libellé : ${item.title} - URL : ${item.href}` : item.type === "submenu" ? `Sous-menu - Libellé : ${item.title}` : "Lien non configuré"',
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
    contactInformations: { $ref: 'https://github.com/data-fair/portals/portal-config-contact-informations' },
    socialShares: { $ref: 'https://github.com/data-fair/portals/portal-config-social-shares' },
    socialLinks: { $ref: 'https://github.com/data-fair/portals/portal-config-social-links' },
    analytics: {
      type: 'object',
      description: "Configurez un système de suivi d'activité des utilisateurs (Web analytics).",
      unevaluatedProperties: false,
      required: ['tracker'],
      properties: {
        tracker: {
          $ref: 'https://github.com/data-fair/portals/portal-config-analytics-tracker'
        }
      }
    },
    personal: { $ref: 'https://github.com/data-fair/portals/portal-config-personal' },
    topics: {
      type: 'array',
      title: '',
      layout: {
        comp: 'list',
        listEditMode: 'inline',
        density: 'compact',
        getItems: {
          url: '/data-fair/api/v1/settings/${context.owner.type}/${context.owner.id}/topics',
          itemsResults: 'data',
          itemKey: 'item.id',
          itemTitle: '`Thématique : ${item.title}`',
          itemIcon: 'item.icon?.svg'
        }
      },
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', layout: 'none' },
          title: { type: 'string', layout: 'none' },
          description: {
            type: 'string',
            title: 'Ajouter une description',
            layout: 'textarea'
          },
          thumbnail: {
            type: 'object',
            required: ['_id', 'name', 'mimeType'],
            layout: {
              slots: {
                component: {
                  name: 'image-upload',
                  props: { width: 1280, label: 'Chargez une image' }
                }
              }
            },
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              mimeType: { type: 'string' }
            }
          }
        }
      }
    }
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
            icon: { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/icon' },
            children: {
              type: 'array',
              title: '',
              layout: {
                itemTitle: 'item.type === "standard" ? (item.subtype === "home" ? "Page d\'accueil" : item.subtype === "contact" ? "Page de contact" : item.subtype === "privacy-policy" ? "Page de politique de confidentialité" : item.subtype === "datasets" ? "Catalogue de données" : item.subtype === "applications" ? "Catalogue de visualisation" : item.subtype === "event" ? "Liste des évènements" : item.subtype === "news" ? "Liste des actualités" : item.subtype === "sitemap" ? "Plan du site" : "Page standard") + (item.title ? ` - Libellé : ${item.title}` : "") : item.type === "event" ? `Événement${item.pageRef?.title ? " - " + item.pageRef.title + "(" + item.pageRef.slug + ")"  : ""}${item.title ? " - Libellé : " + item.title : ""}` : item.type === "news" ? `Actualité${item.pageRef?.title ? " - " + item.pageRef.title + "(" + item.pageRef.slug + ")"  : ""}${item.title ? " - Libellé : " + item.title : ""}` : item.type === "generic" ? `Page éditée${item.pageRef?.title ? " - " + item.pageRef.title + "(" + item.pageRef.slug + ")"  : ""}${item.title ? " - Libellé : " + item.title : ""}` : item.type === "external" ? `Lien externe - Libellé : ${item.title} - URL : ${item.href}` : item.type === "submenu" ? `Sous-menu - Libellé : ${item.title}` : "Lien non configuré"',
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
