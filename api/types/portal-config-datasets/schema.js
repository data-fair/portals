export default {
  $id: 'https://github.com/data-fair/portals/portal-config-datasets',
  'x-exports': [],
  title: 'Datasets Catalog',
  'x-i18n-title': {
    fr: 'Catalogue de données'
  },
  type: 'object',
  layout: {
    title: null,
    children: [
      {
        title: 'Datasets catalog page',
        'x-i18n-title': {
          fr: 'Page du catalogue de données'
        },
        children: [
          'filtersLocation',
          'defaultSort',
          'columns'
        ]
      },
      {
        title: 'Dataset card',
        'x-i18n-title': {
          fr: 'Carte d\'un jeu de données'
        },
        children: [
          'thumbnailLocation',
          'useApplicationThumbnail',
          'cropThumbnails',
          'showSummary',
          'actionsLocation'
        ]
      },
      {
        title: 'Dataset page',
        'x-i18n-title': {
          fr: 'Page d\'un jeu de données'
        },
        children: [
          'metadataPosition',
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
  required: ['filtersLocation', 'defaultSort', 'columns', 'thumbnailLocation', 'cropThumbnails', 'showSummary', 'actionsLocation', 'metadataPosition', 'showImage', 'showDepartment', 'actionsStyle'],
  properties: {
    // Dataset List page
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
      layout: { cols: { md: 6 } },
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
    columns: {
      type: 'integer',
      title: 'Nombre de colonnes',
      description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
      default: 2,
      minimum: 1,
      maximum: 3
    },
    // Dataset Card
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
    useApplicationThumbnail: {
      type: 'boolean',
      title: 'Utiliser l\'image de l\'application',
      description: 'Permet d\'utiliser l\'image de la première application qui utilise ce jeu de données si aucune image n\'est définie pour le jeu de données.',
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
      layout: 'switch',
      title: 'Afficher le résumé sur la carte',
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
      title: 'Afficher l\'image sur la page d\'un jeu de données',
      description: 'L\'image sera affichée au dessus de la description.',
      default: true
    },
    // Common to both pages
    showDepartment: {
      type: 'boolean',
      layout: 'switch',
      title: 'Afficher le département du propriétaire',
      description: 'Affiche le département du propriétaire si le jeu de données est détenu par un département.',
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
