/* eslint-disable no-template-curly-in-string */
export default {
  $id: 'https://github.com/data-fair/portals/page-element-reuses',
  'x-exports': [],
  $defs: {
    'element-reuses-catalog': {
      title: 'ReusesCatalogElement',
      'x-i18n-title': {
        en: 'Reuses catalog',
        fr: 'Catalogue de réutilisations'
      },
      type: 'object',
      unevaluatedProperties: false,
      required: ['type'],
      properties: {
        type: { const: 'reuses-catalog' },
        uuid: { type: 'string', layout: 'none' },
        defaultSort: {
          type: 'string',
          title: 'Tri par défaut',
          description: "Ce tri sera appliqué par défaut lorsque l'utilisateur arrive sur la page.",
          default: 'updatedAt:-1',
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
        reusesCountPosition: {
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
            if: 'parent.data?.reusesCountPosition === "bottom"',
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
                  { const: 'sort', title: 'Tri' }
                ]
              }
            },
            density: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density' },
            rounded: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded' }
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
    'element-reuses-list': {
      type: 'object',
      title: 'ReusesListElement',
      'x-i18n-title': {
        en: 'Reuses list',
        fr: 'Liste de réutilisations'
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
            children: ['reuses']
          },
          'columns',
          'mb',
          {
            title: 'Reuse Card',
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
        type: { const: 'reuses-list' },
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
        reuses: {
          type: 'array',
          title: 'Réutilisations',
          description: 'Sélectionnez manuellement les réutilisations à afficher.',
          layout: {
            getItems: {
              url: '/portals-manager/api/reuses?select=slug,title&size=20',
              qSearchParam: 'q',
              itemsResults: 'data.results',
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
          title: 'Nombre de réutilisations',
          description: 'Nombre total de réutilisations à afficher.',
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
        cardConfig: { $ref: 'https://github.com/data-fair/portals/common-reuse-card' },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-reuse-card': {
      type: 'object',
      title: 'ReuseCardElement',
      'x-i18n-title': {
        en: 'Reuse card',
        fr: 'Vignette de réutilisation'
      },
      layout: {
        children: [
          'type',
          'reuse',
          'mb',
          {
            title: 'Reuse Card',
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
      required: ['type', 'reuse', 'usePortalConfig'],
      properties: {
        type: { const: 'reuse-card' },
        uuid: { type: 'string', layout: 'none' },
        reuse: {
          type: 'object',
          title: 'Réutilisation',
          additionalProperties: false,
          required: ['slug'],
          layout: {
            getItems: {
              url: '/portals-manager/api/reuses?select=slug,title&size=20',
              qSearchParam: 'q',
              itemsResults: 'data.results',
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
        cardConfig: { $ref: 'https://github.com/data-fair/portals/common-reuse-card' },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
  }
}
