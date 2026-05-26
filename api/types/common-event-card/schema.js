export default {
  $id: 'https://github.com/data-fair/portals/common-event-card',
  'x-exports': [],
  title: 'Event Card',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    title: null,
    children: [
      {
        comp: 'card',
        title: 'Options',
        children: [
          { cols: { md: 6 }, key: 'elevation' },
          { cols: { md: 6 }, key: 'rounded' },
          { cols: { md: 6 }, key: 'titleLinesCount' },
          { cols: { md: 6 }, key: 'showDescription' }
        ]
      },
      'thumbnail'
    ]
  },
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
    titleLinesCount: {
      type: 'number',
      title: 'Nombre de lignes pour le titre',
      description: 'Force le titre à occuper exactement N lignes.',
      layout: { cols: { md: 4 } },
      default: 2,
      oneOf: [
        { const: 1, title: '1 ligne' },
        { const: 2, title: '2 lignes' },
        { const: 0, title: 'Sans limite de lignes' }
      ]
    },
    showDescription: {
      type: 'boolean',
      title: 'Show description on card',
      'x-i18n-title': {
        fr: 'Afficher la description'
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
          { key: 'show', cols: { md: 6 } },
          {
            if: 'data?.show === true',
            children: [
              { key: 'location', cols: { md: 6 } },
              { key: 'default', cols: { md: 6 } },
              { key: 'crop', cols: { md: 6 } },
              { key: 'useDescription', cols: { md: 6 } }
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
          description: 'Image to display if no image is set for the event.',
          'x-i18n-description': {
            fr: "Image à afficher si l'événement n'a pas d'image définie."
          },
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
          layout: { comp: 'switch' },
          default: true
        },
        useDescription: {
          type: 'boolean',
          title: 'Use description',
          'x-i18n-title': {
            fr: 'Utiliser la description de l\'événement'
          },
          description: "Use the event's description when no image is set for it and when 'Show description' is not enabled.",
          'x-i18n-description': {
            fr: "Permet d'utiliser la description de l'événement si aucune image n'est définie pour ce dernier et si l'option 'Afficher la description' n'est pas activée."
          },
          layout: { comp: 'switch', cols: { md: 4 } },
          default: false
        }
      }
    }
  }
}
