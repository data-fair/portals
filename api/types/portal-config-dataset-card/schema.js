export default {
  $id: 'https://github.com/data-fair/portals/portal-config-dataset-card',
  'x-exports': [],
  title: 'Dataset card',
  'x-i18n-title': {
    fr: "Vignette d'un jeu de données"
  },
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    children: [{
      comp: 'card',
      title: 'Options',
      children: [
        'actionsLocation',
        'actionsStyle',
        'elevation',
        'rounded',
        'titleLinesCount',
        'showSummary',
        'showDepartment'
      ]
    },
    'thumbnail',
    'topics',
    'keywords'
    ]
  },
  properties: {
    actionsLocation: {
      type: 'string',
      title: "Position des boutons d'actions sur la carte",
      layout: { cols: { md: 6 } },
      default: 'bottom',
      oneOf: [
        { const: 'right', title: 'À droite' },
        { const: 'bottom', title: 'En bas' },
        { const: 'none', title: 'Aucun' }
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
    elevation: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
      title: 'Élévation de la carte',
      layout: { cols: { md: 6 } }
    },
    rounded: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
      title: 'Arrondi de la carte',
      layout: { cols: { md: 6 } }
    },
    titleLinesCount: {
      type: 'number',
      title: 'Nombre de lignes pour le titre',
      description: 'Force le titre à occuper exactement N lignes.',
      layout: { cols: { md: 6 } },
      default: 2,
      oneOf: [
        { const: 1, title: '1 ligne' },
        { const: 2, title: '2 lignes' },
        { const: 0, title: 'Sans limite de lignes' }
      ]
    },
    showSummary: {
      type: 'boolean',
      title: 'Afficher le résumé',
      layout: {
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
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
    thumbnail: {
      type: 'object',
      title: "Configuration de l'image",
      layout: {
        comp: 'card',
        children: [
          'show',
          {
            if: 'data?.show === true',
            children: [
              { key: 'location', cols: { md: 6 } },
              { key: 'crop', cols: { md: 6 } },
              { key: 'default', cols: { md: 4 } },
              { key: 'useTopic', cols: { md: 4 } },
              { key: 'useApplication', cols: { md: 4 } }
            ]
          },
        ]
      },
      properties: {
        show: {
          type: 'boolean',
          title: "Afficher l'image",
          layout: 'switch',
          default: true
        },
        location: {
          type: 'string',
          title: "Position de l'image sur la carte",
          layout: { cols: { md: 6 } },
          default: 'center',
          oneOf: [
            { const: 'left', title: 'À gauche' },
            { const: 'top', title: 'En haut' },
            { const: 'center', title: 'Sous le titre' }
          ]
        },
        crop: {
          type: 'boolean',
          title: "Recadrer l'image pour un rendu uniforme",
          description: "Si désactivé, l'image gardera son ratio d'origine",
          layout: 'switch',
          default: true
        },
        default: {
          type: 'object',
          title: 'Image par défaut',
          description: "Image à afficher si le jeu de données n'a pas d'image définie.",
          required: ['_id', 'name', 'mimeType'],
          layout: {
            slots: {
              component: {
                name: 'image-upload',
                props: { width: 1280, label: 'Image par défaut' }
              }
            }
          },
          properties: {
            _id: {
              type: 'string'
            },
            name: {
              type: 'string'
            },
            mimeType: {
              type: 'string'
            },
            mobileAlt: {
              type: 'boolean'
            }
          }
        },
        useTopic: {
          type: 'boolean',
          title: "Utiliser l'image de la première thématique",
          description: "Permet d'utiliser l'image de la première thématique du jeu de données si aucune image n'est définie pour ce dernier.",
          layout: 'switch',
          default: false
        },
        useApplication: {
          type: 'boolean',
          title: "Utiliser l'image de la première application",
          description: "Permet d'utiliser l'image de la première application qui utilise ce jeu de données si aucune image n'est définie pour ce dernier.",
          layout: 'switch',
          default: false
        }
      }
    },
    topics: {
      type: 'object',
      title: 'Configuration des thématiques',
      layout: {
        comp: 'card',
        children: [
          'show',
          {
            if: 'data?.show === true',
            children: [
              { key: 'color', cols: { md: 6 } },
              { key: 'elevation', cols: { md: 6 } },
              { key: 'density', cols: { md: 6 } },
              { key: 'rounded', cols: { md: 6 } },
              { key: 'showIcon', cols: { md: 6 } },
              { key: 'iconColor', cols: { md: 6 } }
            ]
          }
        ]
      },
      properties: {
        show: {
          type: 'boolean',
          title: 'Afficher les thématiques',
          layout: 'switch',
        },
        color: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics',
        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
        },
        density: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density',
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
        },
        showIcon: {
          type: 'boolean',
          title: 'Afficher les icônes',
          layout: {
            comp: 'switch',
          },
          default: true
        },
        iconColor: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics',
          title: 'Couleur des icônes',
          layout: {
            if: 'parent.data?.showIcon === true',
          }
        }
      }
    },
    keywords: {
      type: 'object',
      title: 'Configuration des mots-clés',
      layout: {
        comp: 'card',
        children: [
          'show',
          {
            if: 'data?.show === true',
            children: [
              'color',
              'elevation',
              'density',
              'rounded'
            ]
          }
        ]
      },
      properties: {
        show: {
          type: 'boolean',
          title: 'Afficher les mots-clés',
          layout: 'switch'
        },
        color: {
          type: 'string',
          title: 'Couleur',
          layout: { cols: { md: 6 } },
          oneOf: [
            { const: 'primary', title: 'Primaire' },
            { const: 'secondary', title: 'Secondaire' },
            { const: 'accent', title: 'Accentuée' }
          ]
        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          layout: { cols: { md: 6 } }
        },
        density: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density',
          layout: { cols: { md: 6 } }
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
          layout: { cols: { md: 6 } }
        }
      }
    }
  }
}
