export default {
  $id: 'https://github.com/data-fair/portals/partial',
  'x-exports': [],
  $defs: {
    modifier: {
      type: 'object',
      additionalProperties: false,
      required: [
        'id',
        'name',
        'date'
      ],
      readOnly: true,
      properties: {
        id: {
          type: 'string',
          description: 'Id of the user that created this resource'
        },
        name: {
          type: 'string',
          description: 'Name of the user that created this resource'
        },
        date: {
          type: 'string',
          description: 'Creation date of this resource',
          format: 'date-time'
        }
      }
    }
  }
}
