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
            title: 'Reuse Card',
            'x-i18n-title': {
              fr: "Vignette d'une réutilisation"
            },
            children: [
              { key: 'card' },
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
      title: 'Permettre aux utilisateurs du portail de proposer des réutilisations',
      layout: 'switch',
      default: false
    },
    card: { $ref: 'https://github.com/data-fair/portals/portal-config-reuse-card' },
    page: { $ref: 'https://github.com/data-fair/portals/portal-config-reuse-page' }
  }
}
