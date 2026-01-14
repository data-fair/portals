export default {
  $id: 'https://github.com/data-fair/portals/page',
  'x-exports': ['types', 'validate'],
  title: 'Page',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'title', 'type', 'owner', 'createdAt', 'updatedAt', 'config', 'draftConfig', 'portals', 'requestedPortals'],
  properties: {
    _id: {
      type: 'string',
      readOnly: true
    },
    title: { type: 'string' }, // can be synced from config.title or edited by user
    type: {
      type: 'string',
      enum: ['home', 'contact', 'privacy-policy', 'accessibility', 'legal-notice', 'cookie-policy', 'terms-of-service', 'datasets', 'applications', 'reuses', 'event', 'news', 'generic'],
      default: 'generic',
      readOnly: true
    },
    isReference: { // superadmin can set a page as reference page
      type: 'boolean',
      title: 'Reference Page',
      'x-i18n-title': {
        fr: 'Page de référence'
      },
      readOnly: true
    },
    owner: { $ref: 'https://github.com/data-fair/lib/session-state#/$defs/account' },
    createdAt: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/createdAt' },
    updatedAt: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/updatedAt' },
    configUpdatedAt: {
      type: 'string',
      format: 'date-time',
      title: 'Last configuration update',
      readOnly: true
    },
    config: { $ref: 'https://github.com/data-fair/portals/page-config' },
    draftConfig: { $ref: 'https://github.com/data-fair/portals/page-config' },
    portals: {
      type: 'array',
      items: { type: 'string' }
    },
    requestedPortals: {
      type: 'array',
      items: { type: 'string' }
    }
  }
}
