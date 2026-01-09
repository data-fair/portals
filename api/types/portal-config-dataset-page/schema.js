export default {
  $id: 'https://github.com/data-fair/portals/portal-config-dataset-page',
  'x-exports': [],
  title: 'Dataset Page',
  'x-i18n-title': {
    fr: "Page d'un jeu de données"
  },
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    children: [{
      comp: 'card',
      title: 'Options',
      children: [
        { cols: { md: 4 }, key: 'showImage' },
        { cols: { md: 4 }, key: 'showData' },
        { cols: { md: 4 }, key: 'showAttachments' },
      ]
    },
    'titleStyle',
    'metadata',
    'applications',
    'reuses'
    ]
  },
  properties: {
    showData: {
      type: 'boolean',
      title: 'Afficher la section "Données"',
      description: 'Affiche une section avec les onglets "Tableau", "Carte", "Schéma",... en fonction des vues disponibles.',
      layout: { comp: 'switch' }
    },

    showImage: {
      type: 'boolean',
      title: "Afficher l'image",
      description: "L'image sera affichée au dessus de la description.",
      layout: { comp: 'switch' },
      default: true
    },

    showAttachments: {
      type: 'boolean',
      title: 'Afficher les pièces jointes de type lien',
      description: "Affiche directement sur la page en iframe les pièces jointes de type lien.\n\n**Important** : Pour que l'intégration IFrame fonctionne correctement, vous devez ajouter le nom de domaine de l'URL dans **Paramètres généraux** → **Sécurité**.",
      layout: { comp: 'switch' }
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
          layout: { cols: { md: 4 } },
          default: 'right',
          oneOf: [
            { const: 'top', title: 'Sous le titre' },
            { const: 'bottom', title: 'Sous la description' },
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
          title: 'Afficher le propriétaire',
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          },
          default: true
        },
        showAttachments: {
          type: 'boolean',
          title: 'Afficher les pièces jointes',
          description: 'Affiche les pièces jointes directement dans les métadonnées.',
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          }
        }
      }
    },

    applications: {
      type: 'object',
      title: 'Configuration des visualisations',
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
          default: 'side-by-side',
          layout: { cols: { md: 4 } },
          oneOf: [
            { const: 'none', title: 'Aucun' },
            { const: 'card', title: 'Vignette' },
            { const: 'full-list', title: 'Liste pleine page' },
            { const: 'side-by-side', title: 'Liste en alternance' }
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
          $ref: 'https://github.com/data-fair/portals/portal-config-application-card'
        }
      }
    },

    reuses: {
      type: 'object',
      title: 'Configuration des réutilisations',
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
          default: 'none',
          layout: { cols: { md: 4 } },
          oneOf: [
            { const: 'none', title: 'Aucun' },
            { const: 'card', title: 'Vignette' }
          ]
        },
        columns: {
          type: 'integer',
          title: 'Nombre de colonnes',
          description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
          layout: { if: 'parent.data?.display === "card"', cols: { md: 4 } },
          default: 3,
          minimum: 1,
          maximum: 4
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
          $ref: 'https://github.com/data-fair/portals/portal-config-reuse-card'
        }
      }
    }
  }
}
