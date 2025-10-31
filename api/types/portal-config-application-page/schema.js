export default {
  $id: 'https://github.com/data-fair/portals/portal-config-application-page',
  'x-exports': [],
  title: 'Application Page',
  'x-i18n-title': {
    fr: 'Page d\'une visualisation'
  },
  type: 'object',
  unevaluatedProperties: false,
  properties: {
    metadataLocation: {
      type: 'string',
      title: 'Position des métadonnées',
      layout: { cols: { md: 6 } },
      default: 'right',
      oneOf: [
        { const: 'top', title: 'Sous le titre' },
        { const: 'right', title: 'À droite' }
      ]
    },
    attachmentsLocation: {
      type: 'string',
      title: 'Position des pièces jointes',
      layout: { cols: { md: 6 } },
      default: 'action',
      oneOf: [
        { const: 'action', title: 'Dans un bouton d\'action' },
        { const: 'full', title: 'Dans les métadonnées' }
      ]
    },
    showImage: {
      type: 'boolean',
      title: 'Afficher l\'image',
      description: 'L\'image sera affichée au dessus de la description.',
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
    },
    actionsStyle: {
      type: 'string',
      title: 'Style des boutons d\'actions',
      layout: { cols: { md: 6 } },
      default: 'full',
      oneOf: [
        { const: 'icon', title: 'Icône seulement' },
        { const: 'full', title: 'Icône et texte' },
        { const: 'text', title: 'Texte seulement' }
      ]
    }
  }
}
