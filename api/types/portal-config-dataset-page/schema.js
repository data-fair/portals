import { inheritedStyleLayout } from '../common-defs/schema.ts'

export default {
  $id: 'https://github.com/data-fair/portals/portal-config-dataset-page',
  'x-exports': [],
  title: 'Dataset Page',
  'x-i18n-title': {
    fr: "Page d'un jeu de données",
    en: 'Dataset page'
  },
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    children: [
      {
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
      'topics',
      'keywords',
      'applications',
      'reuses',
      'relatedDatasets'
    ]
  },
  properties: {
    showData: {
      type: 'boolean',
      title: 'Show the "Data" section',
      'x-i18n-title': { fr: 'Afficher la section "Données"' },
      description: 'Shows a section with the "Table", "Map", "Schema",... tabs depending on the available views.',
      'x-i18n-description': { fr: 'Affiche une section avec les onglets "Tableau", "Carte", "Schéma",... en fonction des vues disponibles.' },
      layout: 'switch'
    },

    showImage: {
      type: 'boolean',
      title: 'Show image',
      'x-i18n-title': { fr: "Afficher l'image" },
      description: 'The image will be displayed above the description.  \n**Only the image specific to the dataset will be displayed**, topic,  \napplication or default images are ignored on this page.',
      'x-i18n-description': { fr: "L'image sera affichée au-dessus de la description.  \n**Seule l'image spécifique au jeu de données sera affichée**, les images de thématique,  \nd'application ou par défaut sont ignorées sur cette page." },
      layout: 'switch'
    },

    showAttachments: {
      type: 'boolean',
      title: 'Show link-type attachments',
      'x-i18n-title': { fr: 'Afficher les pièces jointes de type lien' },
      description: "Displays link-type attachments directly on the page in an iframe.\n\n**Important**: For the IFrame integration to work correctly, you must add the URL's domain name in **General settings** → **Security**.",
      'x-i18n-description': { fr: "Affiche directement sur la page en iframe les pièces jointes de type lien.\n\n**Important** : Pour que l'intégration IFrame fonctionne correctement, vous devez ajouter le nom de domaine de l'URL dans **Paramètres généraux** → **Sécurité**." },
      layout: 'switch'
    },

    titleStyle: {
      type: 'object',
      title: 'Dataset page section titles',
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
      title: 'Dataset page metadata',
      'x-i18n-title': { fr: 'Métadonnées', en: 'Metadata' },
      layout: { comp: 'card' },
      properties: {
        location: {
          type: 'string',
          title: 'Metadata position',
          'x-i18n-title': { fr: 'Position des métadonnées' },
          layout: { cols: { md: 4 } },
          default: 'right',
          oneOf: [
            { const: 'top', title: 'Below title', 'x-i18n-title': { fr: 'Sous le titre' } },
            { const: 'bottom', title: 'Below description', 'x-i18n-title': { fr: 'Sous la description' } },
            { const: 'right', title: 'Right', 'x-i18n-title': { fr: 'À droite' } }
          ]
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
          layout: { cols: { md: 4 }, ...inheritedStyleLayout }
        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          layout: { cols: { md: 4 }, ...inheritedStyleLayout }
        },
        actionButtons: {
          type: 'array',
          title: 'Action Buttons',
          'x-i18n-title': {
            fr: "Boutons d'actions",
            en: 'Action buttons'
          },
          layout: { cols: { md: 8 } },
          items: {
            type: 'string',
            oneOf: [
              { const: 'download', title: 'Download', 'x-i18n-title': { fr: 'Télécharger' } },
              { const: 'api', title: 'API' },
              { const: 'embed', title: 'Embed', 'x-i18n-title': { fr: 'Intégrer' } },
              { const: 'notifications', title: 'Notifications' },
              { const: 'attachments', title: 'Attachments', 'x-i18n-title': { fr: 'Pièces jointes' } },
              { const: 'table', title: 'Table', 'x-i18n-title': { fr: 'Tableau' } },
              { const: 'map', title: 'Map', 'x-i18n-title': { fr: 'Carte' } },
              { const: 'schema', title: 'Schema', 'x-i18n-title': { fr: 'Schéma' } }
            ]
          }
        },

        actionsStyle: {
          type: 'string',
          title: 'Action buttons style',
          'x-i18n-title': { fr: "Style des boutons d'actions" },
          layout: { cols: { md: 4 } },
          default: 'full',
          oneOf: [
            { const: 'icon', title: 'Icon only', 'x-i18n-title': { fr: 'Icône seulement' } },
            { const: 'full', title: 'Icon and text', 'x-i18n-title': { fr: 'Icône et texte' } },
            { const: 'text', title: 'Text only', 'x-i18n-title': { fr: 'Texte seulement' } }
          ]
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
        showAttachments: {
          type: 'boolean',
          title: 'Show attachments',
          'x-i18n-title': { fr: 'Afficher les pièces jointes' },
          description: 'Shows the attachments directly in the metadata.',
          'x-i18n-description': { fr: 'Affiche les pièces jointes directement dans les métadonnées.' },
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          }
        }
      }
    },

    topics: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/topicsConfig'
    },

    keywords: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/keywordsConfig'
    },

    applications: {
      type: 'object',
      title: 'Dataset page applications',
      'x-i18n-title': { fr: 'Visualisations associées', en: 'Related applications' },
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
          default: 'side-by-side',
          layout: { cols: { md: 4 } },
          oneOf: [
            { const: 'none', title: 'None', 'x-i18n-title': { fr: 'Aucun' } },
            { const: 'card', title: 'Card', 'x-i18n-title': { fr: 'Vignette' } },
            { const: 'full-list', title: 'Full-page list', 'x-i18n-title': { fr: 'Liste pleine page' } },
            { const: 'side-by-side', title: 'Alternating list', 'x-i18n-title': { fr: 'Liste en alternance' } }
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
          $ref: 'https://github.com/data-fair/portals/common-application-card'
        }
      }
    },

    reuses: {
      type: 'object',
      title: 'Dataset page reuses',
      'x-i18n-title': { fr: 'Réutilisations', en: 'Reuses' },
      layout: {
        comp: 'card',
        children: [
          'display',
          {
            children: [
              'inviteUserReuses',
              'columns',
              'useGlobalCard',
            ]
          },
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
          default: 'none',
          layout: { cols: { md: 4 } },
          oneOf: [
            { const: 'none', title: 'None', 'x-i18n-title': { fr: 'Aucun' } },
            { const: 'card', title: 'Card', 'x-i18n-title': { fr: 'Vignette' } }
          ]
        },
        inviteUserReuses: {
          type: 'boolean',
          title: 'Invite users to suggest a reuse',
          'x-i18n-title': { fr: 'Inviter les utilisateurs à proposer une réutilisation' },
          description: 'Make the reuses section always visible. A message invites your users to suggest some from their personal space.',
          'x-i18n-description': { fr: 'Rendre la section réutilisations visible en permanence. Un message invite vos utilisateurs à en proposer depuis leur espace personnel.' },
          layout: {
            if: 'parent.data?.display === "card" && rootData.reuses?.allowUserReuses',
            comp: 'switch',
            cols: { md: 4 }
          },
        },
        columns: {
          type: 'integer',
          title: 'Number of columns',
          'x-i18n-title': { fr: 'Nombre de colonnes' },
          description: 'Number of columns used on large screens. The number of columns will be reduced on smaller screens.',
          'x-i18n-description': { fr: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.' },
          layout: { if: 'parent.data?.display === "card"', cols: { md: 4 } },
          default: 3,
          minimum: 1,
          maximum: 4
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
          $ref: 'https://github.com/data-fair/portals/common-reuse-card'
        }
      }
    },

    relatedDatasets: {
      type: 'object',
      title: 'Dataset page related datasets',
      'x-i18n-title': { fr: 'Jeux de données liés', en: 'Related datasets' },
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
