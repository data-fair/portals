export default {
  $id: 'https://github.com/data-fair/portals/portal-config-applications',
  'x-exports': [],
  title: 'Applications Catalog',
  'x-i18n-title': {
    fr: 'Catalogue de visualisations'
  },
  type: 'object',
  layout: {
    title: null,
    children: [
      'list',
      {
        title: 'Application card',
        'x-i18n-title': {
          fr: 'Carte d\'une visualisation'
        },
        comp: 'card',
        children: ['card']
      },
      'page'
    ]
  },
  unevaluatedProperties: false,
  required: ['list', 'card', 'page'],
  properties: {
    list: { $ref: 'https://github.com/data-fair/portals/portal-config-application-list' },
    card: { $ref: 'https://github.com/data-fair/portals/portal-config-application-card' },
    page: { $ref: 'https://github.com/data-fair/portals/portal-config-application-page' }
  }
}
