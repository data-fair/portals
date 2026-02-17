export default {
  $id: 'https://github.com/data-fair/portals/access-account-ref',
  title: 'Access account reference',
  'x-exports': ['types'],
  type: 'object',
  description: 'A flexible account reference used to grant permissions, private access, etc',
  additionalProperties: false,
  required: ['type'],
  properties: {
    type: {
      type: 'string',
      enum: ['user', 'organization'],
      description: 'If the entity is a user or an organization'
    },
    id: {
      type: 'string',
      description: 'Identifier of the entity'
    },
    name: {
      type: 'string',
      description: 'Name of the entity'
    },
    email: {
      type: 'string',
      description: 'Email of the user (can be used as an alternative to the id)'
    },
    department: {
      type: 'string',
      description: 'Identifier of the department or "*" for any department (same as empty) or "-" for no department'
    },
    departmentName: {
      type: 'string',
      description: 'Name of the department'
    },
    role: {
      type: 'string',
      description: 'Role name'
    }
  }
}
