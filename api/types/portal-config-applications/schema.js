export default {
  $id: 'https://github.com/data-fair/portals/portal-config-applications',
  'x-exports': [],
  title: 'Catalogue de visualisations',
  type: 'object',
  layout: {
    title: null,
    children: [
      {
        title: 'Applications catalog page',
        'x-i18n-title': {
          fr: 'Page du catalogue de visualisations'
        },
        children: [
          'filtersLocation',
          'defaultSort',
          'columns'
        ]
      },
      {
        title: 'Application card',
        'x-i18n-title': {
          fr: 'Carte d\'une visualisation'
        },
        children: [
          'thumbnailLocation',
          'cropThumbnails',
          'showSummary',
          'actionsLocation'
        ]
      },
      {
        title: 'Application page',
        'x-i18n-title': {
          fr: 'Page d\'une visualisation'
        },
        children: [
          'metadataLocation',
          'showImage'
        ]
      },
      {
        title: 'Common elements',
        'x-i18n-title': {
          fr: 'Éléments communs'
        },
        children: [
          'showDepartment',
          'actionsStyle'
        ]
      }
    ]
  },
  unevaluatedProperties: false,
  required: ['filtersLocation', 'defaultSort', 'columns', 'thumbnailLocation', 'cropThumbnails', 'showSummary', 'actionsLocation', 'metadataLocation', 'showImage', 'showDepartment', 'actionsStyle'],
  properties: {
    // Application List page
    filtersLocation: {
      type: 'string',
      title: 'Position des filtres de recherche',
      default: 'top',
      layout: { cols: { md: 6 } },
      oneOf: [
        { const: 'top', title: 'En haut de la page' },
        { const: 'left', title: 'À gauche des résultats' }
      ]
    },
    defaultSort: {
      type: 'string',
      title: 'Tri par défaut',
      description: 'Ce tri sera appliqué par défaut lorsque l\'utilisateur arrive sur la page. Lorsqu\'il commence une recherche, le tri par pertinence sera appliqué.',
      layout: { cols: { md: 6 } },
      default: 'createdAt',
      oneOf: [
        {
          title: 'Date de création',
          const: 'createdAt'
        },
        {
          title: 'Date de mise à jour',
          const: 'updatedAt'
        },
        {
          title: 'Ordre alphabétique',
          const: 'title'
        }
      ]
    },
    columns: {
      type: 'integer',
      title: 'Nombre de colonnes',
      description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
      default: 2,
      minimum: 1,
      maximum: 4
    },
    // Application Card
    thumbnailLocation: {
      type: 'string',
      title: 'Position de l\'image sur la carte',
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
    actionsLocation: {
      type: 'string',
      title: 'Position des boutons d\'actions sur la carte',
      default: 'bottom',
      oneOf: [
        { const: 'right', title: 'À droite' },
        { const: 'bottom', title: 'En bas' },
        { const: 'none', title: 'Aucun' }
      ]
    },
    // Single Application page
    metadataLocation: {
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
      default: true
    },
    // Common to both pages
    showDepartment: {
      type: 'boolean',
      layout: 'switch',
      title: 'Afficher le département du propriétaire',
      description: 'Affiche le département du propriétaire si la visualisation est détenue par un département.',
      default: true
    },
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
