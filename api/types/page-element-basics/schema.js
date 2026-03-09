export default {
  $id: 'https://github.com/data-fair/portals/page-element-basics',
  'x-exports': [],
  $defs: {
    'element-title': {
      type: 'object',
      title: 'TitleElement',
      'x-i18n-title': {
        en: 'Title',
        fr: 'Titre'
      },
      required: ['type', 'titleSize'],
      properties: {
        type: { const: 'title' },
        uuid: { type: 'string', layout: 'none' },
        content: {
          title: 'Content',
          'x-i18n-title': {
            fr: 'Contenu'
          },
          type: 'string'
        },
        titleSize: {
          title: 'Title size',
          'x-i18n-title': {
            fr: 'Taille du titre'
          },
          type: 'string',
          oneOf: [
            { const: 'h1', title: 'Titre principal' },
            { const: 'h2', title: 'Très grand' },
            { const: 'h3', title: 'Grand' },
            { const: 'h4', title: 'Moyen' },
            { const: 'h5', title: 'Petit' },
            { const: 'h6', title: 'Très petit' }
          ],
          default: 'h3',
          layout: { cols: { xs: 8 } },
        },
        titleTag: {
          title: 'Heading tag',
          'x-i18n-title': {
            fr: 'Balise'
          },
          type: 'string',
          oneOf: [
            { const: 'h1', title: 'H1' },
            { const: 'h2', title: 'H2' },
            { const: 'h3', title: 'H3' },
            { const: 'h4', title: 'H4' },
            { const: 'h5', title: 'H5' },
            { const: 'h6', title: 'H6' },
            { const: 'div', title: 'Div' }
          ],
          layout: { cols: { xs: 4 } },
        },
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color' },
        centered: {
          type: 'boolean',
          title: 'Center the title',
          'x-i18n-title': { fr: 'Centrer le titre' },
          layout: { cols: { xs: 6 } }
        },
        bold: {
          type: 'boolean',
          title: 'Bold text',
          'x-i18n-title': { fr: 'Texte en gras' },
          layout: { cols: { xs: 6 } },
        },
        link: {
          $ref: 'https://github.com/data-fair/portals/common-links#/$defs/simpleLinkItem',
          title: 'Configuration du lien',
          layout: { comp: 'card' }
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
        line: {
          type: 'object',
          title: 'Line configuration',
          'x-i18n-title': {
            fr: 'Configuration du trait'
          },
          layout: 'card',
          properties: {
            position: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/linePosition' },
            color: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color',
              title: 'Line color',
              'x-i18n-title': { fr: 'Couleur du trait' },
              layout: {
                slots: {
                  item: { name: 'color-select-item' },
                  selection: { name: 'color-select-selection' }
                },
                props: { background: true }
              }
            }
          }
        }
      }
    },
    'element-text': {
      type: 'object',
      title: 'Texte',
      required: ['type'],
      properties: {
        type: { const: 'text' },
        uuid: { type: 'string', layout: 'none' },
        content: {
          title: 'Contenu',
          type: 'string',
          layout: 'markdown'
        },
        centered: {
          type: 'boolean',
          title: 'Centrer le contenu',
          default: false,
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' },
        _html: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rendered-html' }
      }
    },
    'element-alert': {
      type: 'object',
      title: 'AlertElement',
      'x-i18n-title': {
        en: 'Accented text',
        fr: 'Texte accentué'
      },
      required: ['type', 'alertType'],
      layout: {
        switch: [
          {
            if: 'data?.alertType === "none"',
            children: [
              'type', 'alertType', 'icon', 'color', 'title', 'content', 'mb'
            ]
          },
          ['type', 'alertType', 'title', 'content', 'mb']
        ]
      },
      properties: {
        type: { const: 'alert' },
        uuid: { type: 'string', layout: 'none' },
        alertType: {
          type: 'string',
          title: 'Type prédéfini',
          default: 'info',
          oneOf: [
            { const: 'none', title: 'Aucun' },
            { const: 'info', title: 'Information' },
            { const: 'success', title: 'Succès' },
            { const: 'error', title: 'Erreur' },
            { const: 'warning', title: 'Avertissement' }
          ]
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
        color: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-full',
          layout: {
            props: { background: true },
            slots: {
              item: { name: 'color-select-item' },
              selection: { name: 'color-select-selection' }
            }
          }
        },
        title: {
          title: 'Titre',
          type: 'string',
        },
        content: {
          title: 'Contenu',
          type: 'string',
          layout: 'markdown'
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' },
        _html: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rendered-html' }
      }
    },
    'element-image': {
      type: 'object',
      title: 'ImageElement',
      'x-i18n-title': {
        en: 'Image',
        fr: 'Image'
      },
      required: ['type'],
      properties: {
        type: { const: 'image' },
        uuid: { type: 'string', layout: 'none' },
        banner: {
          type: 'boolean',
          title: 'Pleine largeur',
          layout: 'switch'
        },
        isPresentation: {
          type: 'boolean',
          title: 'Image de présentation (décorative)',
          description: "Les images de présentations ne sont pas affichés pour les lecteurs d'écrans pour l'accessibilité. Dans ce cas, l'image ne peut pas porter de liens.",
          layout: 'switch'
        },
        url: {
          title: "URL vers l'image",
          description: "Utile pour pointer vers une image sur un autre serveur Web. Si vous disposez de l'image en fichier sur votre poste vous pouvez la charger ci-dessous.",
          type: 'string'
        },
        image: {
          type: 'object',
          required: ['_id', 'name', 'mimeType'],
          layout: {
            if: '!parent.data?.banner',
            slots: {
              component: {
                name: 'image-upload',
                props: { width: 2400, label: 'Chargez une image' } // max width of v-container
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
        wideImage: {
          type: 'object',
          required: ['_id', 'name', 'mimeType'],
          layout: {
            if: 'parent.data?.banner',
            slots: {
              component: {
                name: 'image-upload',
                props: { width: 2560, label: 'Chargez une image' }
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
        height: {
          title: 'Hauteur fixe (px)',
          type: 'integer',
          minimum: 0
        },
        title: {
          type: 'string',
          title: "Titre de l'image (Accessibilité)",
          description: "Nécessaire pour l'accessibilité si l'image n'est pas décorative.",
          layout: { if: '!parent.data?.isPresentation' }
        },
        legend: {
          type: 'string',
          title: "Légende de l'image",
          description: "Légende affichée en italique en dessous de l'image",
          layout: { if: '!parent.data?.isPresentation' }
        },
        cover: {
          type: 'boolean',
          title: "Recadrer l'image pour remplir l'espace",
          layout: {
            if: '!parent.data?.banner',
            comp: 'switch'
          }
        },
        zoomable: {
          type: 'boolean',
          title: 'Zoom au clic',
          layout: { if: '!parent.data?.banner && !parent.data?.href' }
        },
        link: {
          $ref: 'https://github.com/data-fair/portals/common-links#/$defs/simpleLinkItem',
          title: "Lien au clic sur l'image",
          layout: {
            if: '!parent.data?.isPresentation',
            comp: 'card'
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-iframe': {
      type: 'object',
      title: 'IFrame',
      required: ['type', 'url'],
      properties: {
        type: { const: 'iframe' },
        uuid: { type: 'string', layout: 'none' },
        title: {
          title: "Titre de l'iframe",
          description: "Recommandé pour l'accessibilité.",
          type: 'string'
        },
        url: {
          title: "URL de l'iframe",
          description: "URL de la page web à afficher dans l'iframe.",
          type: 'string',
          layout: {
            slots: {
              before: "**Important** : Pour que l'intégration IFrame fonctionne correctement, vous devez ajouter le nom de domaine de l'URL dans la **Configuration du portail** → **Paramètres généraux** → **Sécurité**."
            }
          }
        },
        scroll: {
          type: 'boolean',
          title: 'Activer le scroll',
          description: "Permet de scroller dans le contenu de l'iframe"
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
  }
}
