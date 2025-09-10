export default {
  $id: 'https://github.com/data-fair/portals/portal-config-contact-informations',
  'x-exports': [],
  title: 'Contact Informations',
  type: 'object',
  layout: { title: 'Informations de contact' },
  unevaluatedProperties: false,
  properties: {
    email: {
      type: 'string',
      title: 'Email de contact',
      format: 'email',
      description: 'Cet email ne sera pas directement exposé aux utilisateurs, mais un formulaire de contact sera disponible dans le portail.'
    },
    phone: {
      type: 'string',
      title: 'Téléphone de contact',
      layout: { cols: { md: 6 } }
    },
    phoneLabel: {
      type: 'string',
      title: 'Nom associé au téléphone de contact',
      layout: { cols: { md: 6 } }
    },
    website: {
      type: 'string',
      title: 'Site Web de contact',
      layout: { cols: { md: 6 } }
    },
    websiteLabel: {
      type: 'string',
      title: 'Nom associé au site Web de contact',
      layout: { cols: { md: 6 } }
    },
    infos: {
      type: 'string',
      title: 'Informations de contact',
      layout: 'markdown'
    },
    note: {
      type: 'string',
      title: 'Mention de contact',
      layout: 'markdown'
    }
  }
}
