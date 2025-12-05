export default {
  $id: 'https://github.com/data-fair/portals/portal-config-applications',
  'x-exports': [],
  title: 'Applications Catalog',
  type: 'object',
  layout: {
    title: null,
    comp: 'expansion-panels'
  },
  unevaluatedProperties: false,
  required: ['card', 'page'],
  properties: {
    card: { $ref: 'https://github.com/data-fair/portals/portal-config-application-card' },
    page: { $ref: 'https://github.com/data-fair/portals/portal-config-application-page' }
  }
}
