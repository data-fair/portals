/* eslint-disable no-template-curly-in-string */
export default {
  $id: 'https://github.com/data-fair/portals/page-element-events',
  'x-exports': [],
  $defs: {
    'element-event-catalog': {
      title: 'EventCatalogElement',
      'x-i18n-title': {
        en: 'Events catalog',
        fr: "Catalogue d'événements"
      },
      type: 'object',
      unevaluatedProperties: false,
      required: ['type'],
      properties: {
        type: { const: 'event-catalog' },
        uuid: { type: 'string', layout: 'none' },
        defaultSort: {
          type: 'string',
          title: 'Default sort',
          'x-i18n-title': { fr: 'Tri par défaut' },
          description: 'This sort is applied by default when the user arrives on the page.',
          'x-i18n-description': { fr: "Ce tri sera appliqué par défaut lorsque l'utilisateur arrive sur la page." },
          default: 'startDate:1',
          oneOf: [
            { const: 'startDate:1', title: 'Start date (oldest to newest)', 'x-i18n-title': { fr: 'Date de début (du plus ancien au plus récent)' } },
            { const: 'title:1', title: 'Alphabetical order (A to Z)', 'x-i18n-title': { fr: 'Ordre alphabétique (A à Z)' } }
          ]
        },
        includePast: {
          type: 'boolean',
          title: 'Include past events',
          'x-i18n-title': { fr: 'Inclure les événements passés' }
        },
        columns: {
          type: 'integer',
          title: 'Number of columns',
          'x-i18n-title': { fr: 'Nombre de colonnes' },
          description: 'Number of columns used on large screens. The number of columns is reduced on smaller screens.',
          'x-i18n-description': { fr: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.' },
          default: 2,
          minimum: 1,
          maximum: 3
        },
        countPosition: {
          type: 'string',
          title: 'Results count position',
          'x-i18n-title': { fr: 'Position du nombre de résultats' },
          default: 'top',
          oneOf: [
            { const: 'none', title: 'None', 'x-i18n-title': { fr: 'Aucun' } },
            { const: 'top', title: 'Above the filters', 'x-i18n-title': { fr: 'Au-dessus des filtres' } },
            { const: 'bottom', title: 'Above the results', 'x-i18n-title': { fr: 'Au-dessus des résultats' } }
          ]
        },
        showSortBesideCount: {
          type: 'boolean',
          title: 'Show the sort to the right of the results count.',
          'x-i18n-title': { fr: 'Afficher le tri à droite du nombre de résultats.' },
          layout: {
            if: 'parent.data?.countPosition === "bottom"',
            comp: 'switch'
          }
        },
        showAdvancedFilters: {
          type: 'boolean',
          title: 'Enable advanced filters',
          'x-i18n-title': { fr: 'Activer les filtres avancés' },
          description: 'Advanced configuration mode. Lets you configure custom page blocks between the basic filters and the results.',
          'x-i18n-description': { fr: 'Mode de configuration avancé. Permet de configurer des blocs de pages personnalisés entre les filtres de base et les résultats.' },
          layout: { comp: 'switch' }
        },
        filters: {
          type: 'object',
          title: 'Events catalog filters',
          'x-i18n-title': { fr: 'Filtres', en: 'Filters' },
          layout: 'card',
          properties: {
            position: {
              type: 'string',
              title: 'Filters position',
              'x-i18n-title': { fr: 'Position des filtres' },
              default: 'top',
              oneOf: [
                { const: 'top', title: 'Above the results', 'x-i18n-title': { fr: 'Au-dessus des résultats' } },
                { const: 'left', title: 'To the left of the results', 'x-i18n-title': { fr: 'À gauche des résultats' } }
              ]
            },
            items: {
              type: 'array',
              title: 'Filters to display',
              'x-i18n-title': { fr: 'Filtres à afficher' },
              description: 'Simplified mode to choose the filters displayed on the page. You can also use functional blocks to customize the filters further.',
              'x-i18n-description': { fr: 'Mode simplifié pour choisir les filtres à afficher sur la page. Vous pouvez aussi utiliser des blocs fonctionnels pour plus de personnalisation des filtres.' },
              items: {
                type: 'string',
                oneOf: [
                  { const: 'search', title: 'Search bar', 'x-i18n-title': { fr: 'Barre de recherche' } },
                  { const: 'include-past', title: 'Include past events', 'x-i18n-title': { fr: 'Inclure les événements passés' } },
                  { const: 'sort', title: 'Sort', 'x-i18n-title': { fr: 'Tri' } }
                ]
              }
            },
            density: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density'
            },
            rounded: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded'
            }
          }
        },
        pagination: {
          type: 'object',
          title: 'Events catalog pagination',
          'x-i18n-title': { fr: 'Pagination', en: 'Pagination' },
          layout: 'card',
          properties: {
            position: {
              type: 'string',
              title: 'Position',
              description: 'Disabling pagination displays the results with infinite scroll.',
              'x-i18n-description': { fr: 'Désactiver la pagination affichera les résultats en scroll infini.' },
              default: 'none',
              oneOf: [
                { const: 'none', title: 'Infinite scroll', 'x-i18n-title': { fr: 'Scroll infini' } },
                { const: 'before', title: 'Before the results', 'x-i18n-title': { fr: 'Avant les résultats' } },
                { const: 'after', title: 'After the results', 'x-i18n-title': { fr: 'Après les résultats' } },
                { const: 'both', title: 'Both', 'x-i18n-title': { fr: 'Les deux' } }
              ]
            },
            alignment: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/horizontal-alignment',
              layout: { if: 'parent.data?.position !== "none"' }
            }
          }
        },
        advancedFilters: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: 'https://github.com/data-fair/portals/page-elements#/$defs/element'
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-event-list': {
      type: 'object',
      title: 'EventListElement',
      'x-i18n-title': {
        en: 'Events list',
        fr: "Liste d'événements"
      },
      layout: {
        children: [
          'type',
          'mode',
          {
            if: 'data?.mode !== "custom"',
            children: ['limit']
          },
          {
            if: 'data?.mode === "custom"',
            children: ['events']
          },
          'columns',
          'mb',
          {
            title: 'Event cards',
            'x-i18n-title': {
              fr: 'Vignettes'
            },
            comp: 'card',
            children: [
              'usePortalConfig',
              {
                if: '!data?.usePortalConfig',
                children: ['cardConfig']
              }
            ]
          }
        ]
      },
      required: ['type', 'columns', 'limit'],
      properties: {
        type: { const: 'event-list' },
        uuid: { type: 'string', layout: 'none' },
        mode: {
          type: 'string',
          title: 'List type',
          'x-i18n-title': { fr: 'Type de liste' },
          default: 'upcoming',
          oneOf: [
            { const: 'upcoming', title: 'Upcoming', 'x-i18n-title': { fr: 'Les prochains événements' } },
            { const: 'custom', title: 'Custom list', 'x-i18n-title': { fr: 'Liste libre' } }
          ]
        },
        events: {
          type: 'array',
          title: 'Events',
          'x-i18n-title': { fr: 'Événements' },
          description: 'Manually select the events to display.',
          'x-i18n-description': { fr: 'Sélectionnez manuellement les événements à afficher.' },
          layout: {
            getItems: {
              url: '/portals-manager/api/pages?type=event&select=title,config.eventMetadata.slug&size=20',
              qSearchParam: 'q',
              itemsResults: 'data.results?.map(item => ({ title: item.title, slug: item.config?.eventMetadata?.slug })) ?? []',
              itemTitle: '`${item.title} (${item.slug})`',
              itemKey: 'item.slug'
            },
            props: {
              chips: true,
              closableChips: true,
              clearable: false
            }
          },
          items: {
            type: 'object',
            required: ['slug'],
            properties: {
              slug: { type: 'string' },
              title: { type: 'string' }
            }
          },
          maxItems: 100
        },
        columns: {
          type: 'integer',
          title: 'Number of columns',
          'x-i18n-title': { fr: 'Nombre de colonnes' },
          description: 'Number of columns used on large screens. The number of columns is reduced on smaller screens.',
          'x-i18n-description': { fr: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.' },
          default: 2,
          minimum: 1,
          maximum: 3
        },
        limit: {
          type: 'integer',
          title: 'Number of events',
          'x-i18n-title': { fr: "Nombre d'événements" },
          description: 'Total number of events to display.',
          'x-i18n-description': { fr: "Nombre total d'événements à afficher." },
          default: 3,
          minimum: 1,
          maximum: 12
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Use the portal configuration',
          'x-i18n-title': { fr: 'Utiliser la configuration du portail' },
          layout: 'switch',
          default: true
        },
        cardConfig: { $ref: 'https://github.com/data-fair/portals/common-event-card' },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-event-card': {
      type: 'object',
      title: 'EventCardElement',
      'x-i18n-title': {
        en: 'Event card',
        fr: "Vignette d'événement"
      },
      layout: {
        children: [
          'type',
          'event',
          'mb',
          {
            title: 'Event card',
            'x-i18n-title': {
              fr: 'Vignette'
            },
            comp: 'card',
            children: [
              'usePortalConfig',
              {
                if: '!data?.usePortalConfig',
                children: ['cardConfig']
              }
            ]
          }
        ]
      },
      required: ['type', 'event', 'usePortalConfig'],
      properties: {
        type: { const: 'event-card' },
        uuid: { type: 'string', layout: 'none' },
        event: {
          type: 'object',
          title: 'Selected event',
          'x-i18n-title': { fr: 'Événement', en: 'Event' },
          additionalProperties: false,
          required: ['slug'],
          layout: {
            getItems: {
              url: '/portals-manager/api/pages?type=event&select=title,config.eventMetadata.slug&size=20',
              qSearchParam: 'q',
              itemsResults: 'data.results?.map(item => ({ title: item.title, slug: item.config?.eventMetadata?.slug })) ?? []',
              itemTitle: '`${item.title} (${item.slug})`',
              itemKey: 'item.slug'
            }
          },
          properties: {
            slug: { type: 'string' },
            title: { type: 'string' }
          }
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Use the portal configuration',
          'x-i18n-title': { fr: 'Utiliser la configuration du portail' },
          layout: 'switch',
          default: true
        },
        cardConfig: { $ref: 'https://github.com/data-fair/portals/common-event-card' },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
  }
}
