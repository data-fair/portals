/* eslint-disable no-template-curly-in-string */
export default {
  $id: 'https://github.com/data-fair/portals/portal-config-topics',
  'x-exports': [],
  type: 'array',
  title: '',
  layout: {
    comp: 'list',
    density: 'compact',
    getItems: {
      url: '/data-fair/api/v1/settings/${context.owner.type}/${context.owner.id}/topics',
      itemsResults: 'data',
      itemKey: 'item.id',
      itemTitle: 'item.title',
      itemIcon: 'item.icon?.svg'
    }
  },
  items: {
    layout: { switch: [{ if: 'summary', children: [] }] },
    type: 'object',
    properties: {
      id: { type: 'string', layout: 'none' },
      title: { type: 'string', layout: 'none' },
      description: {
        type: 'string',
        title: 'Ajouter une description',
        layout: 'textarea'
      },
      thumbnail: {
        type: 'object',
        required: ['_id', 'name', 'mimeType'],
        layout: {
          slots: {
            component: {
              name: 'image-upload',
              props: { width: 1280, label: 'Chargez une image' }
            }
          }
        },
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          mimeType: { type: 'string' }
        }
      }
    }
  }
}
