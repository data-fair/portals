/* eslint-disable no-template-curly-in-string */
export default {
  $id: 'https://github.com/data-fair/portals/page-element-applications',
  'x-exports': [],
  $defs: {
    'element-applications-catalog': {
      title: 'ApplicationsCatalogElement',
      'x-i18n-title': {
        en: 'Applications catalog',
        fr: 'Catalogue de visualisations'
      },
      type: 'object',
      unevaluatedProperties: false,
      required: ['type'],
      properties: {
        type: { const: 'applications-catalog' },
        uuid: { type: 'string', layout: 'none' },
        defaultSort: {
          type: 'string',
          title: 'Tri par défaut',
          description: "Ce tri sera appliqué par défaut lorsque l'utilisateur arrive sur la page. Lorsqu'il commence une recherche, le tri par pertinence sera appliqué.",
          default: 'createdAt:-1',
          oneOf: [
            { const: 'createdAt:-1', title: 'Date de création (du plus récent au plus ancien)' },
            { const: 'updatedAt:-1', title: 'Date de mise à jour (du plus récent au plus ancien)' },
            { const: 'title:1', title: 'Ordre alphabétique (A à Z)' }
          ]
        },
        columns: {
          type: 'integer',
          title: 'Nombre de colonnes',
          description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
          default: 2,
          minimum: 1,
          maximum: 3
        },
        applicationsCountPosition: {
          type: 'string',
          title: 'Position du nombre de résultats',
          default: 'top',
          oneOf: [
            { const: 'none', title: 'Aucun' },
            { const: 'top', title: 'Au dessus des filtres' }, // Used for compat with old portals
            { const: 'bottom', title: 'Au dessus des résultats' }
          ]
        },
        showSortBesideCount: {
          type: 'boolean',
          title: 'Afficher le tri à droite du nombre de résultats.',
          layout: {
            if: 'parent.data?.applicationsCountPosition === "bottom"',
            comp: 'switch'
          }
        },
        showAdvancedFilters: {
          type: 'boolean',
          title: 'Activer les filtres avancés',
          description: 'Mode de configuration avancé. Permet de configurer des blocs de pages personnalisés entre les filtres de base et les résultats.',
          layout: 'switch'
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
                  { const: 'base-application', title: 'Filtres par applications' },
                  { const: 'topics', title: 'Filtres par thématiques' },
                  { const: 'owners', title: 'Filtres par propriétaires' },
                  { const: 'sort', title: 'Tri' }
                ]
              }
            },
            density: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density'
            },
            rounded: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded'
            },
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
        // TODO: add static filters ?
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
    'element-applications-list': {
      type: 'object',
      title: 'ApplicationsListElement',
      'x-i18n-title': {
        en: 'Applications list',
        fr: 'Liste de visualisations'
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
            children: ['applications']
          },
          'columns',
          'mb',
          {
            title: 'Application Card',
            'x-i18n-title': {
              fr: "Vignette d'une visualisation"
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
        type: { const: 'applications-list' },
        uuid: { type: 'string', layout: 'none' },
        mode: {
          type: 'string',
          title: 'Type de liste',
          default: 'lastUpdated',
          oneOf: [
            { const: 'lastUpdated', title: 'Last updated', 'x-i18n-title': { fr: 'Les derniers modifiés' } },
            { const: 'lastCreated', title: 'Last created', 'x-i18n-title': { fr: 'Les derniers créés' } },
            { const: 'custom', title: 'Custom list', 'x-i18n-title': { fr: 'Liste libre' } }
          ]
        },
        applications: {
          type: 'array',
          title: 'Visualisations',
          description: 'Sélectionnez manuellement les visualisations à afficher.',
          layout: {
            getItems: {
              url: '/data-fair/api/v1/applications?mine=true&raw=true&select=id,title&size=20&sort=updatedAt:-1',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.id})`',
              itemKey: 'item.id'
            },
            props: {
              chips: true,
              closableChips: true,
              clearable: false
            }
          },
          items: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string' },
              title: { type: 'string' }
            }
          },
          maxItems: 20
        },
        columns: {
          type: 'integer',
          title: 'Nombre de colonnes',
          description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
          default: 3,
          minimum: 1,
          maximum: 3
        },
        limit: {
          type: 'integer',
          title: 'Nombre de visualisations',
          description: 'Nombre total de visualisations à afficher.',
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
        cardConfig: { $ref: 'https://github.com/data-fair/portals/common-application-card' },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-application': {
      type: 'object',
      title: 'ApplicationElement',
      'x-i18n-title': {
        en: 'Application',
        fr: 'Visualisation'
      },
      required: ['type', 'application'],
      properties: {
        type: { const: 'application' },
        uuid: { type: 'string', layout: 'none' },
        application: {
          type: 'object',
          title: 'Application',
          'x-i18n-title': {
            fr: 'Visualisations'
          },
          additionalProperties: false,
          required: ['id', 'title', 'slug'],
          layout: {
            getItems: {
              url: '/data-fair/api/v1/applications?mine=true&select=id,title,slug&size=20&sort=updatedAt:-1',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.id})`',
              itemKey: 'item.id'
            }
          },
          properties: {
            id: {
              type: 'string'
            },
            title: {
              type: 'string'
            },
            slug: {
              type: 'string'
            }
          }
        },
        syncParams: {
          type: 'string',
          title: "Synchronisation des paramètres d'URL",
          default: 'none',
          oneOf: [
            { const: 'none', title: 'Aucune synchronisation' },
            { const: 'sandboxed', title: 'Synchronisation cloisonnée' },
            { const: 'shared-filters', title: 'Synchronisation avec partage des filtres' }
          ]
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
  }
}
