export default {
  $id: 'https://github.com/data-fair/portals/portal-config',
  'x-exports': ['types'],
  title: 'Portal config',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    comp: 'vertical-tabs',
    children: [
      { title: 'Métadonnées', children: ['title', 'description'] }
    ]
  },
  required: ['title'],
  properties: {
    title: {
      type: 'string',
      title: 'Titre'
    },
    description: {
      type: 'string',
      title: 'Description'
    }
  }

}
