import { inheritedStyleLayout } from '../common-defs/schema.ts'

/* eslint-disable no-template-curly-in-string */
const ownersGetItems = {
  url: '/data-fair/api/v1/datasets?mine=true&size=0&facets=owner',
  itemsResults: "data.facets.owner.map(f => ({ id: `${f.value.type}:${f.value.id}:${f.value.department ?? '-'}`, title: f.value.departmentName ?? f.value.name }))",
  itemTitle: 'item.title',
  itemKey: 'item.id'
}

export const datasetsStaticFilters = {
  type: 'object',
  description: 'Restrict the datasets displayed by the catalog. These filters are neither visible nor editable by visitors.',
  'x-i18n-description': { fr: 'Restreignent les jeux de données affichés par le catalogue. Ces filtres ne sont ni visibles ni modifiables par les visiteurs.' },
  properties: {
    includedOwners: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/staticFilterValues',
      title: 'Owners to include',
      'x-i18n-title': { fr: 'Propriétaires à inclure' },
      layout: {
        comp: 'autocomplete',
        cols: { md: 6 },
        getItems: ownersGetItems,
        props: { chips: true, closableChips: true }
      }
    },
    excludedOwners: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/staticFilterValues',
      title: 'Owners to exclude',
      'x-i18n-title': { fr: 'Propriétaires à exclure' },
      layout: {
        comp: 'autocomplete',
        cols: { md: 6 },
        getItems: ownersGetItems,
        props: { chips: true, closableChips: true }
      }
    },
    includedTopics: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/staticFilterValues',
      title: 'Topics to include',
      'x-i18n-title': { fr: 'Thématiques à inclure' },
      layout: {
        comp: 'autocomplete',
        getItems: {
          url: '/data-fair/api/v1/datasets?mine=true&size=0&facets=topics',
          itemsResults: 'data.facets.topics.map(f => ({ id: f.value.id, title: f.value.title }))',
          itemTitle: 'item.title',
          itemKey: 'item.id'
        },
        props: { chips: true, closableChips: true }
      }
    },
    includedConcepts: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/staticFilterValues',
      title: 'Concepts to include',
      'x-i18n-title': { fr: 'Concepts à inclure' },
      layout: {
        comp: 'autocomplete',
        getItems: {
          url: '/data-fair/api/v1/vocabulary',
          itemsResults: 'data.map(c => ({ id: c.identifiers[0], title: c.title }))',
          itemTitle: 'item.title',
          itemKey: 'item.id'
        },
        props: { chips: true, closableChips: true }
      }
    },
    includedKeywords: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/staticFilterValues',
      title: 'Keywords to include',
      'x-i18n-title': { fr: 'Mots-clés à inclure' },
      layout: {
        comp: 'autocomplete',
        getItems: {
          url: '/data-fair/api/v1/datasets?mine=true&size=0&facets=keywords',
          itemsResults: 'data.facets.keywords.map(f => ({ id: f.value, title: f.value }))',
          itemTitle: 'item.title',
          itemKey: 'item.id'
        },
        props: { chips: true, closableChips: true }
      }
    },
    types: {
      type: 'array',
      title: 'Dataset types to include',
      'x-i18n-title': { fr: 'Types de jeux de données à inclure' },
      items: {
        type: 'string',
        oneOf: [
          { const: 'file', title: 'File', 'x-i18n-title': { fr: 'Fichier' } },
          { const: 'rest', title: 'Editable', 'x-i18n-title': { fr: 'Éditable' } },
          { const: 'virtual', title: 'Virtual', 'x-i18n-title': { fr: 'Virtuel' } },
          { const: 'metaOnly', title: 'Metadata only', 'x-i18n-title': { fr: 'Métadonnées seules' } }
        ]
      }
    }
  }
}

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
      layout: {
        children: [
          'type',
          'columns',
          'countPosition',
          'showApiButton',
          'showSortBesideCount',
          {
            title: 'Static filters',
            'x-i18n-title': { fr: 'Filtres statiques' },
            comp: 'card',
            children: ['defaultSort', 'staticFilters']
          },
          {
            title: 'Dynamic filters',
            'x-i18n-title': { fr: 'Filtres dynamiques' },
            comp: 'card',
            children: ['filters', 'showAdvancedFilters']
          },
          'pagination',
          'advancedFilters',
          'mb'
        ]
      },
      properties: {
        type: { const: 'datasets-catalog' },
        uuid: { type: 'string', layout: 'none' },
        defaultSort: {
          type: 'string',
          title: 'Default sort',
          'x-i18n-title': { fr: 'Tri par défaut' },
          description: 'This sort is applied by default when the user arrives on the page. When they start a search, sorting by relevance is applied.',
          'x-i18n-description': { fr: "Ce tri sera appliqué par défaut lorsque l'utilisateur arrive sur la page. Lorsqu'il commence une recherche, le tri par pertinence sera appliqué." },
          default: 'createdAt:-1',
          oneOf: [
            { const: 'createdAt:-1', title: 'Creation date (newest to oldest)', 'x-i18n-title': { fr: 'Date de création (du plus récent au plus ancien)' } },
            { const: 'modified:-1', title: 'Update date (newest to oldest)', 'x-i18n-title': { fr: 'Date de mise à jour (du plus récent au plus ancien)' } },
            { const: 'title:1', title: 'Alphabetical order (A to Z)', 'x-i18n-title': { fr: 'Ordre alphabétique (A à Z)' } },
            { const: 'owner.departmentName:1', title: 'Owner', 'x-i18n-title': { fr: 'Propriétaire' } }
          ]
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
            { const: 'top', title: 'Above the filters', 'x-i18n-title': { fr: 'Au-dessus des filtres' } }, // Used for compat with old portals
            { const: 'bottom', title: 'Above the results', 'x-i18n-title': { fr: 'Au-dessus des résultats' } }
          ]
        },
        // Used for compat with old portals
        showApiButton: {
          type: 'boolean',
          title: 'Show the API documentation button',
          'x-i18n-title': { fr: "Afficher le bouton d'accès à la documentation API" },
          description: 'Shows a button next to the results count giving access to the API documentation **(desktop only)**.',
          'x-i18n-description': { fr: "Affiche un bouton à côté du nombre de résultats permettant d'accéder à la documentation de l'API **(Seulement sur desktop)**." },
          layout: 'switch',
          default: true
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
          layout: 'switch'
        },
        staticFilters: datasetsStaticFilters,
        filters: {
          type: 'object',
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
                  { const: 'concepts', title: 'Filters by concept', 'x-i18n-title': { fr: 'Filtres par concepts' } },
                  { const: 'topics', title: 'Filters by topic', 'x-i18n-title': { fr: 'Filtres par thématiques' } },
                  { const: 'keywords', title: 'Filters by keyword', 'x-i18n-title': { fr: 'Filtres par mots-clés' } },
                  { const: 'owners', title: 'Filters by owner', 'x-i18n-title': { fr: 'Filtres par propriétaires' } },
                  { const: 'queryable', title: 'Filter "Data available"', 'x-i18n-title': { fr: 'Filtre « Données disponibles »' } },
                  { const: 'sort', title: 'Sort', 'x-i18n-title': { fr: 'Tri' } }
                ]
              }
            },
            density: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density',
              layout: { ...inheritedStyleLayout }
            },
            rounded: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
              layout: { ...inheritedStyleLayout }
            },
          }
        },
        pagination: {
          type: 'object',
          title: 'Datasets catalog pagination',
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
            title: 'Dataset cards',
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
      required: ['type', 'columns', 'limit', 'usePortalConfig'],
      properties: {
        type: { const: 'datasets-list' },
        uuid: { type: 'string', layout: 'none' },
        mode: {
          type: 'string',
          title: 'List type',
          'x-i18n-title': { fr: 'Type de liste' },
          default: 'lastUpdated',
          oneOf: [
            { const: 'lastUpdated', title: 'Last updated', 'x-i18n-title': { fr: 'Les derniers modifiés' } },
            { const: 'lastCreated', title: 'Last created', 'x-i18n-title': { fr: 'Les derniers créés' } },
            { const: 'custom', title: 'Custom list', 'x-i18n-title': { fr: 'Liste libre' } }
          ]
        },
        limit: {
          type: 'integer',
          title: 'Number of datasets',
          'x-i18n-title': { fr: 'Nombre de jeux de données' },
          default: 3,
          minimum: 1,
          maximum: 12
        },
        datasets: {
          type: 'array',
          title: 'Datasets',
          'x-i18n-title': { fr: 'Jeux de données' },
          description: 'Manually select the datasets to display.',
          'x-i18n-description': { fr: 'Sélectionnez manuellement les jeux de données à afficher.' },
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
          title: 'Number of columns',
          'x-i18n-title': { fr: 'Nombre de colonnes' },
          description: 'Number of columns used on large screens. The number of columns is reduced on smaller screens.',
          'x-i18n-description': { fr: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.' },
          default: 3,
          minimum: 1,
          maximum: 3
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Use the portal configuration',
          'x-i18n-title': { fr: 'Utiliser la configuration du portail' },
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
            title: 'Dataset card',
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
      required: ['type', 'dataset', 'usePortalConfig'],
      properties: {
        type: { const: 'dataset-card' },
        uuid: { type: 'string', layout: 'none' },
        dataset: {
          type: 'object',
          title: 'Selected dataset',
          'x-i18n-title': { fr: 'Jeu de données', en: 'Dataset' },
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
          title: 'Use the portal configuration',
          'x-i18n-title': { fr: 'Utiliser la configuration du portail' },
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
          title: 'Selected dataset',
          'x-i18n-title': { fr: 'Jeu de données', en: 'Dataset' },
          additionalProperties: false,
          required: ['id'],
          layout: {
            getItems: {
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&select=id,title,isRest&size=20&sort=updatedAt:-1',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.id})`',
              itemKey: 'item.id'
            }
          },
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            href: { type: 'string' },
            isRest: { type: 'boolean' }
          }
        },
        syncParams: {
          type: 'string',
          title: 'URL parameter synchronization',
          'x-i18n-title': { fr: "Synchronisation des paramètres d'URL" },
          default: 'none',
          oneOf: [
            { const: 'none', title: 'No synchronization', 'x-i18n-title': { fr: 'Aucune synchronisation' } },
            { const: 'sandboxed', title: 'Sandboxed synchronization', 'x-i18n-title': { fr: 'Synchronisation cloisonnée' } },
            { const: 'shared-filters', title: 'Synchronization with shared filters', 'x-i18n-title': { fr: 'Synchronisation avec partage des filtres' } }
          ]
        },
        display: {
          type: 'string',
          title: 'Default display mode',
          'x-i18n-title': { fr: "Mode d'affichage par défaut" },
          description: 'The end user can change the display mode unless interactions are disabled.',
          'x-i18n-description': { fr: "L'utilisateur final peut modifier le mode d'affichage sauf si les interactions sont désactivées." },
          oneOf: [
            {
              const: 'table',
              title: 'Table'
            },
            {
              const: 'table-dense',
              title: 'Dense table',
              'x-i18n-title': { fr: 'Table dense' }
            },
            {
              const: 'list',
              title: 'Card list',
              'x-i18n-title': { fr: 'Liste de vignettes' }
            }
          ]
        },
        cols: {
          title: 'Columns visible by default',
          'x-i18n-title': { fr: 'Colonnes visibles par défaut' },
          description: 'If no column is selected, all columns are displayed by default. The end user can change the visible columns unless interactions are disabled.',
          'x-i18n-description': { fr: "Si aucune colonne n'est sélectionnée, toutes les colonnes seront affichées par défaut. L'utilisateur final peut modifier les colonnes visibles sauf si les interactions sont désactivées." },
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
          title: 'Allow interactions',
          'x-i18n-title': { fr: 'Autoriser les interactions' },
          description: 'Allows sorting, searching, filtering,...',
          'x-i18n-description': { fr: 'Autorise le tri, la recherche, les filtres,...' },
          type: 'boolean'
        },
        editable: {
          title: 'Editable table',
          'x-i18n-title': { fr: 'Tableau éditable' },
          description: 'Allows authorized users to edit the data directly in the table. Other visitors keep the read-only view.',
          'x-i18n-description': { fr: "Permet aux utilisateurs autorisés d'éditer les données directement dans le tableau. Les autres visiteurs conservent la vue en lecture seule." },
          type: 'boolean',
          layout: { if: 'parent.data?.dataset?.isRest && parent.data?.interactions' }
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
          title: 'Selected dataset',
          'x-i18n-title': { fr: 'Jeu de données', en: 'Dataset' },
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
          title: 'Selected dataset',
          'x-i18n-title': { fr: 'Jeu de données', en: 'Dataset' },
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
