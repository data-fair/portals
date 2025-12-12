export default {
  $id: 'https://github.com/data-fair/portals/portal-config-reuses',
  'x-exports': [],
  title: 'Reuses',
  'x-i18n-title': {
    fr: 'Réutilisations'
  },
  type: 'object',
  layout: {
    title: null,
    comp: 'expansion-panels',
    children: [
      'card',
      'page'
    ]
  },
  unevaluatedProperties: false,
  required: ['card', 'page'],
  properties: {
    card: { $ref: 'https://github.com/data-fair/portals/portal-config-reuse-card' },
    page: { $ref: 'https://github.com/data-fair/portals/portal-config-reuse-page' }
  }
}
