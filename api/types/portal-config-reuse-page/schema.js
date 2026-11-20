export default {
  $id: 'https://github.com/data-fair/portals/portal-config-reuse-page',
  'x-exports': [],
  title: 'Reuse Page',
  'x-i18n-title': {
    fr: "Page d'une réutilisation",
    en: 'Reuse page'
  },
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    children: [{
      comp: 'card',
      title: 'Options',
      children: [
        { cols: { md: 6 }, key: 'showImage' }
      ]
    },
    'titleStyle',
    'datasets'
    ]
  },
  properties: {
    showImage: {
      type: 'boolean',
      title: 'Show image',
      'x-i18n-title': { fr: "Afficher l'image" },
      description: 'The image will be displayed below the description.',
      'x-i18n-description': { fr: "L'image sera affichée en dessous de la description." },
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      },
      default: true
    },

    titleStyle: {
      type: 'object',
      title: 'Reuse page section titles',
      'x-i18n-title': { fr: 'Titres de section', en: 'Section titles' },
      layout: { comp: 'card' },
      properties: {
        position: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/linePosition',
          layout: { cols: { md: 6 } }
        },
        color: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color',
          title: 'Line color',
          'x-i18n-title': { fr: 'Couleur du trait' },
          layout: { cols: { md: 6 } }
        }
      }
    },

    datasets: {
      type: 'object',
      title: 'Reuse page datasets',
      'x-i18n-title': { fr: 'Jeux de données', en: 'Datasets' },
      layout: {
        comp: 'card',
        children: [
          'display',
          'columns',
          'useGlobalCard',
          {
            if: 'data?.display === "card" && data?.useGlobalCard === false',
            children: ['card']
          }
        ]
      },
      properties: {
        display: {
          type: 'string',
          title: 'Display mode',
          'x-i18n-title': { fr: "Mode d'affichage" },
          default: 'card',
          layout: { cols: { md: 4 } },
          oneOf: [
            { const: 'none', title: 'None', 'x-i18n-title': { fr: 'Aucun' } },
            { const: 'card', title: 'Card', 'x-i18n-title': { fr: 'Vignette' } }
          ]
        },
        columns: {
          type: 'integer',
          title: 'Number of columns',
          'x-i18n-title': { fr: 'Nombre de colonnes' },
          description: 'Number of columns used on large screens. The number of columns will be reduced on smaller screens.',
          'x-i18n-description': { fr: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.' },
          layout: { if: 'parent.data?.display === "card"', cols: { md: 4 } },
          default: 2,
          minimum: 1,
          maximum: 3
        },
        useGlobalCard: {
          type: 'boolean',
          title: 'Use the global card configuration',
          'x-i18n-title': { fr: 'Utiliser la configuration globale des vignettes' },
          layout: {
            if: 'parent.data?.display === "card"',
            comp: 'switch',
            cols: { md: 4 }
          },
          default: true
        },
        card: {
          $ref: 'https://github.com/data-fair/portals/common-dataset-card'
        }
      }
    }
  }
}
