export default {
  $id: 'https://github.com/data-fair/portals/portal-config-datasets',
  'x-exports': [],
  title: 'Catalogue de données',
  type: 'object',
  layout: {
    title: null,
    children: [
      {
        title: 'Page du catalogue de données',
        children: [
          'cardsLayout',
          'filtersLayout',
          'defaultSort',
          'useApplicationThumbnail',
          'cropThumbnails'
        ]
      },
      {
        title: 'Page d\'un jeu de données',
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
  required: ['cardsLayout', 'filtersLayout', 'defaultSort', 'cropThumbnails', 'metadataPosition', 'showImage', 'actionsStyle'],
  properties: {
    // Dataset List page
    cardsLayout: {
      type: 'string',
      title: 'Disposition des vignettes',
      default: 'medium',
      oneOf: [
        { const: 'horizontal', title: 'Horizontale' },
        { const: 'medium', title: 'Verticale (2 colonnes)' },
        { const: 'compact', title: 'Verticale (3 colonnes)' },
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
    useApplicationThumbnail: {
      type: 'boolean',
      layout: 'switch',
      title: 'Utiliser les vignettes d\'application',
      description: 'Utiliser l\'image de la première application comme vignette si aucune image n\'est définie pour le jeu de données. Si le jeu de données n\'a pas d\'image ni d\'application, sa description sera affichée.',
      default: false
    },
    cropThumbnails: {
      type: 'boolean',
      layout: 'switch',
      title: 'Recadrer automatiquement les vignettes pour un rendu uniforme',
      description: 'Si désactivé, l\'image gardera son ratio d\'origine',
      default: true
    },
    // Single Dataset page
    metadataPosition: {
      type: 'string',
      title: 'Position des métadonnées sur la page d\'un jeu de données',
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
      title: 'Afficher l\'image sur la page du jeu de données',
      description: 'L\'image sera affichée au dessus de la description du jeu de données.',
      default: true
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
