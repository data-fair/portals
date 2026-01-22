export default {
  $id: 'https://github.com/data-fair/portals/portal-config-application-page',
  'x-exports': [],
  title: 'Application Page',
  'x-i18n-title': {
    fr: "Page d'une visualisation"
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
    'datasets'
    ]
  },
  properties: {
    showImage: {
      type: 'boolean',
      title: "Afficher l'image",
      description: "L'image sera affichée au dessus de la description.",
      layout: 'switch'
    },
    titleStyle: {
      type: 'object',
      title: 'Configuration des titres',
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
      title: 'Configuration des métadonnées',
      layout: { comp: 'card' },
      properties: {
        location: {
          type: 'string',
          title: 'Position des métadonnées',
          layout: { cols: { md: 6 } },
          default: 'right',
          oneOf: [
            { const: 'top', title: 'Sous le titre' },
            { const: 'bottom', title: 'Sous la description' },
            { const: 'right', title: 'À droite' }
          ]
        },
        actionsStyle: {
          type: 'string',
          title: "Style des boutons d'actions",
          layout: { cols: { md: 6 } },
          default: 'full',
          oneOf: [
            { const: 'icon', title: 'Icône seulement' },
            { const: 'full', title: 'Icône et texte' },
            { const: 'text', title: 'Texte seulement' }
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
          title: 'Afficher le propriétaire',
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          },
          default: true
        }
      }
    },

    datasets: {
      type: 'object',
      title: 'Configuration des jeux de données',
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
          title: "Mode d'affichage",
          default: 'card',
          layout: { cols: { md: 4 } },
          oneOf: [
            { const: 'none', title: 'Aucun' },
            { const: 'card', title: 'Vignette' },
          ]
        },
        columns: {
          type: 'integer',
          title: 'Nombre de colonnes',
          description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
          layout: { if: 'parent.data?.display === "card"', cols: { md: 4 } },
          default: 2,
          minimum: 1,
          maximum: 3
        },
        useGlobalCard: {
          type: 'boolean',
          title: 'Utiliser la configuration globale des vignettes',
          layout: {
            if: 'parent.data?.display === "card"',
            comp: 'switch',
            cols: { md: 4 }
          },
          default: true
        },
        card: {
          $ref: 'https://github.com/data-fair/portals/portal-config-dataset-card'
        }
      }
    }
  }
}
