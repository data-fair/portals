export default {
  $id: 'https://github.com/data-fair/portals/portal-config-datasets',
  'x-exports': [],
  title: 'Datasets Catalog',
  'x-i18n-title': {
    fr: 'Catalogue de données'
  },
  type: 'object',
  layout: {
    title: null,
    comp: 'expansion-panels',
    children: [
      'list',
      {
        title: 'Dataset card',
        'x-i18n-title': {
          fr: 'Vignette d\'un jeu de données'
        },
        children: ['card']
      },
      'page'
    ]
  },
  unevaluatedProperties: false,
  required: ['list', 'card', 'page'],
  properties: {
    list: { $ref: 'https://github.com/data-fair/portals/portal-config-dataset-list' },
    card: { $ref: 'https://github.com/data-fair/portals/portal-config-dataset-card' },
    page: { $ref: 'https://github.com/data-fair/portals/portal-config-dataset-page' }
  }
}
