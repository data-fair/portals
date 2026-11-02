export default {
  $id: 'https://github.com/data-fair/portals/common-dataset-card',
  'x-exports': [],
  title: 'Dataset card',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    title: null,
    children: [
      {
        comp: 'card',
        title: 'Options',
        children: [
          'actionsLocation',
          'actionsStyle',
          'elevation',
          'rounded',
          'hover',
          { cols: { md: 6 }, key: 'titleLinesCount' },
          { cols: { md: 6 }, key: 'ownerDisplay' },
          { cols: { md: 4 }, key: 'showSummary' },
          { cols: { md: 4 }, key: 'showUpdatedAt' },
          { cols: { md: 4 }, key: 'showContentTypes' }
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
      title: 'Action buttons position on card',
      'x-i18n-title': { fr: "Position des boutons d'actions sur la carte" },
      layout: { cols: { md: 6 } },
      default: 'bottom',
      oneOf: [
        { const: 'right', title: 'Right', 'x-i18n-title': { fr: 'À droite' } },
        { const: 'bottom', title: 'Bottom', 'x-i18n-title': { fr: 'En bas' } },
        { const: 'none', title: 'None', 'x-i18n-title': { fr: 'Aucun' } }
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
    elevation: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
      title: 'Card elevation',
      'x-i18n-title': { fr: 'Élévation de la carte' },
      layout: { cols: { md: 6 } }
    },
    rounded: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
      title: 'Card rounded corners',
      'x-i18n-title': { fr: 'Arrondi de la carte' },
      layout: { cols: { md: 6 } }
    },
    hover: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/hoverConfig',
      title: 'Card hover effects',
      'x-i18n-title': { fr: 'Effets au survol de la carte' }
    },
    titleLinesCount: {
      type: 'number',
      title: 'Number of title lines',
      'x-i18n-title': { fr: 'Nombre de lignes pour le titre' },
      description: 'Forces the title to take up exactly N lines.',
      'x-i18n-description': { fr: 'Force le titre à occuper exactement N lignes.' },
      layout: { cols: { md: 6 } },
      default: 2,
      oneOf: [
        { const: 1, title: '1 line', 'x-i18n-title': { fr: '1 ligne' } },
        { const: 2, title: '2 lines', 'x-i18n-title': { fr: '2 lignes' } },
        { const: 0, title: 'No line limit', 'x-i18n-title': { fr: 'Sans limite de lignes' } }
      ]
    },
    showSummary: {
      type: 'boolean',
      title: 'Show summary',
      'x-i18n-title': { fr: 'Afficher le résumé' },
      layout: {
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
    },
    ownerDisplay: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/ownerDisplay',
      layout: { cols: { md: 6 } }
    },
    showUpdatedAt: {
      type: 'boolean',
      title: 'Show update date',
      'x-i18n-title': { fr: 'Afficher la date de mise à jour' },
      layout: {
        comp: 'switch',
        cols: { md: 6 }
      }
    },
    showContentTypes: {
      type: 'boolean',
      title: 'Show available contents',
      'x-i18n-title': { fr: 'Afficher les contenus disponibles' },
      description: 'Indicates whether the dataset offers metadata, data and applications.',
      'x-i18n-description': { fr: 'Indique si le jeu de données propose des métadonnées, des données et des visualisations.' },
      layout: {
        comp: 'switch',
        cols: { md: 6 }
      }
    },
    thumbnail: {
      type: 'object',
      title: 'Dataset card image',
      'x-i18n-title': { fr: 'Image', en: 'Image' },
      layout: {
        comp: 'card',
        children: [
          'show',
          {
            if: 'data?.show === true',
            children: [
              { key: 'location', cols: { md: 4 } },
              { key: 'default', cols: { md: 4 } },
              { key: 'crop', cols: { md: 4 } },
              { key: 'useTopic', cols: { md: 4 } },
              { key: 'useApplication', cols: { md: 4 } },
              { key: 'useSummary', cols: { md: 4 } },
              { markdown: '**Priority order:**\n1. **Specific image** (set directly on the dataset)\n2. **Topic image** (if enabled)\n3. **Application image** (if enabled)\n4. **Default image** (if set)\n5. **Dataset summary** (if enabled)', 'x-i18n-markdown': { fr: '**Ordre de priorité :**\n1. **Image spécifique** (définie directement sur le jeu de données)\n2. **Image de la thématique** (si activé)\n3. **Image de la visualisation** (si activé)\n4. **Image par défaut** (si définie)\n5. **Résumé du jeu de données** (si activé)' } }
            ]
          }
        ]
      },
      properties: {
        show: {
          type: 'boolean',
          title: 'Show image',
          'x-i18n-title': { fr: "Afficher l'image" },
          layout: 'switch',
          default: true
        },
        location: {
          type: 'string',
          title: 'Image position on card',
          'x-i18n-title': { fr: "Position de l'image sur la carte" },
          default: 'center',
          oneOf: [
            { const: 'left', title: 'Left', 'x-i18n-title': { fr: 'À gauche' } },
            { const: 'top', title: 'Top', 'x-i18n-title': { fr: 'En haut' } },
            { const: 'center', title: 'Below title', 'x-i18n-title': { fr: 'Sous le titre' } }
          ]
        },
        crop: {
          type: 'boolean',
          title: 'Crop image for uniform appearance',
          'x-i18n-title': { fr: "Recadrer l'image pour un rendu uniforme" },
          description: 'If disabled, the image will keep its original ratio',
          'x-i18n-description': { fr: "Si désactivé, l'image gardera son ratio d'origine" },
          layout: 'switch',
          default: true
        },
        default: {
          type: 'object',
          title: 'Default image',
          'x-i18n-title': { fr: 'Image par défaut' },
          description: 'Image to display if no image is set for the dataset.',
          'x-i18n-description': { fr: "Image à afficher si le jeu de données n'a pas d'image définie." },
          required: ['_id', 'name', 'mimeType'],
          layout: {
            slots: {
              component: {
                name: 'image-upload',
                props: { width: 1280, label: 'Default image', 'x-i18n-label': { fr: 'Image par défaut' } }
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
          title: 'Use the first topic image',
          'x-i18n-title': { fr: "Utiliser l'image de la première thématique" },
          description: "Use the image of the dataset's first topic when no image is set for it.",
          'x-i18n-description': { fr: "Permet d'utiliser l'image de la première thématique du jeu de données si aucune image n'est définie pour ce dernier." },
          layout: 'switch'
        },
        useApplication: {
          type: 'boolean',
          title: 'Use the first application image',
          'x-i18n-title': { fr: "Utiliser l'image de la première visualisation" },
          description: 'Use the image of the first application that uses this dataset when no image is set for it.',
          'x-i18n-description': { fr: "Permet d'utiliser l'image de la première visualisation qui utilise ce jeu de données si aucune image n'est définie pour ce dernier." },
          layout: 'switch'
        },
        useSummary: {
          type: 'boolean',
          title: 'Use the dataset summary',
          'x-i18n-title': { fr: 'Utiliser le résumé du jeu de données' },
          description: "Use the dataset's summary when no image is available and when 'Show summary' is not enabled. Only available when the image is positioned below the title.",
          'x-i18n-description': { fr: "Permet d'utiliser le résumé du jeu de données si aucune image n'est disponible et si l'option 'Afficher le résumé' n'est pas activée. Disponible uniquement lorsque l'image est positionnée sous le titre." },
          layout: { comp: 'switch', if: "parent.data?.location === 'center'" }
        }
      }
    },
    topics: {
      type: 'object',
      title: 'TopicsConfig',
      'x-i18n-title': {
        en: 'Topics',
        fr: 'Thématiques'
      },
      layout: {
        comp: 'card',
        children: [
          'show',
          {
            if: 'data?.show === true',
            children: [
              { key: 'color', cols: { md: 4 } },
              { key: 'elevation', cols: { md: 4 } },
              { key: 'density', cols: { md: 4 } },
              { key: 'rounded', cols: { md: 4 } },
              { key: 'variant', cols: { md: 4 } },
              { key: 'showIcon', cols: { md: 4 } },
              { key: 'iconColor', cols: { md: 4 } }
            ]
          }
        ]
      },
      properties: {
        show: {
          type: 'boolean',
          title: 'Show topics',
          'x-i18n-title': { fr: 'Afficher les thématiques' },
          layout: 'switch',
        },
        color: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics'
        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation'
        },
        density: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density'
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded'
        },
        variant: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/variant'
        },
        showIcon: {
          type: 'boolean',
          title: 'Show icon',
          'x-i18n-title': { fr: "Afficher l'icône" },
          layout: { comp: 'switch' },
          default: true
        },
        iconColor: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics',
          title: 'Icon color',
          'x-i18n-title': { fr: "Couleur de l'icône" },
          layout: {
            if: 'parent.data?.showIcon === true',
          }
        }
      }
    },
    keywords: {
      type: 'object',
      title: 'KeywordsConfig',
      'x-i18n-title': {
        en: 'Keywords',
        fr: 'Mots-clés'
      },
      layout: {
        comp: 'card',
        children: [
          'show',
          {
            if: 'data?.show === true',
            children: [
              { key: 'color', cols: { md: 4 } },
              { key: 'elevation', cols: { md: 4 } },
              { key: 'density', cols: { md: 4 } },
              { key: 'rounded', cols: { md: 4 } },
              { key: 'variant', cols: { md: 4 } }
            ]
          }
        ]
      },
      properties: {
        show: {
          type: 'boolean',
          title: 'Show keywords',
          'x-i18n-title': { fr: 'Afficher les mots-clés' },
          layout: 'switch'
        },
        color: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color'
        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation'
        },
        density: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density'
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded'
        },
        variant: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/variant'
        }
      }
    }
  }
}
