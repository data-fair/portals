export default {
  $id: 'https://github.com/data-fair/portals/portal-config-dataset-list',
  'x-exports': [],
  title: 'Datasets List',
  'x-i18n-title': {
    fr: 'Catalogue de données'
  },
  type: 'object',
  layout: { comp: 'card' },
  unevaluatedProperties: false,
  required: ['filtersLocation', 'defaultSort', 'columns'],
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
    defaultSort: {
      type: 'string',
      title: 'Tri par défaut',
      description: 'Ce tri sera appliqué par défaut lorsque l\'utilisateur arrive sur la page. Lorsqu\'il commence une recherche, le tri par pertinence sera appliqué.',
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
      properties: {
        elevation: {
          type: 'integer',
          title: 'Élévation des boutons de thématiques',
          layout: { cols: { md: 4 } },
          default: 0,
          oneOf: [
            { const: 0, title: 'Aucune' },
            { const: 1, title: 'Légère' },
            { const: 2, title: 'Modérée' },
            { const: 3, title: 'Forte' }
          ]
        },
        density: {
          type: 'string',
          title: 'Densité des boutons de thématiques',
          layout: { cols: { md: 4 } },
          default: 'comfortable',
          oneOf: [
            { const: 'default', title: 'Normale' },
            { const: 'comfortable', title: 'Confortable' },
            { const: 'compact', title: 'Compacte' }
          ]
        },
        rounded: {
          type: 'string',
          title: 'Arrondi des boutons de thématiques',
          layout: { cols: { md: 4 } },
          default: 'default',
          oneOf: [
            { const: '0', title: 'Aucun' },
            { const: 'default', title: 'Normal' },
            { const: 'lg', title: 'Moyen' },
            { const: 'xl', title: 'Grand' }
          ]
        }
      }
    }
  }
}
