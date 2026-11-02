/* eslint-disable no-template-curly-in-string */
export default {
  $id: 'https://github.com/data-fair/portals/page-element-news',
  'x-exports': [],
  $defs: {
    'element-news-catalog': {
      title: 'NewsCatalogElement',
      'x-i18n-title': {
        en: 'News catalog',
        fr: "Catalogue d'actualités"
      },
      type: 'object',
      unevaluatedProperties: false,
      required: ['type'],
      properties: {
        type: { const: 'news-catalog' },
        uuid: { type: 'string', layout: 'none' },
        defaultSort: {
          type: 'string',
          title: 'Default sort',
          'x-i18n-title': { fr: 'Tri par défaut' },
          description: 'This sort is applied by default when the user arrives on the page.',
          'x-i18n-description': { fr: "Ce tri sera appliqué par défaut lorsque l'utilisateur arrive sur la page." },
          default: 'date:-1',
          oneOf: [
            { const: 'date:-1', title: 'Date (newest to oldest)', 'x-i18n-title': { fr: 'Date (du plus récent au plus ancien)' } },
            { const: 'date:1', title: 'Date (oldest to newest)', 'x-i18n-title': { fr: 'Date (du plus ancien au plus récent)' } },
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
          title: 'News catalog filters',
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
          title: 'News catalog pagination',
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
    'element-news-list': {
      type: 'object',
      title: 'NewsListElement',
      'x-i18n-title': {
        en: 'News list',
        fr: "Liste d'actualités"
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
            children: ['news']
          },
          'columns',
          'mb',
          {
            title: 'News cards',
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
        type: { const: 'news-list' },
        uuid: { type: 'string', layout: 'none' },
        mode: {
          type: 'string',
          title: 'List type',
          'x-i18n-title': { fr: 'Type de liste' },
          default: 'upcoming',
          oneOf: [
            { const: 'upcoming', title: 'Latest', 'x-i18n-title': { fr: 'Les plus récentes' } },
            { const: 'custom', title: 'Custom list', 'x-i18n-title': { fr: 'Liste libre' } }
          ]
        },
        news: {
          type: 'array',
          title: 'News',
          'x-i18n-title': { fr: 'Actualités' },
          description: 'Manually select the news items to display.',
          'x-i18n-description': { fr: 'Sélectionnez manuellement les actualités à afficher.' },
          layout: {
            getItems: {
              url: '/portals-manager/api/pages?type=news&select=title,config.newsMetadata.slug&size=20',
              qSearchParam: 'q',
              itemsResults: 'data.results?.map(item => ({ title: item.title, slug: item.config?.newsMetadata?.slug })) ?? []',
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
          title: 'Number of news items',
          'x-i18n-title': { fr: "Nombre d'actualités" },
          description: 'Total number of news items to display.',
          'x-i18n-description': { fr: "Nombre total d'actualités à afficher." },
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
        cardConfig: { $ref: 'https://github.com/data-fair/portals/common-news-card' },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-news-card': {
      type: 'object',
      title: 'NewsCardElement',
      'x-i18n-title': {
        en: 'News card',
        fr: "Vignette d'actualité"
      },
      layout: {
        children: [
          'type',
          'news',
          'mb',
          {
            title: 'News card',
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
      required: ['type', 'news', 'usePortalConfig'],
      properties: {
        type: { const: 'news-card' },
        uuid: { type: 'string', layout: 'none' },
        news: {
          type: 'object',
          title: 'Selected news item',
          'x-i18n-title': { fr: 'Actualité', en: 'News item' },
          additionalProperties: false,
          required: ['slug'],
          layout: {
            getItems: {
              url: '/portals-manager/api/pages?type=news&select=title,config.newsMetadata.slug&size=20',
              qSearchParam: 'q',
              itemsResults: 'data.results?.map(item => ({ title: item.title, slug: item.config?.newsMetadata?.slug })) ?? []',
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
        cardConfig: { $ref: 'https://github.com/data-fair/portals/common-news-card' },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    }
  }
}
