export default {
  $id: 'https://github.com/data-fair/portals/portal-config-datasets',
  'x-exports': [],
  title: 'Datasets Catalog',
  type: 'object',
  layout: {
    title: null,
    comp: 'expansion-panels',
  },
  unevaluatedProperties: false,
  required: ['card', 'page'],
  properties: {
    card: { $ref: 'https://github.com/data-fair/portals/portal-config-dataset-card' },
    page: { $ref: 'https://github.com/data-fair/portals/portal-config-dataset-page' }
  }
}
