export default {
  $id: 'https://github.com/data-fair/portals/page-config',
  'x-exports': ['types', 'vjsf'],
  'x-jstt': { additionalProperties: false },
  'x-vjsf': {
    pluginsImports: ['@koumoul/vjsf-markdown'],
    xI18n: true
  },
  'x-vjsf-locales': ['en', 'fr'],
  title: 'Page config',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    title: null,
    children: [{
      title: 'Metadata',
      'x-i18n-title': {
        fr: 'Métadonnées'
      },
      children: ['title', 'description', 'eventMetadata', 'newsMetadata', 'genericMetadata', 'showBreadcrumbs']
    }, {
      title: 'Content',
      'x-i18n-title': {
        fr: 'Contenu'
      },
      children: ['elements']
    }]
  },
  required: ['title', 'elements'],
  properties: {
    title: {
      type: 'string',
      title: 'Title',
      'x-i18n-title': {
        fr: 'Titre'
      }
    },
    description: {
      type: 'string',
      title: 'Description',
      'x-i18n-title': {
        fr: 'Description'
      },
      description: "### Tips for Writing Your Description\nThe description helps search engines and social networks present your page. Here are some best practices:\n- **Be concise:** 150-160 characters.  \n- **Clear summary:** describe the main content of the page.  \n- **Unique:** each page should have a description tailored to its content.  \n- **Encourage clicks:** make the description attractive for users.\n\nIt's better to leave the description empty than to provide a poorly written one.\n\nIf no description is provided, search engines will automatically generate a snippet from the page content.",
      'x-i18n-description': {
        fr: "### Quelques conseils pour rédiger votre description\nLa description aide les moteurs de recherche et les réseaux sociaux à présenter votre page. Voici quelques bonnes pratiques :\n- **Soyez concis :** 150-160 caractères.  \n- **Résumé clair :** décrivez le contenu principal de la page.  \n- **Unique :** chaque page doit avoir une description adaptée à son contenu.  \n- **Incitez au clic :** rendez la description attractive pour l'utilisateur.\n\nIl vaut mieux ne pas saisir de description que de saisir une description peu travaillée.\n\nSi aucune description n'est renseignée, les moteurs de recherche généreront automatiquement un extrait du contenu de la page."
      },
      layout: {
        comp: 'textarea',
        props: {
          autoGrow: true,
          counter: true,
          rows: 2
        }
      }
    },
    eventMetadata: {
      type: 'object',
      required: ['slug', 'startDate'],
      default: {},
      layout: { if: 'context.pageType === "event"' },
      properties: {
        slug: { $ref: '#/$defs/slug' },
        startDate: {
          type: 'string',
          format: 'date-time',
          title: 'Start Date',
          'x-i18n-title': {
            fr: "Date de l'évènement"
          }
        },
        endDate: {
          type: 'string',
          format: 'date-time',
          title: 'End Date',
          'x-i18n-title': {
            fr: 'Date de fin'
          }
        }
      }
    },
    newsMetadata: {
      type: 'object',
      required: ['slug'],
      default: {},
      layout: { if: 'context.pageType === "news"' },
      properties: {
        slug: { $ref: '#/$defs/slug' },
        date: {
          type: 'string',
          format: 'date-time',
          title: 'Date'
        }
      }
    },
    genericMetadata: {
      type: 'object',
      required: ['slug'],
      default: {},
      layout: { if: 'context.pageType === "generic"' },
      properties: {
        slug: { $ref: '#/$defs/slug' },
        group: {
          type: 'object',
          title: 'Group',
          'x-i18n-title': {
            fr: 'Groupe'
          },
          required: ['_id', 'title', 'slug'],
          layout: {
            getItems: {
              url: '/portals-manager/api/groups?select=_id,title,slug',
              itemsResults: 'data.results',
              itemTitle: 'item.title',
              itemKey: 'item._id'
            }
          },
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' }
          }
        }
      }
    },
    showBreadcrumbs: {
      type: 'boolean',
      title: 'Show breadcrumbs',
      'x-i18n-title': {
        fr: "Afficher le fil d'Ariane"
      },
      description: 'Display the breadcrumbs if they are enabled in the portal settings. If set to false, they will never be shown on this page. You can manually add the Breadcrumbs via the page block to position it wherever you want.',
      'x-i18n-description': {
        fr: "Affiche le fil d'Ariane si celui-ci est activé dans la configuration du portail. Si désactivé ici, il ne sera jamais affiché sur cette page. Vous pouvez ajouter manuellement le Fil d'Ariane via le bloc de pages pour le positionner où vous le souhaitez."
      },
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      },
      default: true,
    },
    elements: {
      type: 'array',
      layout: {
        slots: { component: 'page-elements' }
      },
      items: {
        $ref: 'https://github.com/data-fair/portals/page-elements#/$defs/element'
      }
    }
  },
  $defs: {
    slug: {
      type: 'string',
      title: 'Slug',
      // This pattern is only a client-side validation.
      // The actual check is done on the API, which compares the input
      // with the result of slugify and returns an error if they differ.
      pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    }
  }
}
