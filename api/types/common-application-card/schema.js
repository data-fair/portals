export default {
  $id: 'https://github.com/data-fair/portals/common-application-card',
  'x-exports': [],
  title: 'Application Card',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    title: null,
    children: [{
      comp: 'card',
      title: 'Options',
      children: [
        { cols: { md: 6 }, key: 'actionsLocation' },
        { cols: { md: 6 }, key: 'actionsStyle' },
        { cols: { md: 6 }, key: 'elevation' },
        { cols: { md: 6 }, key: 'rounded' },
        'hover',
        { cols: { md: 6 }, key: 'titleLinesCount' },
        { cols: { md: 6 }, key: 'ownerDisplay' },
        { cols: { md: 4 }, key: 'openInFullPage' },
        { cols: { md: 4 }, key: 'showSummary' },
        { cols: { md: 4 }, key: 'showUpdatedAt' }
      ]
    },
    'thumbnail',
    'topics'
    ]
  },
  properties: {
    actionsLocation: {
      type: 'string',
      title: 'Action buttons position on card',
      'x-i18n-title': { fr: "Position des boutons d'actions sur la carte" },
      layout: { cols: { md: 4 }, if: 'parent.data?.openInFullPage !== true' },
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
      layout: { cols: { md: 4 }, if: 'parent.data?.openInFullPage !== true' },
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
      layout: { cols: { md: 4 } }
    },
    rounded: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
      title: 'Card rounded corners',
      'x-i18n-title': { fr: 'Arrondi de la carte' },
      layout: { cols: { md: 4 } }
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
      layout: { cols: { md: 4 } },
      default: 2,
      oneOf: [
        { const: 1, title: '1 line', 'x-i18n-title': { fr: '1 ligne' } },
        { const: 2, title: '2 lines', 'x-i18n-title': { fr: '2 lignes' } },
        { const: 0, title: 'No line limit', 'x-i18n-title': { fr: 'Sans limite de lignes' } }
      ]
    },
    openInFullPage: {
      type: 'boolean',
      title: 'Open the application in fullscreen',
      'x-i18n-title': { fr: 'Ouvrir la visualisation en plein écran' },
      description: 'Clicking the card opens the application in fullscreen instead of displaying the detail page. The "Preview" and "Fullscreen" buttons of the card are then hidden.',
      'x-i18n-description': { fr: 'Au clic sur la vignette, l\'application s\'ouvre en plein écran au lieu d\'afficher la page de détail. Les boutons "Aperçu" et "Plein écran" de la carte sont alors masqués.' },
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      },
      default: false
    },
    showSummary: {
      type: 'boolean',
      title: 'Show summary',
      'x-i18n-title': { fr: 'Afficher le résumé' },
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      },
      default: true
    },
    ownerDisplay: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/ownerDisplay'
    },
    showUpdatedAt: {
      type: 'boolean',
      title: 'Show update date',
      'x-i18n-title': { fr: 'Afficher la date de mise à jour' },
      layout: 'switch'
    },
    thumbnail: {
      type: 'object',
      title: 'Application card image',
      'x-i18n-title': { fr: 'Image', en: 'Image' },
      layout: {
        comp: 'card',
        children: [
          'show',
          {
            if: 'data?.show === true',
            children: [
              'location',
              'crop',
              'useTopic',
              'useSummary',
              { markdown: '**Priority order:**\n1. **Specific image** (set directly on the application)\n2. **Topic image** (if enabled)\n3. **Application summary** (if enabled)\n4. **Automatic capture** of the application', 'x-i18n-markdown': { fr: '**Ordre de priorité :**\n1. **Image spécifique** (définie directement sur la visualisation)\n2. **Image de la thématique** (si activé)\n3. **Résumé de la visualisation** (si activé)\n4. **Capture automatique** de la visualisation' } }
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
          layout: { cols: { md: 6 } },
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
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          },
          default: true
        },
        useTopic: {
          type: 'boolean',
          title: 'Use the first topic image',
          'x-i18n-title': { fr: "Utiliser l'image de la première thématique" },
          description: "Use the image of the application's first topic when no image is set for it.",
          'x-i18n-description': { fr: "Permet d'utiliser l'image de la première thématique de la visualisation si aucune image n'est définie pour cette dernière." },
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          }
        },
        useSummary: {
          type: 'boolean',
          title: 'Use the application summary',
          'x-i18n-title': { fr: 'Utiliser le résumé de la visualisation' },
          description: 'Shows the application summary if available, instead of the automatic capture. Only available when the image is positioned below the title.',
          'x-i18n-description': { fr: "Affiche le résumé de la visualisation si disponible, à la place de la capture automatique. Disponible uniquement lorsque l'image est positionnée sous le titre." },
          layout: {
            comp: 'switch',
            cols: { md: 6 },
            if: "parent.data?.location === 'center'"
          }
        },
      }
    },
    topics: {
      type: 'object',
      title: 'Application card topics',
      'x-i18n-title': { fr: 'Thématiques', en: 'Topics' },
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
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics' },
        elevation: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation' },
        density: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density' },
        rounded: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded' },
        variant: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/variant' },
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
            if: 'parent.data?.showIcon === true'
          }
        }
      }
    }
  }
}
