module.exports = {
  owner: {
    type: 'object',
    readOnly: true,
    additionalProperties: false,
    required: ['type', 'id'],
    properties: {
      type: {
        type: 'string',
        enum: ['user', 'organization'],
        description: 'If the owner is a user or an organization'
      },
      id: {
        type: 'string',
        description: 'The unique id of the user or organization'
      },
      name: {
        type: 'string',
        description: 'The display name of the user or organization'
      },
      department: {
        type: 'string',
        description: 'If this is set and owner is an organization, this gives ownership to users of this organization that belong to this department'
      }
    }
  }
}
