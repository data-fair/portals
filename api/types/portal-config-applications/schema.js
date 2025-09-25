export default {
  $id: 'https://github.com/data-fair/portals/portal-config-applications',
  'x-exports': [],
  title: 'Catalogue de visualisations',
  type: 'object',
  layout: {
    title: null,
    children: [
      {
        title: 'Page du catalogue de visualisations',
        children: [
          'cardsLayout',
          'filtersLayout',
          'defaultSort',
          'showActions',
          'cropThumbnails'
        ]
      },
      {
        title: 'Page d\'une visualisation',
        children: [
          'metadataPosition',
          'showImage'
        ]
      },
      {
        title: 'Éléments communs',
        children: [
          'actionsStyle'
        ]
      }
    ]
  },
  unevaluatedProperties: false,
  additionalProperties: false,
  required: ['cardsLayout', 'filtersLayout', 'defaultSort', 'showActions', 'cropThumbnails', 'metadataPosition', 'showImage', 'actionsStyle'],
  properties: {
    // Application List page
    cardsLayout: {
      type: 'string',
      title: 'Disposition des vignettes',
      default: 'vertical',
      oneOf: [
        { const: 'horizontal', title: 'Horizontale' },
        { const: 'vertical', title: 'Verticale (Multi-colonnes)' },
      ]
    },
    filtersLayout: {
      type: 'string',
      title: 'Position des filtres de recherche',
      default: 'top',
      oneOf: [
        { const: 'top', title: 'En haut de la page' },
        { const: 'left', title: 'À gauche des résultats' },
        { const: 'right', title: 'À droite des résultats' },
      ]
    },
    defaultSort: {
      type: 'string',
      title: 'Tri par défaut',
      default: 'createdAt',
      oneOf: [
        {
          title: 'Date de création',
          const: 'createdAt'
        },
        {
          title: 'Date de mise à jour',
          const: 'dataUpdatedAt'
        },
        {
          title: 'Ordre alphabétique',
          const: 'title'
        }
      ]
    },
    showActions: {
      type: 'boolean',
      layout: 'switch',
      title: 'Afficher les boutons d\'actions',
      description: 'Affiche les boutons d\'actions sur les vignettes des applications.',
      default: true
    },
    cropThumbnails: {
      type: 'boolean',
      layout: 'switch',
      title: 'Recadrer automatiquement les vignettes pour un rendu uniforme',
      description: 'Si désactivé, l\'image gardera son ratio d\'origine',
      default: true
    },
    // Single Application page
    metadataPosition: {
      type: 'string',
      title: 'Position des métadonnées sur la page d\'une visualisation',
      default: 'right',
      oneOf: [
        {
          title: 'Sous le titre',
          const: 'top'
        },
        {
          title: 'Entre la description et les applications',
          const: 'bottom'
        },
        {
          title: 'À droite',
          const: 'right'
        }
      ]
    },
    showImage: {
      type: 'boolean',
      layout: 'switch',
      title: 'Afficher l\'image sur la page d\'une visualisation',
      description: 'L\'image sera affichée au dessus de la description.',
      default: false
    },
    // Common to both pages
    actionsStyle: {
      type: 'string',
      title: 'Style des boutons d\'actions',
      default: 'full',
      oneOf: [
        {
          title: 'Icône seulement',
          const: 'icon'
        },
        {
          title: 'Icône et texte',
          const: 'full'
        },
        {
          title: 'Texte seulement',
          const: 'text'
        }
      ]
    }
  }
}
