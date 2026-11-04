export default {
  $id: 'https://github.com/data-fair/portals/portal-config-social-links',
  'x-exports': [],
  title: 'SocialLinks',
  type: 'object',
  layout: { title: 'Your networks', 'x-i18n-title': { fr: 'Vos réseaux' } },
  unevaluatedProperties: false,
  properties: {
    bluesky: {
      type: 'string',
      title: 'Bluesky account',
      'x-i18n-title': { fr: 'Compte Bluesky' },
      layout: { cols: { md: 6 }, props: { prefix: 'bsky.app/profile/' } }
    },
    x: {
      type: 'string',
      title: 'X account (formerly Twitter)',
      'x-i18n-title': { fr: 'Compte X (ex Twitter)' },
      layout: { cols: { md: 6 }, props: { prefix: 'x.com/' } }
    },
    facebook: {
      type: 'string',
      title: 'Facebook account',
      'x-i18n-title': { fr: 'Compte Facebook' },
      layout: { cols: { md: 6 }, props: { prefix: 'facebook.com/' } }
    },
    linkedin: {
      type: 'string',
      title: 'LinkedIn account',
      'x-i18n-title': { fr: 'Compte LinkedIn' },
      layout: { cols: { md: 6 }, props: { prefix: 'linkedin.com/company/' } }
    },
    instagram: {
      type: 'string',
      title: 'Instagram account',
      'x-i18n-title': { fr: 'Compte Instagram' },
      layout: { cols: { md: 6 }, props: { prefix: 'instagram.com/' } }
    },
    youtube: {
      type: 'string',
      title: 'YouTube identifier',
      'x-i18n-title': { fr: 'Identifiant Youtube' },
      description: 'You can enter a user identifier directly, or a channel identifier prefixed with "c/".',
      'x-i18n-description': { fr: "Vous pouvez renseigner directement un identifiant d'utilisateur ou bien celui d'une chaine avec \"c/\" en préfixe." },
      layout: { cols: { md: 6 }, props: { prefix: 'youtube.com/' } }
    },
    vimeo: {
      type: 'string',
      title: 'Vimeo identifier',
      'x-i18n-title': { fr: 'Identifiant Vimeo' },
      layout: { cols: { md: 6 }, props: { prefix: 'vimeo.com/' } }
    }
  }
}
