export default {
  $id: 'https://github.com/data-fair/portals/portal-config-contact-informations',
  'x-exports': [],
  title: 'Contact Informations',
  type: 'object',
  layout: { title: null },
  unevaluatedProperties: false,
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      title: 'Contact email',
      'x-i18n-title': { fr: 'Email de contact' },
      format: 'email',
      description: 'This email is not visible to users. Messages sent through contact blocks are forwarded to this email address.',
      'x-i18n-description': { fr: "Cet email n'est pas visible pour les utilisateurs. Les messages envoyés via des blocs de contact seront transmis à cette adresse email." }
    },
    phone: {
      type: 'string',
      title: 'Contact phone',
      'x-i18n-title': { fr: 'Téléphone de contact' },
      layout: { cols: { md: 6 } }
    },
    phoneLabel: {
      type: 'string',
      title: 'Text shown instead of the number',
      'x-i18n-title': { fr: 'Texte affiché à la place du numéro' },
      layout: { cols: { md: 6 } }
    },
    website: {
      type: 'string',
      title: 'Contact website',
      'x-i18n-title': { fr: 'Site Web de contact' },
      layout: { cols: { md: 6 } }
    },
    websiteLabel: {
      type: 'string',
      title: 'Text shown instead of the address',
      'x-i18n-title': { fr: "Texte affiché à la place de l'adresse" },
      layout: { cols: { md: 6 } }
    },
    infos: {
      type: 'string',
      title: 'Contact information',
      'x-i18n-title': { fr: 'Informations de contact' },
      description: 'This text can be displayed next to the contact form.',
      'x-i18n-description': { fr: 'Ce texte peut être affiché à côté du formulaire de contact.' },
      layout: 'markdown'
    },
    infos_html: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rendered-html' }
  }
}
