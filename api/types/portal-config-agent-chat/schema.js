export default {
  $id: 'https://github.com/data-fair/portals/portal-config-agent-chat',
  'x-exports': [],
  title: 'Agent Chat',
  type: 'object',
  unevaluatedProperties: false,
  properties: {
    active: {
      type: 'boolean',
      title: "Activer l'assistant IA",
      default: false,
      layout: 'switch'
    },
    visibleTo: {
      type: 'array',
      title: 'Visible pour',
      default: ['admin', 'contrib', 'user', 'external', 'anonymous'],
      items: {
        type: 'string',
        oneOf: [
          { const: 'admin', title: 'Administrateurs de l\'organisation' },
          { const: 'contrib', title: 'Contributeurs de l\'organisation' },
          { const: 'user', title: 'Autres membres de l\'organisation' },
          { const: 'external', title: 'Utilisateurs externes authentifiés' },
          { const: 'anonymous', title: 'Visiteurs anonymes' }
        ]
      },
      layout: { if: 'parent.data?.active' }
    },
    type: {
      type: 'string',
      title: "Mode d'affichage",
      default: 'menu',
      oneOf: [
        { const: 'drawer', title: 'Panneau latéral (drawer)' },
        { const: 'menu', title: 'Menu flottant' }
      ],
      layout: { if: 'parent.data?.active', cols: 6 }
    },
    togglePosition: {
      type: 'string',
      title: 'Position du bouton',
      default: 'fab',
      oneOf: [
        { const: 'fab', title: 'Bouton flottant (coin inférieur droit)' },
        { const: 'appBar', title: 'Dans la barre de navigation' }
      ],
      layout: { if: 'parent.data?.active', cols: 6 }
    },
    chatTitle: {
      type: 'string',
      title: "Titre de l'assistant",
      default: 'Assistant IA',
      layout: { if: 'parent.data?.active' }
    },
    systemPrompt: {
      type: 'string',
      title: 'Prompt système',
      default: 'Vous êtes un assistant IA intégré à un portail de données. Aidez les utilisateurs à trouver et comprendre les jeux de données disponibles.',
      layout: {
        comp: 'textarea',
        if: 'parent.data?.active'
      }
    },
    drawerProps: {
      type: 'object',
      title: 'Options du panneau latéral',
      unevaluatedProperties: false,
      layout: { if: "parent.data?.active && parent.data?.type === 'drawer'" },
      properties: {
        width: { type: 'number', title: 'Largeur (px)', default: 400 },
        temporary: { type: 'boolean', title: 'Temporaire (se ferme au clic extérieur)', default: true, layout: 'switch' }
      }
    },
    menuProps: {
      type: 'object',
      title: 'Options du menu',
      unevaluatedProperties: false,
      layout: { if: "parent.data?.active && parent.data?.type === 'menu'" },
      properties: {
        width: { type: 'number', title: 'Largeur (px)', default: 400, layout: { cols: 6 } },
        height: { type: 'number', title: 'Hauteur (px)', default: 500, layout: { cols: 6 } }
      }
    },
    btnProps: {
      type: 'object',
      title: 'Options du bouton',
      unevaluatedProperties: false,
      layout: { if: 'parent.data?.active', cols: 6 },
      properties: {
        size: {
          type: 'string',
          title: 'Taille',
          default: 'default',
          oneOf: [
            { const: 'x-small', title: 'Très petit' },
            { const: 'small', title: 'Petit' },
            { const: 'default', title: 'Normal' },
            { const: 'large', title: 'Grand' },
            { const: 'x-large', title: 'Très grand' }
          ]
        }
      }
    }
  }
}
