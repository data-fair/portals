export default {
  $id: 'https://github.com/data-fair/portals/portal-config-agent-chat',
  'x-exports': [],
  title: 'Agent Chat',
  'x-i18n-title': { fr: 'Assistant IA (bêta)', en: 'AI assistant (beta)' },
  type: 'object',
  unevaluatedProperties: false,
  properties: {
    active: {
      type: 'boolean',
      title: 'Enable the AI assistant',
      'x-i18n-title': { fr: "Activer l'assistant IA" },
      default: false,
      layout: 'switch'
    },
    visibleTo: {
      type: 'array',
      title: 'Visible to',
      'x-i18n-title': { fr: 'Visible pour' },
      default: ['admin', 'contrib', 'user', 'external', 'anonymous'],
      items: {
        type: 'string',
        oneOf: [
          { const: 'admin', title: 'Organization administrators', 'x-i18n-title': { fr: "Administrateurs de l'organisation" } },
          { const: 'contrib', title: 'Organization contributors', 'x-i18n-title': { fr: "Contributeurs de l'organisation" } },
          { const: 'user', title: 'Other organization members', 'x-i18n-title': { fr: "Autres membres de l'organisation" } },
          { const: 'external', title: 'Authenticated external users', 'x-i18n-title': { fr: 'Utilisateurs externes authentifiés' } },
          { const: 'anonymous', title: 'Anonymous visitors', 'x-i18n-title': { fr: 'Visiteurs anonymes' } }
        ]
      },
      layout: { if: 'parent.data?.active' }
    },
    type: {
      type: 'string',
      title: 'Display mode',
      'x-i18n-title': { fr: "Mode d'affichage" },
      default: 'menu',
      oneOf: [
        { const: 'drawer', title: 'Side panel (drawer)', 'x-i18n-title': { fr: 'Panneau latéral (drawer)' } },
        { const: 'menu', title: 'Floating menu', 'x-i18n-title': { fr: 'Menu flottant' } }
      ],
      layout: { if: 'parent.data?.active', cols: 6 }
    },
    togglePosition: {
      type: 'string',
      title: 'Button position',
      'x-i18n-title': { fr: 'Position du bouton' },
      default: 'fab',
      oneOf: [
        { const: 'fab', title: 'Floating button (bottom right corner)', 'x-i18n-title': { fr: 'Bouton flottant (coin inférieur droit)' } },
        { const: 'appBar', title: 'In the navigation bar', 'x-i18n-title': { fr: 'Dans la barre de navigation' } }
      ],
      layout: { if: 'parent.data?.active', cols: 6 }
    },
    chatTitle: {
      type: 'string',
      title: 'Assistant title',
      'x-i18n-title': { fr: "Titre de l'assistant" },
      default: 'Assistant IA',
      layout: { if: 'parent.data?.active' }
    },
    // DEPRECATED (agents libs 0.7 ignore it, docs/architecture/agent.md): kept for existing configurations,
    // no default any more; remove with an upgrade script in a future release.
    systemPrompt: {
      type: 'string',
      title: 'System prompt',
      'x-i18n-title': { fr: 'Prompt système' },
      deprecated: true,
      description: 'Deprecated, ignored since agents 0.7 (a persona is now a configured agent, chosen by its id). Kept so existing configurations stay valid; to be removed in a future release.',
      'x-i18n-description': { fr: 'Obsolète, ignoré depuis agents 0.7 (une persona est désormais un agent configuré, choisi par son identifiant). Conservé pour que les configurations existantes restent valides ; sera supprimé dans une prochaine version.' },
      layout: {
        comp: 'textarea',
        if: 'parent.data?.active'
      }
    },
    drawerProps: {
      type: 'object',
      title: 'Side panel options',
      'x-i18n-title': { fr: 'Options du panneau latéral' },
      unevaluatedProperties: false,
      layout: { if: "parent.data?.active && parent.data?.type === 'drawer'" },
      properties: {
        width: { type: 'number', title: 'Width (px)', 'x-i18n-title': { fr: 'Largeur (px)' }, default: 400 },
        temporary: { type: 'boolean', title: 'Temporary (closes when clicking outside)', 'x-i18n-title': { fr: 'Temporaire (se ferme au clic extérieur)' }, default: true, layout: 'switch' }
      }
    },
    menuProps: {
      type: 'object',
      title: 'Menu options',
      'x-i18n-title': { fr: 'Options du menu' },
      unevaluatedProperties: false,
      layout: { if: "parent.data?.active && parent.data?.type === 'menu'" },
      properties: {
        width: { type: 'number', title: 'Width (px)', 'x-i18n-title': { fr: 'Largeur (px)' }, default: 400, layout: { cols: 6 } },
        height: { type: 'number', title: 'Height (px)', 'x-i18n-title': { fr: 'Hauteur (px)' }, default: 500, layout: { cols: 6 } }
      }
    },
    btnProps: {
      type: 'object',
      title: 'Button options',
      'x-i18n-title': { fr: 'Options du bouton' },
      unevaluatedProperties: false,
      layout: { if: 'parent.data?.active', cols: 6 },
      properties: {
        size: {
          type: 'string',
          title: 'Size',
          'x-i18n-title': { fr: 'Taille' },
          default: 'default',
          oneOf: [
            { const: 'x-small', title: 'Extra small', 'x-i18n-title': { fr: 'Très petit' } },
            { const: 'small', title: 'Small', 'x-i18n-title': { fr: 'Petit' } },
            { const: 'default', title: 'Normal' },
            { const: 'large', title: 'Large', 'x-i18n-title': { fr: 'Grand' } },
            { const: 'x-large', title: 'Extra large', 'x-i18n-title': { fr: 'Très grand' } }
          ]
        }
      }
    }
  }
}
