export default {
  $id: 'https://github.com/data-fair/portals/portal-config-application-card',
  'x-exports': [],
  title: 'Application Card',
  type: 'object',
  layout: { title: null },
  unevaluatedProperties: false,
  properties: {
    actionsLocation: {
      type: 'string',
      title: 'Position des boutons d\'actions sur la carte',
      layout: { cols: { md: 4 } },
      default: 'bottom',
      oneOf: [
        { const: 'right', title: 'À droite' },
        { const: 'bottom', title: 'En bas' },
        { const: 'none', title: 'Aucun' }
      ]
    },
    actionsStyle: {
      type: 'string',
      title: 'Style des boutons d\'actions',
      layout: { cols: { md: 4 } },
      default: 'full',
      oneOf: [
        { const: 'icon', title: 'Icône seulement' },
        { const: 'full', title: 'Icône et texte' },
        { const: 'text', title: 'Texte seulement' }
      ]
    },
    thumbnailLocation: {
      type: 'string',
      title: 'Position de l\'image sur la carte',
      layout: { cols: { md: 4 } },
      default: 'center',
      oneOf: [
        { const: 'left', title: 'À gauche' },
        { const: 'center', title: 'Sous le titre' },
        { const: 'none', title: 'Ne pas afficher' }
      ]
    },
    cropThumbnails: {
      type: 'boolean',
      title: 'Recadrer l\'image pour un rendu uniforme',
      description: 'Si désactivé, l\'image gardera son ratio d\'origine',
      layout: {
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
    },
    showSummary: {
      type: 'boolean',
      title: 'Afficher le résumé sur la carte',
      layout: {
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
    },
    showDepartment: {
      type: 'boolean',
      title: 'Afficher le département du propriétaire',
      description: 'Affiche le département du propriétaire si la visualisation est détenue par un département.',
      layout: {
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
    }
  }
}
