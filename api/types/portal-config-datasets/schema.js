export default {
  $id: 'https://github.com/data-fair/portals/portal-config-datasets',
  'x-exports': [],
  type: 'object',
  layout: {
    comp: 'tabs',
    children: [
      {
        title: 'Dataset card',
        'x-i18n-title': {
          fr: "Vignette d'un jeu de données"
        },
        children: [
          'card',
          { name: 'dataset-card-preview' }
        ]
      },
      'page'
    ]
  },
  unevaluatedProperties: false,
  required: ['card', 'page'],
  properties: {
    card: { $ref: 'https://github.com/data-fair/portals/portal-config-dataset-card' },
    page: { $ref: 'https://github.com/data-fair/portals/portal-config-dataset-page' }
  }
}
