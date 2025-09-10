export default {
  $id: 'https://github.com/data-fair/portals/portal-config-social-links',
  'x-exports': [],
  title: 'SocialLinks',
  type: 'object',
  layout: { title: 'Réseaux sociaux' },
  unevaluatedProperties: false,
  properties: {
    bluesky: {
      type: 'string',
      title: 'Compte Bluesky'
    },
    x: {
      type: 'string',
      title: 'Compte X'
    },
    facebook: {
      type: 'string',
      title: 'Compte Facebook'
    },
    linkedin: {
      type: 'string',
      title: 'Compte LinkedIn'
    },
    instagram: {
      type: 'string',
      title: 'Compte Instagram'
    },
    youtube: {
      type: 'string',
      title: 'Identifiant Youtube',
      description: "Vous pouvez renseigner directement un identifiant d'utilisateur ou bien celui d'une chaine avec \"c/\" en préfixe."
    },
    vimeo: {
      type: 'string',
      title: 'Identifiant Vimeo'
    }
  }
}
