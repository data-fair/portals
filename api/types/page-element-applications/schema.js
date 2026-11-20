import { inheritedStyleLayout } from '../common-defs/schema.ts'

/* eslint-disable no-template-curly-in-string */
const ownersGetItems = {
  url: '/data-fair/api/v1/applications?mine=true&size=0&facets=owner',
  itemsResults: "data.facets.owner.map(f => ({ id: `${f.value.type}:${f.value.id}:${f.value.department ?? '-'}`, title: f.value.departmentName ?? f.value.name }))",
  itemTitle: 'item.title',
  itemKey: 'item.id'
}

export const applicationsStaticFilters = {
  type: 'object',
  description: 'Restrict the applications displayed by the catalog. These filters are neither visible nor editable by visitors.',
  'x-i18n-description': { fr: 'Restreignent les visualisations affichées par le catalogue. Ces filtres ne sont ni visibles ni modifiables par les visiteurs.' },
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
          url: '/data-fair/api/v1/applications?mine=true&size=0&facets=topics',
          itemsResults: 'data.facets.topics.map(f => ({ id: f.value.id, title: f.value.title }))',
          itemTitle: 'item.title',
          itemKey: 'item.id'
        },
        props: { chips: true, closableChips: true }
      }
    },
    includedBaseApplications: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/staticFilterValues',
      title: 'Base applications to include',
      'x-i18n-title': { fr: 'Applications de base à inclure' },
      layout: {
        comp: 'autocomplete',
        getItems: {
          url: '/data-fair/api/v1/applications?mine=true&size=0&facets=base-application',
          itemsResults: "data.facets['base-application'].map(f => ({ id: f.value.url, title: f.value.title }))",
          itemTitle: 'item.title',
          itemKey: 'item.id'
        },
        props: { chips: true, closableChips: true }
      }
    }
  }
}

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
      layout: {
        children: [
          'type',
          'columns',
          'countPosition',
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
        type: { const: 'applications-catalog' },
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
            { const: 'updatedAt:-1', title: 'Update date (newest to oldest)', 'x-i18n-title': { fr: 'Date de mise à jour (du plus récent au plus ancien)' } },
            { const: 'title:1', title: 'Alphabetical order (A to Z)', 'x-i18n-title': { fr: 'Ordre alphabétique (A à Z)' } }
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
        staticFilters: applicationsStaticFilters,
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
                  { const: 'base-application', title: 'Filters by base application', 'x-i18n-title': { fr: 'Filtres par applications de base' } },
                  { const: 'topics', title: 'Filters by topic', 'x-i18n-title': { fr: 'Filtres par thématiques' } },
                  { const: 'owners', title: 'Filters by owner', 'x-i18n-title': { fr: 'Filtres par propriétaires' } },
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
          title: 'Applications catalog pagination',
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
            title: 'Application card',
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
          title: 'List type',
          'x-i18n-title': { fr: 'Type de liste' },
          default: 'lastUpdated',
          oneOf: [
            { const: 'lastUpdated', title: 'Last updated', 'x-i18n-title': { fr: 'Les derniers modifiés' } },
            { const: 'lastCreated', title: 'Last created', 'x-i18n-title': { fr: 'Les derniers créés' } },
            { const: 'custom', title: 'Custom list', 'x-i18n-title': { fr: 'Liste libre' } }
          ]
        },
        applications: {
          type: 'array',
          title: 'Applications',
          'x-i18n-title': { fr: 'Visualisations' },
          description: 'Manually select the applications to display.',
          'x-i18n-description': { fr: 'Sélectionnez manuellement les visualisations à afficher.' },
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
          title: 'Number of columns',
          'x-i18n-title': { fr: 'Nombre de colonnes' },
          description: 'Number of columns used on large screens. The number of columns is reduced on smaller screens.',
          'x-i18n-description': { fr: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.' },
          default: 3,
          minimum: 1,
          maximum: 3
        },
        limit: {
          type: 'integer',
          title: 'Number of applications',
          'x-i18n-title': { fr: 'Nombre de visualisations' },
          description: 'Total number of applications to display.',
          'x-i18n-description': { fr: 'Nombre total de visualisations à afficher.' },
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
        displayMode: {
          type: 'string',
          title: 'Display mode',
          'x-i18n-title': { fr: "Mode d'affichage" },
          default: 'auto-resize',
          description: [
            'Resizing mode of the application:',
            '- **Optimal height** - The application can resize itself to take the height it needs. Some applications, such as maps, will behave like the **Aspect ratio** mode. This mode avoids a scrollbar for applications that take a lot of height.',
            '- **Aspect ratio** - Width / height ratio automatically adapted to the screen width, or set to a constant value.',
            '- **Fixed height (px)** - You set the height of the application yourself, not recommended for display on all screen sizes.'
          ].join('\n'),
          'x-i18n-description': {
            fr: [
              'Mode de redimensionnement de la visualisation :',
              "- **Hauteur optimale** - La visualisation peut se redimensionner pour prendre la hauteur dont elle a besoin. Certaines visualisations comme des cartes se comporteront comme le mode **Aspect ratio**. Ce mode évite d'avoir une barre de scroll pour les visualisations qui prennent beaucoup de hauteur.",
              "- **Aspect ratio** - Ratio largeur / hauteur adapté automatiquement à la largeur de l'écran, ou fixé à une valeur constante.",
              "- **Hauteur fixe (px)** - Vous définissez vous-même la hauteur de la visualisation, peu recommandé pour un affichage sur toute taille d'écran."
            ].join('\n')
          },
          oneOf: [
            { const: 'auto-resize', title: 'Optimal height', 'x-i18n-title': { fr: 'Hauteur optimale' } },
            { const: 'aspect-ratio', title: 'Aspect ratio' },
            { const: 'fixed-height', title: 'Fixed height (px)', 'x-i18n-title': { fr: 'Hauteur fixe (px)' } }
          ]
        },
        ratio: {
          type: 'string',
          title: 'Ratio (width / height)',
          'x-i18n-title': { fr: 'Ratio (largeur / hauteur)' },
          default: 'auto',
          layout: {
            if: 'parent.data?.displayMode === "aspect-ratio"',
            comp: 'combobox',
            items: [
              { value: 'auto', title: 'Auto (Responsive)' },
              '16/9',
              '4/3',
              '1/1',
              '3/2',
              '21/9'
            ]
          }
        },
        maxHeight: {
          type: 'integer',
          title: 'Maximum height (px)',
          'x-i18n-title': { fr: 'Hauteur maximale (px)' },
          minimum: 100,
          layout: {
            if: 'parent.data?.displayMode === "aspect-ratio" && !!parent.data?.ratio && parent.data?.ratio !== "auto"'
          }
        },
        height: {
          type: 'integer',
          title: 'Height (px)',
          'x-i18n-title': { fr: 'Hauteur (px)' },
          default: 500,
          minimum: 150,
          layout: {
            if: 'parent.data?.displayMode === "fixed-height"',
            slots: {
              after: {
                markdown: '**⚠️ Warning:** a fixed height is not recommended. On small screens (phones, tablets), the display can be difficult. Prefer "Optimal height" or "Aspect ratio" for a responsive layout.',
                'x-i18n-markdown': { fr: "**⚠️ Attention :** une hauteur fixe est déconseillée. Sur les petites résolutions (mobiles, tablettes), l'affichage peut être difficile. Préférez « Hauteur optimale » ou « Aspect ratio » pour un rendu responsive." }
              }
            }
          }
        },
        syncParams: {
          type: 'string',
          title: 'URL parameter synchronization',
          'x-i18n-title': { fr: "Synchronisation des paramètres d'URL" },
          description: [
            'Synchronization of the URL parameters between the application and the page:',
            '- **No synchronization** - The filters and parameters of the application are not reflected in the page URL.',
            '- **Sandboxed synchronization** - The parameters of the application are kept in the URL with a prefix specific to this block, without interfering with the other applications of the page.',
            '- **Synchronization with shared filters** - The application shares the filters (concepts `_c` and datasets `_d`) with the other blocks of the page.'
          ].join('\n'),
          'x-i18n-description': {
            fr: [
              "Synchronisation des paramètres d'URL entre la visualisation et la page :",
              "- **Aucune synchronisation** - Les filtres et paramètres de la visualisation ne sont pas reflétés dans l'URL de la page.",
              "- **Synchronisation cloisonnée** - Les paramètres de la visualisation sont conservés dans l'URL avec un préfixe propre à ce bloc, sans interférer avec les autres visualisations de la page.",
              '- **Synchronisation avec partage des filtres** - La visualisation partage les filtres (concepts `_c` et jeux de données `_d`) avec les autres blocs de la page.'
            ].join('\n')
          },
          default: 'none',
          oneOf: [
            { const: 'none', title: 'No synchronization', 'x-i18n-title': { fr: 'Aucune synchronisation' } },
            { const: 'sandboxed', title: 'Sandboxed synchronization', 'x-i18n-title': { fr: 'Synchronisation cloisonnée' } },
            { const: 'shared-filters', title: 'Synchronization with shared filters', 'x-i18n-title': { fr: 'Synchronisation avec partage des filtres' } }
          ]
        },
        staticFilters: {
          type: 'array',
          title: 'Default filters',
          'x-i18n-title': { fr: 'Filtres par défaut' },
          description: [
            'Filters passed to the application on load, without appearing in the page URL. The visitor can change them if the application allows it.',
            '- **Concept** - `_c_<concept>_<operator>`, for example `_c_commune_eq`',
            '- **Column** - `_d_<dataset id>_<column>_<operator>`, for example `_d_my-dataset_year_gte`',
            '- **Colors** - `_t_primary` or `_t_secondary`, for example `#1E88E5`, replace the portal colors in this application only.',
            '',
            'Operators: `eq`, `neq`, `in`, `nin` (comma-separated values), `lt`, `lte`, `gt`, `gte`, `starts`, `exists`, `nexists`, `contains`, `search`.'
          ].join('\n'),
          'x-i18n-description': {
            fr: [
              "Filtres transmis à la visualisation au chargement, sans apparaître dans l'URL de la page. Le visiteur peut les modifier si la visualisation le permet.",
              '- **Concept** - `_c_<concept>_<opérateur>`, par exemple `_c_commune_eq`',
              '- **Colonne** - `_d_<id du jeu de données>_<colonne>_<opérateur>`, par exemple `_d_mon-jdd_annee_gte`',
              '- **Couleurs** - `_t_primary` ou `_t_secondary`, par exemple `#1E88E5`, remplacent les couleurs du portail dans cette visualisation uniquement.',
              '',
              'Opérateurs : `eq`, `neq`, `in`, `nin` (valeurs séparées par des virgules), `lt`, `lte`, `gt`, `gte`, `starts`, `exists`, `nexists`, `contains`, `search`.'
            ].join('\n')
          },
          layout: {
            messages: { addItem: 'Add a filter', 'x-i18n-addItem': { fr: 'Ajouter un filtre' } },
            listEditMode: 'inline'
          },
          items: {
            type: 'object',
            required: ['key', 'value'],
            properties: {
              key: {
                type: 'string',
                title: 'Parameter',
                'x-i18n-title': { fr: 'Paramètre' },
                pattern: '^(_(c|d|id)_|_t_(primary|secondary)$)',
                errorMessage: 'The parameter must start with _c_, _d_ or _id_, or be _t_primary or _t_secondary',
                'x-i18n-errorMessage': { fr: 'Le paramètre doit commencer par _c_, _d_ ou _id_, ou être _t_primary ou _t_secondary' }
              },
              value: {
                type: 'string',
                title: 'Value',
                'x-i18n-title': { fr: 'Valeur' }
              }
            },
            // simple-directory rejects any other color value, the visualization would lose its theme
            if: { required: ['key'], properties: { key: { pattern: '^_t_' } } },
            then: {
              properties: {
                value: {
                  pattern: '^#?[0-9a-fA-F]{6}$',
                  errorMessage: 'Expected a hexadecimal color without transparency, for example #1E88E5',
                  'x-i18n-errorMessage': { fr: 'Couleur hexadécimale sans transparence attendue, par exemple #1E88E5' }
                }
              }
            }
          }
        },
        actionButtons: {
          type: 'object',
          title: 'Application action buttons',
          'x-i18n-title': { fr: "Boutons d'actions", en: 'Action buttons' },
          layout: 'card',
          properties: {
            items: {
              type: 'array',
              title: 'Buttons to display',
              'x-i18n-title': { fr: 'Boutons à afficher' },
              items: {
                type: 'string',
                oneOf: [
                  { const: 'fullscreen', title: 'Fullscreen', 'x-i18n-title': { fr: 'Plein écran' } },
                  { const: 'capture', title: 'Capture' },
                  { const: 'embed', title: 'Embed', 'x-i18n-title': { fr: 'Intégration' } },
                  { const: 'datasets', title: 'Data sources', 'x-i18n-title': { fr: 'Sources de données' } }
                ]
              }
            },
            style: {
              type: 'string',
              title: 'Style',
              default: 'full',
              layout: { if: 'parent.data?.items?.length > 0', cols: { md: 4 } },
              oneOf: [
                { const: 'icon', title: 'Icon only', 'x-i18n-title': { fr: 'Icône seulement' } },
                { const: 'full', title: 'Icon and text', 'x-i18n-title': { fr: 'Icône et texte' } },
                { const: 'text', title: 'Text only', 'x-i18n-title': { fr: 'Texte seulement' } }
              ]
            },
            position: {
              type: 'string',
              title: 'Position',
              default: 'top',
              layout: { if: 'parent.data?.items?.length > 0', cols: { md: 4 } },
              oneOf: [
                { const: 'top', title: 'Above the application', 'x-i18n-title': { fr: 'Au-dessus de la visualisation' } },
                { const: 'bottom', title: 'Below the application', 'x-i18n-title': { fr: 'En dessous de la visualisation' } }
              ]
            },
            alignment: {
              type: 'string',
              title: 'Alignment',
              'x-i18n-title': { fr: 'Alignement' },
              default: 'start',
              layout: { if: 'parent.data?.items?.length > 0', cols: { md: 4 } },
              oneOf: [
                { const: 'start', title: 'Left', 'x-i18n-title': { fr: 'Gauche' } },
                { const: 'center', title: 'Centered', 'x-i18n-title': { fr: 'Centré' } },
                { const: 'end', title: 'Right', 'x-i18n-title': { fr: 'Droite' } }
              ]
            }
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
  }
}
