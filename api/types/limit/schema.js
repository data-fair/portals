const limitType = {
  type: 'object',
  additionalProperties: false,
  properties: {
    limit: { type: 'number' },
    consumption: { type: 'number' }
  }
}

export default {
  $id: 'https://github.com/data-fair/portals/limit',
  'x-exports': ['types', 'validate'],
  title: 'Limit',
  type: 'object',
  additionalProperties: false,
  required: ['type', 'id', 'lastUpdate'],
  properties: {
    type: { type: 'string', enum: ['user', 'organization'] },
    id: { type: 'string' },
    name: { type: 'string' },
    lastUpdate: { type: 'string', format: 'date-time' },
    defaults: { type: 'boolean', title: 'these limits were defined using default values only, not specifically defined' },
    portals_nb_pages: limitType,
    portals_nb_domains: limitType
  }
}
