export default {
  $id: 'https://github.com/data-fair/portals/portal',
  'x-exports': ['types', 'validate'],
  'x-jstt': { additionalProperties: false },
  title: 'Portal',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'title', 'owner', 'createdAt', 'updatedAt', 'config', 'draftConfig'],
  properties: {
    _id: {
      type: 'string',
      title: 'Identifier',
      readOnly: true
    },
    title: {
      type: 'string',
      title: 'Title',
      readOnly: true
    },
    whiteLabel: {
      title: 'White label',
      description: 'When checked, the portal shows no Koumoul branding',
      type: 'boolean',
      default: false,
      readOnly: true
    },
    isReference: { // superadmin can set a page as reference page
      type: 'boolean',
      title: 'Reference Page',
      readOnly: true
    },
    md2Compat: {
      type: 'boolean',
      title: 'MD2 compatibility',
      default: false,
      readOnly: true
    },
    staging: {
      title: 'Pre-production',
      description: 'When checked, contributors can publish resources without asking the administrators',
      type: 'boolean',
      default: false
    },
    legacyFooter: {
      type: 'object',
      description: 'Footer configuration before the rows migration, kept to replay the conversion',
      additionalProperties: true,
      readOnly: true
    },
    legacyDraftFooter: {
      type: 'object',
      description: 'Draft footer configuration before the rows migration, kept to replay the conversion',
      additionalProperties: true,
      readOnly: true
    },
    contributorDepartments: {
      type: 'array',
      title: 'Contributor departments',
      description: 'Departments whose administrators can publish on this portal as if they owned it.',
      items: { type: 'string' },
      default: []
    },
    owner: { $ref: 'https://github.com/data-fair/lib/account' },
    createdAt: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/createdAt' },
    updatedAt: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/updatedAt' },
    config: { $ref: 'https://github.com/data-fair/portals/portal-config' },
    draftConfig: { $ref: 'https://github.com/data-fair/portals/portal-config' },
    ingress: { $ref: 'https://github.com/data-fair/portals/portal-ingress' }
  }
}
