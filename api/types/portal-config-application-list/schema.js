export default {
  $id: 'https://github.com/data-fair/portals/portal-config-application-list',
  'x-exports': [],
  title: 'Applications List',
  'x-i18n-title': {
    fr: 'Catalogue de visualisations'
  },
  type: 'object',
  unevaluatedProperties: false,
  properties: {
    filtersLocation: {
      type: 'string',
      title: 'Position des filtres de recherche',
      default: 'top',
      layout: { cols: { md: 4 } },
      oneOf: [
        { const: 'top', title: 'En haut de la page' },
        { const: 'left', title: 'À gauche des résultats' }
      ]
    },
    filtersList: {
      type: 'array',
      title: 'Filtres à afficher',
      layout: { cols: { md: 4 } },
      items: {
        type: 'string',
        oneOf: [
          { const: 'base-application', title: 'Filtres par applications' },
          { const: 'topics', title: 'Filtres par thématiques' }
        ]
      }
    },
    defaultSort: {
      type: 'string',
      title: 'Tri par défaut',
      description: "Ce tri sera appliqué par défaut lorsque l'utilisateur arrive sur la page. Lorsqu'il commence une recherche, le tri par pertinence sera appliqué.",
      layout: { cols: { md: 4 } },
      default: 'createdAt',
      oneOf: [
        { const: 'createdAt', title: 'Date de création' },
        { const: 'dataUpdatedAt', title: 'Date de mise à jour' },
        { const: 'title', title: 'Ordre alphabétique' }
      ]
    },
    columns: {
      type: 'integer',
      title: 'Nombre de colonnes',
      description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
      layout: { cols: { md: 4 } },
      default: 2,
      minimum: 1,
      maximum: 3
    },
    topicsFilters: {
      type: 'object',
      title: 'Configuration des filtres de thématiques',
      layout: 'card',
      properties: {
        color: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics',
          layout: { cols: { md: 6 } }
        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          layout: { cols: { md: 6 } }
        },
        density: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density',
          layout: { cols: { md: 6 } }
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
          layout: { cols: { md: 6 } }
        },
        showIcon: {
          type: 'boolean',
          title: 'Afficher les icônes',
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          },
          default: true
        },
        iconColor: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics',
          title: 'Couleur des icônes',
          layout: {
            if: 'parent.data?.showIcon === true',
            cols: { md: 6 }
          }
        }
      }
    }
  }
}
