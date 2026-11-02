export default {
  $id: 'https://github.com/data-fair/portals/portal-config-application-page',
  'x-exports': [],
  title: 'Application Page',
  'x-i18n-title': {
    fr: "Page d'une visualisation",
    en: 'Application page'
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
    'metadata',
    'topics',
    'datasets'
    ]
  },
  properties: {
    showImage: {
      type: 'boolean',
      title: 'Show image',
      'x-i18n-title': { fr: "Afficher l'image" },
      description: 'The image will be displayed above the description.',
      'x-i18n-description': { fr: "L'image sera affichée au-dessus de la description." },
      layout: 'switch'
    },
    titleStyle: {
      type: 'object',
      title: 'Application page section titles',
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
    metadata: {
      type: 'object',
      title: 'Application page metadata',
      'x-i18n-title': { fr: 'Métadonnées', en: 'Metadata' },
      layout: { comp: 'card' },
      properties: {
        location: {
          type: 'string',
          title: 'Metadata position',
          'x-i18n-title': { fr: 'Position des métadonnées' },
          layout: { cols: { md: 6 } },
          default: 'right',
          oneOf: [
            { const: 'top', title: 'Below title', 'x-i18n-title': { fr: 'Sous le titre' } },
            { const: 'bottom', title: 'Below description', 'x-i18n-title': { fr: 'Sous la description' } },
            { const: 'right', title: 'Right', 'x-i18n-title': { fr: 'À droite' } }
          ]
        },
        actionsStyle: {
          type: 'string',
          title: 'Action buttons style',
          'x-i18n-title': { fr: "Style des boutons d'actions" },
          layout: { cols: { md: 6 } },
          default: 'full',
          oneOf: [
            { const: 'icon', title: 'Icon only', 'x-i18n-title': { fr: 'Icône seulement' } },
            { const: 'full', title: 'Icon and text', 'x-i18n-title': { fr: 'Icône et texte' } },
            { const: 'text', title: 'Text only', 'x-i18n-title': { fr: 'Texte seulement' } }
          ]
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
          layout: { cols: { md: 6 } }
        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          layout: { cols: { md: 6 } }
        },
        showDepartment: {
          type: 'boolean',
          title: 'Show owner',
          'x-i18n-title': { fr: 'Afficher le propriétaire' },
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          },
          default: true
        },
        showBaseApplication: {
          type: 'boolean',
          title: 'Show base application',
          'x-i18n-title': { fr: "Afficher l'application de base" },
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          },
          default: true
        }
      }
    },

    topics: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/topicsConfig'
    },

    datasets: {
      type: 'object',
      title: 'Application page datasets',
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
            { const: 'card', title: 'Card', 'x-i18n-title': { fr: 'Vignette' } },
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
