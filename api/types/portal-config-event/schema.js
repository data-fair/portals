export default {
  $id: 'https://github.com/data-fair/portals/portal-config-event',
  'x-exports': [],
  type: 'object',
  layout: {
    children: [
      {
        comp: 'tabs',
        children: [
          {
            title: 'Event Card',
            'x-i18n-title': {
              fr: "Vignette d'un événement"
            },
            children: [
              'card',
              { name: 'event-card-preview' }
            ]
          }
        ]
      }
    ]
  },
  unevaluatedProperties: false,
  required: ['card'],
  properties: {
    card: { $ref: 'https://github.com/data-fair/portals/portal-config-event-card' }
  }
}
