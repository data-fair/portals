export default {
  $id: 'https://github.com/data-fair/portals/portal-config-applications',
  'x-exports': [],
  type: 'object',
  layout: {
    comp: 'tabs',
    children: [
      {
        title: 'Application Card',
        'x-i18n-title': {
          fr: "Vignette d'une application"
        },
        children: [
          'card',
          { name: 'application-card-preview' }
        ]
      },
      'page'
    ]
  },
  unevaluatedProperties: false,
  required: ['card', 'page'],
  properties: {
    card: { $ref: 'https://github.com/data-fair/portals/portal-config-application-card' },
    page: { $ref: 'https://github.com/data-fair/portals/portal-config-application-page' }
  }
}
