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
      title: 'Email de contact',
      format: 'email',
      description: 'Cet email n\'est pas visible pour les utilisateurs. Les messages envoyés via des blocs de contact seront transmis à cette adresse email.'
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
      description: 'Ce champ de texte pourra être affiché à côté du formulaire de contact ou au dessus du pied de page dans une partie dédiée aux informations de contact.',
      layout: 'markdown'
    }
  }
}
