export default {
  $id: 'https://github.com/data-fair/portals/portal-config-reuses',
  'x-exports': [],
  type: 'object',
  layout: {
    children: [
      'allowUserReuses',
      {
        comp: 'tabs',
        children: [
          {
            title: 'Reuse card',
            'x-i18n-title': {
              fr: "Vignette d'une réutilisation"
            },
            children: [
              'card',
              { name: 'reuse-card-preview' }
            ]
          },
          'page'
        ]
      }
    ]
  },
  unevaluatedProperties: false,
  required: ['card', 'page'],
  properties: {
    allowUserReuses: {
      type: 'boolean',
      title: 'Allow portal users to suggest reuses',
      'x-i18n-title': { fr: 'Permettre aux utilisateurs du portail de proposer des réutilisations' },
      layout: 'switch',
      default: false
    },
    card: { $ref: 'https://github.com/data-fair/portals/common-reuse-card' },
    page: { $ref: 'https://github.com/data-fair/portals/portal-config-reuse-page' }
  }
}
