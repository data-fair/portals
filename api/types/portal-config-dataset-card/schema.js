export default {
  $id: 'https://github.com/data-fair/portals/portal-config-dataset-card',
  'x-exports': [],
  title: 'Dataset Card',
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
    useApplicationThumbnail: {
      type: 'boolean',
      title: 'Utiliser l\'image de l\'application',
      description: "Permet d'utiliser l'image de la première application qui utilise ce jeu de données si aucune image n'est définie pour ce dernier.",
      layout: {
        comp: 'switch',
        cols: { md: 6 }
      },
      default: false
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
      description: 'Affiche le département du propriétaire si le jeu de données est détenu par un département.',
      layout: {
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
    }
  }
}
