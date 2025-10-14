export default {
  $id: 'https://github.com/data-fair/portals/portal-config-social-links',
  'x-exports': [],
  title: 'SocialLinks',
  type: 'object',
  layout: { title: 'Vos réseaux' },
  unevaluatedProperties: false,
  properties: {
    bluesky: {
      type: 'string',
      title: 'Compte Bluesky',
      layout: { cols: { md: 6 } }
    },
    x: {
      type: 'string',
      title: 'Compte X (ex Twitter)',
      layout: { cols: { md: 6 } }
    },
    facebook: {
      type: 'string',
      title: 'Compte Facebook',
      layout: { cols: { md: 6 } }
    },
    linkedin: {
      type: 'string',
      title: 'Compte LinkedIn',
      layout: { cols: { md: 6 } }
    },
    instagram: {
      type: 'string',
      title: 'Compte Instagram',
      layout: { cols: { md: 6 } }
    },
    youtube: {
      type: 'string',
      title: 'Identifiant Youtube',
      description: "Vous pouvez renseigner directement un identifiant d'utilisateur ou bien celui d'une chaine avec \"c/\" en préfixe.",
      layout: { cols: { md: 6 } }
    },
    vimeo: {
      type: 'string',
      title: 'Identifiant Vimeo',
      layout: { cols: { md: 6 } }
    }
  }
}
