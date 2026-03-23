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
          title: 'Tri par défaut',
          description: "Ce tri sera appliqué par défaut lorsque l'utilisateur arrive sur la page.",
          default: 'startDate:1',
          oneOf: [
            { const: 'startDate:1', title: 'Date de début (du plus ancien au plus récent)' },
            { const: 'title:1', title: 'Ordre alphabétique (A à Z)' }
          ]
        },
        includePast: {
          type: 'boolean',
          title: 'Inclure les évènements passés'
        },
        columns: {
          type: 'integer',
          title: 'Nombre de colonnes',
          description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
          default: 2,
          minimum: 1,
          maximum: 3
        },
        eventCountPosition: {
          type: 'string',
          title: 'Position du nombre de résultats',
          default: 'top',
          oneOf: [
            { const: 'none', title: 'Aucun' },
            { const: 'top', title: 'Au dessus des filtres' },
            { const: 'bottom', title: 'Au dessus des résultats' }
          ]
        },
        showSortBesideCount: {
          type: 'boolean',
          title: 'Afficher le tri à droite du nombre de résultats.',
          layout: {
            if: 'parent.data?.eventCountPosition === "bottom"',
            comp: 'switch'
          }
        },
        showAdvancedFilters: {
          type: 'boolean',
          title: 'Activer les filtres avancés',
          description: 'Mode de configuration avancé. Permet de configurer des blocs de pages personnalisés entre les filtres de base et les résultats.',
          layout: { comp: 'switch' }
        },
        filters: {
          type: 'object',
          title: 'Configuration des filtres',
          layout: 'card',
          properties: {
            position: {
              type: 'string',
              title: 'Position des filtres',
              default: 'top',
              oneOf: [
                { const: 'top', title: 'Au dessus des résultats' },
                { const: 'left', title: 'À gauche des résultats' }
              ]
            },
            items: {
              type: 'array',
              title: 'Filtres à afficher',
              description: 'Mode simplifié pour choisir les filtres à afficher sur la page. Vous pouvez aussi utiliser des blocs fonctionnels pour plus de personnalisation des filtres.',
              items: {
                type: 'string',
                oneOf: [
                  { const: 'search', title: 'Barre de recherche' },
                  { const: 'include-past', title: 'Inclure les événements passés' },
                  { const: 'sort', title: 'Tri' }
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
          title: 'Configuration de la pagination',
          layout: 'card',
          properties: {
            position: {
              type: 'string',
              title: 'Position',
              description: 'Désactiver la pagination affichera les résultats en scroll infini.',
              default: 'none',
              oneOf: [
                { const: 'none', title: 'Scroll infini' },
                { const: 'before', title: 'Avant les résultats' },
                { const: 'after', title: 'Après les résultats' },
                { const: 'both', title: 'Les deux' }
              ]
            },
            alignment: {
              type: 'string',
              title: 'Alignement',
              default: 'center',
              layout: { if: 'parent.data?.position !== "none"' },
              oneOf: [
                { const: 'left', title: 'Gauche' },
                { const: 'center', title: 'Centré' },
                { const: 'right', title: 'Droite' }
              ]
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
            title: 'Event Card',
            'x-i18n-title': {
              fr: 'Configuration des vignettes'
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
          title: 'Type de liste',
          default: 'upcoming',
          oneOf: [
            { const: 'upcoming', title: 'Upcoming', 'x-i18n-title': { fr: 'Les prochains événements' } },
            { const: 'custom', title: 'Custom list', 'x-i18n-title': { fr: 'Liste libre' } }
          ]
        },
        events: {
          type: 'array',
          title: 'Événements',
          description: 'Sélectionnez manuellement les événements à afficher.',
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
          title: 'Nombre de colonnes',
          description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
          default: 2,
          minimum: 1,
          maximum: 3
        },
        limit: {
          type: 'integer',
          title: "Nombre d'événements",
          description: "Nombre total d'événements à afficher.",
          default: 3,
          minimum: 1,
          maximum: 12
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Utiliser la configuration du portail',
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
            title: 'Event Card',
            'x-i18n-title': {
              fr: 'Configuration de la vignette'
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
          title: 'Événement',
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
          title: 'Utiliser la configuration du portail',
          layout: 'switch',
          default: true
        },
        cardConfig: { $ref: 'https://github.com/data-fair/portals/common-event-card' },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
  }
}
