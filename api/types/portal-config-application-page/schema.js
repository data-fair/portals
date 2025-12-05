export default {
  $id: 'https://github.com/data-fair/portals/portal-config-application-page',
  'x-exports': [],
  title: 'Application Page',
  'x-i18n-title': {
    fr: "Page d'une visualisation"
  },
  type: 'object',
  unevaluatedProperties: false,
  properties: {
    showImage: {
      type: 'boolean',
      title: "Afficher l'image",
      description: "L'image sera affichée au dessus de la description.",
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      },
      default: true
    },

    titleStyle: {
      type: 'object',
      title: 'Configuration des titres',
      layout: { comp: 'card' },
      properties: {
        position: {
          type: 'string',
          title: 'Display a line',
          'x-i18n-title': {
            fr: 'Afficher un trait'
          },
          layout: { cols: { md: 4 } },
          oneOf: [
            { const: 'none', title: 'Aucun trait' },
            { const: 'left', title: 'Trait à gauche du titre' },
            { const: 'bottom-small', title: 'Petit trait sous le titre' },
            { const: 'bottom-medium', title: 'Trait sous le titre (largeur du texte)' },
            { const: 'bottom-large', title: 'Trait pleine largeur sous le titre' }
          ],
          default: 'none'
        },
        color: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color',
          layout: { cols: { md: 4 } },
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
          layout: { cols: { md: 4 } },
          default: 'right',
          oneOf: [
            { const: 'top', title: 'Sous le titre' },
            { const: 'bottom', title: 'Entre la description et les applications' },
            { const: 'right', title: 'À droite' }
          ]
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
          layout: { cols: { md: 4 } }
        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          layout: { cols: { md: 4 } }
        },
        actionButtons: {
          type: 'array',
          title: 'Action Buttons',
          'x-i18n-title': {
            fr: "Boutons d'actions"
          },
          layout: { cols: { md: 8 } },
          items: {
            type: 'string',
            oneOf: [
              { const: 'download', title: 'Télécharger' },
              { const: 'api', title: 'API' },
              { const: 'embed', title: 'Intégrer' },
              { const: 'notifications', title: 'Notifications' },
              { const: 'attachments', title: 'Pièces jointes' },
              { const: 'table', title: 'Tableau' },
              { const: 'map', title: 'Carte' },
              { const: 'schema', title: 'Schéma' }
            ]
          }
        },

        actionsStyle: {
          type: 'string',
          title: "Style des boutons d'actions",
          layout: { cols: { md: 4 } },
          default: 'full',
          oneOf: [
            { const: 'icon', title: 'Icône seulement' },
            { const: 'full', title: 'Icône et texte' },
            { const: 'text', title: 'Texte seulement' }
          ]
        },
        showDepartment: {
          type: 'boolean',
          title: 'Afficher le département du propriétaire',
          layout: {
            comp: 'switch',
            cols: { md: 4 }
          },
          default: true
        },
        showAttachments: {
          type: 'boolean',
          title: 'Afficher les pièces jointes',
          description: 'Affiche les pièces jointes directement dans les métadonnées.',
          layout: {
            comp: 'switch',
            cols: { md: 4 }
          }
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
