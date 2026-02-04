export default {
  $id: 'https://github.com/data-fair/portals/portal-config-social-shares',
  'x-exports': [],
  title: 'SocialShares',
  'x-i18n-title': {
    fr: 'Réseaux sociaux proposés pour le partage'
  },
  type: 'array',
  description: 'Ces réseaux sociaux seront proposés aux utilisateurs pour le partage de jeux de données et applications qui sont publiques.',
  items: {
    type: 'string',
    oneOf: [
      { const: 'bluesky', title: 'Bluesky' },
      { const: 'x', title: 'X (ex Twitter)' },
      { const: 'facebook', title: 'Facebook' },
      { const: 'linkedin', title: 'LinkedIn' },
      { const: 'reddit', title: 'Reddit' },
      { const: 'sms', title: 'SMS' },
      { const: 'whatsapp', title: 'WhatsApp' }
    ]
  }
}
