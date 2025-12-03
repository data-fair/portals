export default {
  $id: 'https://github.com/data-fair/portals/portal-config-use-card',
  'x-exports': [],
  title: 'Use Card',
  'x-i18n-title': {
    fr: "Vignette d'une réutilisation"
  },
  type: 'object',
  layout: { title: null },
  unevaluatedProperties: false,
  properties: {
    elevation: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
      title: 'Card elevation',
      'x-i18n-title': {
        fr: 'Élévation de la carte'
      },
      layout: { cols: { md: 6 } }
    },
    rounded: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
      title: 'Card rounded corners',
      'x-i18n-title': {
        fr: 'Arrondi de la carte'
      },
      layout: { cols: { md: 6 } }
    },
    showSummary: {
      type: 'boolean',
      title: 'Show summary on card',
      'x-i18n-title': {
        fr: 'Afficher le résumé sur la carte'
      },
      layout: {
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
    },
    showAuthor: {
      type: 'boolean',
      title: 'Show author',
      'x-i18n-title': {
        fr: 'Afficher l\'auteur'
      },
      description: 'Display the author instead of owner department.',
      'x-i18n-description': {
        fr: 'Affiche l\'auteur à la place du département propriétaire.'
      },
      layout: {
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
    },
    thumbnail: {
      type: 'object',
      title: 'Image configuration',
      'x-i18n-title': {
        fr: "Configuration de l'image"
      },
      layout: {
        comp: 'card',
        children: [
          'show',
          {
            if: 'data?.show === true',
            children: [
              'location',
              'default',
              'crop'
            ]
          }
        ]
      },
      properties: {
        show: {
          type: 'boolean',
          title: 'Show image',
          'x-i18n-title': {
            fr: "Afficher l'image"
          },
          layout: 'switch',
          default: true
        },
        location: {
          type: 'string',
          title: 'Image position on card',
          'x-i18n-title': {
            fr: "Position de l'image sur la carte"
          },
          layout: { cols: { md: 6 } },
          default: 'center',
          oneOf: [
            { const: 'left', title: 'Left', 'x-i18n-title': { fr: 'À gauche' } },
            { const: 'top', title: 'Top', 'x-i18n-title': { fr: 'En haut' } },
            { const: 'center', title: 'Below title', 'x-i18n-title': { fr: 'Sous le titre' } }
          ]
        },
        default: {
          type: 'object',
          title: 'Default image',
          'x-i18n-title': {
            fr: 'Image par défaut'
          },
          description: 'Image to display if no image is set for the use.',
          'x-i18n-description': {
            fr: "Image à afficher si la réutilisation n'a pas d'image définie."
          },
          required: ['_id', 'name', 'mimeType'],
          layout: {
            slots: {
              component: {
                name: 'image-upload',
                props: { width: 1280, label: 'Default image' }
              }
            },
            cols: { md: 6 }
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
        crop: {
          type: 'boolean',
          title: 'Crop image for uniform appearance',
          'x-i18n-title': {
            fr: "Recadrer l'image pour un rendu uniforme"
          },
          description: 'If disabled, the image will keep its original ratio',
          'x-i18n-description': {
            fr: "Si désactivé, l'image gardera son ratio d'origine"
          },
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          },
          default: true
        }
      }
    }
  }
}
