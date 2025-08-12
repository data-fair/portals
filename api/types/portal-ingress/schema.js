export default {
  $id: 'https://github.com/data-fair/portals/portal-ingress',
  'x-exports': ['types', 'validate', 'vjsf'],
  title: 'Portal ingress',
  type: 'object',
  unevaluatedProperties: false,
  required: ['url'],
  properties: {
    url: {
      type: 'string',
      layout: {
        placeholder: 'https://test.com'
      }
    }
  }
}
