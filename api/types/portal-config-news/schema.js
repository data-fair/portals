export default {
  $id: 'https://github.com/data-fair/portals/portal-config-news',
  'x-exports': [],
  type: 'object',
  layout: {
    children: [
      {
        comp: 'tabs',
        children: [
          {
            title: 'News Card',
            'x-i18n-title': {
              fr: "Vignette d'une actualité"
            },
            children: [
              'card',
              { name: 'news-card-preview' }
            ]
          }
        ]
      }
    ]
  },
  unevaluatedProperties: false,
  required: ['card'],
  properties: {
    card: { $ref: 'https://github.com/data-fair/portals/portal-config-news-card' }
  }
}
