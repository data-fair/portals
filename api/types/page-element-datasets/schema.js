/* eslint-disable no-template-curly-in-string */
export default {
  $id: 'https://github.com/data-fair/portals/page-element-datasets',
  'x-exports': [],
  $defs: {
    'element-datasets-catalog': {
      title: 'DatasetsCatalogElement',
      'x-i18n-title': {
        en: 'Datasets catalog',
        fr: 'Catalogue de données'
      },
      type: 'object',
      unevaluatedProperties: false,
      required: ['type'],
      properties: {
        type: { const: 'datasets-catalog' },
        defaultSort: {
          type: 'string',
          title: 'Tri par défaut',
          description: "Ce tri sera appliqué par défaut lorsque l'utilisateur arrive sur la page. Lorsqu'il commence une recherche, le tri par pertinence sera appliqué.",
          default: 'createdAt:-1',
          oneOf: [
            { const: 'createdAt:-1', title: 'Date de création (du plus récent au plus ancien)' },
            { const: 'dataUpdatedAt:-1', title: 'Date de mise à jour (du plus récent au plus ancien)' },
            { const: 'title:1', title: 'Ordre alphabétique (A à Z)' },
            { const: 'owner.departmentName:1', title: 'Propriétaire' }
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
        countPosition: {
          type: 'string',
          title: 'Position du nombre de résultats',
          default: 'top',
          oneOf: [
            { const: 'none', title: 'Aucun' },
            { const: 'top', title: 'Au dessus des filtres' }, // Used for compat with old portals
            { const: 'bottom', title: 'Au dessus des résultats' }
          ]
        },
        // Used for compat with old portals
        showApiButton: {
          type: 'boolean',
          title: 'Afficher le bouton d\'accès à la documentation API',
          description: 'Affiche un bouton à coté du nombre de résultats permettant d\'accéder à la documentation de l\'API **(Seulement sur desktop)**.',
          layout: 'switch',
          default: true
        },
        showSortBesideCount: {
          type: 'boolean',
          title: 'Afficher le tri à droite du nombre de résultats.',
          layout: {
            if: 'parent.data?.countPosition === "bottom"',
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
                  { const: 'concepts', title: 'Filtres par concepts' },
                  { const: 'topics', title: 'Filtres par thématiques' },
                  { const: 'keywords', title: 'Filtres par mots-clés' },
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
    'element-datasets-list': {
      type: 'object',
      title: 'DatasetsListElement',
      'x-i18n-title': {
        en: 'Datasets list',
        fr: 'Liste de jeux de données'
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
            children: ['datasets']
          },
          'columns',
          'mb',
          {
            title: 'Dataset Card',
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
      required: ['type', 'columns', 'limit', 'usePortalConfig'],
      properties: {
        type: { const: 'datasets-list' },
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
        limit: {
          type: 'integer',
          title: 'Nombre de jeux de données',
          default: 3,
          minimum: 1,
          maximum: 12
        },
        datasets: {
          type: 'array',
          title: 'Jeux de données',
          description: 'Sélectionnez manuellement les jeux de données à afficher.',
          layout: {
            getItems: {
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&select=id,title&size=20&sort=updatedAt:-1',
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
          maxItems: 100
        },
        columns: {
          type: 'integer',
          title: 'Nombre de colonnes',
          description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
          default: 3,
          minimum: 1,
          maximum: 3
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Utiliser la configuration du portail',
          layout: 'switch',
          default: true
        },
        cardConfig: {
          $ref: 'https://github.com/data-fair/portals/common-dataset-card'
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-dataset-card': {
      type: 'object',
      title: 'DatasetCardElement',
      'x-i18n-title': {
        en: 'Dataset card',
        fr: "Vignette d'un jeu de données"
      },
      layout: {
        children: [
          'type',
          'dataset',
          'mb',
          {
            title: 'Dataset Card',
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
      required: ['type', 'dataset', 'usePortalConfig'],
      properties: {
        type: { const: 'dataset-card' },
        uuid: { type: 'string', layout: 'none' },
        dataset: {
          type: 'object',
          title: 'Jeu de données',
          additionalProperties: false,
          required: ['id'],
          layout: {
            getItems: {
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&select=id,title&size=20&sort=updatedAt:-1',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.id})`',
              itemKey: 'item.id'
            }
          },
          properties: {
            id: { type: 'string' },
            title: { type: 'string' }
          }
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Utiliser la configuration du portail',
          layout: 'switch',
          default: true
        },
        cardConfig: {
          $ref: 'https://github.com/data-fair/portals/common-dataset-card'
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-dataset-table': {
      type: 'object',
      title: 'Dataset table',
      'x-i18n-title': {
        fr: "Tableau d'un jeu de données"
      },
      required: ['type', 'dataset', 'interactions'],
      properties: {
        type: { const: 'dataset-table' },
        uuid: { type: 'string', layout: 'none' },
        dataset: {
          type: 'object',
          title: 'Jeu de données',
          additionalProperties: false,
          required: ['id'],
          layout: {
            getItems: {
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&select=id,title&size=20&sort=updatedAt:-1',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.id})`',
              itemKey: 'item.id'
            }
          },
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            href: { type: 'string' }
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
        display: {
          type: 'string',
          title: "Mode d'affichage par défaut",
          description: "L'utilisateur final peut modifier le mode d'affichage sauf si les interactions sont désactivées.",
          oneOf: [
            {
              const: 'table',
              title: 'Table'
            },
            {
              const: 'table-dense',
              title: 'Table dense'
            },
            {
              const: 'list',
              title: 'Liste de vignettes'
            }
          ]
        },
        cols: {
          title: 'Colonnes visibles par défaut',
          description: "Si aucune colonne n'est sélectionnée, toutes les colonnes seront affichées par défaut. L'utilisateur final peut modifier les colonnes visibles sauf si les interactions sont désactivées.",
          type: 'array',
          layout: {
            getItems: {
              url: '/data-fair/api/v1/datasets/${parent.data.dataset.id}/schema?calculated=false',
              itemTitle: 'item.label',
              itemValue: 'item.key'
            }
          },
          items: { type: 'string' }
        },
        interactions: {
          title: 'Autoriser les interactions',
          description: 'Autorise le tri, la recherche, les filtres,...',
          type: 'boolean',
          default: true
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-dataset-form': {
      type: 'object',
      title: 'Dataset form',
      'x-i18n-title': {
        fr: "Formulaire d'un jeu de données"
      },
      required: ['type', 'dataset'],
      properties: {
        type: { const: 'dataset-form' },
        uuid: { type: 'string', layout: 'none' },
        dataset: {
          type: 'object',
          title: 'Jeu de données',
          additionalProperties: false,
          required: ['id'],
          layout: {
            getItems: {
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&rest=true&status=finalized&select=id,title&size=20&sort=updatedAt:-1',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.id})`',
              itemKey: 'item.id'
            }
          },
          properties: {
            id: { type: 'string' },
            title: { type: 'string' }
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },

    'element-dataset-download': {
      type: 'object',
      title: 'DatasetDownloadElement',
      'x-i18n-title': {
        en: 'Dataset download',
        fr: 'Téléchargement d\'un jeu de données'
      },
      required: ['type', 'dataset'],
      properties: {
        type: { const: 'dataset-download' },
        uuid: { type: 'string', layout: 'none' },
        dataset: {
          type: 'object',
          title: 'Jeu de données',
          additionalProperties: false,
          required: ['id'],
          layout: {
            getItems: {
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&select=id,title&size=20&sort=updatedAt:-1',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.id})`',
              itemKey: 'item.id'
            }
          },
          properties: {
            id: { type: 'string' },
            title: { type: 'string' }
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
  }
}
