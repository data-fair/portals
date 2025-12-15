export default {
  $id: 'https://github.com/data-fair/portals/portal-config-reuses',
  'x-exports': [],
  type: 'object',
  layout: {
    title: null,
    comp: 'tabs'
  },
  unevaluatedProperties: false,
  required: ['card', 'page'],
  properties: {
    card: { $ref: 'https://github.com/data-fair/portals/portal-config-reuse-card' },
    page: { $ref: 'https://github.com/data-fair/portals/portal-config-reuse-page' }
  }
}
