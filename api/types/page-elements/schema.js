export default {
  $id: 'https://github.com/data-fair/portals/page-elements',
  'x-exports': ['types', 'vjsf'],
  'x-vjsf': {
    pluginsImports: ['@koumoul/vjsf-markdown'],
  },
  title: 'Page elements',
  type: 'array',
  layout: {
    clipboardKey: 'elements',
    title: '',
    listEditMode: 'dialog'
  },
  items: {
    $ref: '#/$defs/element'
  },
  $defs: {
    element: {
      title: 'Page element',
      type: 'object',
      unevaluatedProperties: false,
      layout: {
        switch: [
          { if: 'summary', slots: { component: 'page-preview-element' } }
        ]
      },
      default: {
        type: 'text',
        content: ''
      },
      discriminator: {
        propertyName: 'type'
      },
      oneOf: [
        { $ref: '#/$defs/element-text' },
        { $ref: '#/$defs/element-title' },
        { $ref: '#/$defs/element-alert' },
        { $ref: '#/$defs/element-image' },
        { $ref: '#/$defs/element-divider' },
        { $ref: '#/$defs/element-contact' },
        { $ref: '#/$defs/element-card' },
        { $ref: '#/$defs/element-two-columns' },
        { $ref: '#/$defs/element-responsive-flow' },
        { $ref: '#/$defs/element-tabs' },
      ]
    },
    'element-title': {
      type: 'object',
      title: 'Titre',
      required: ['type', 'titleSize'],
      properties: {
        type: {
          const: 'title'
        },
        content: {
          title: 'Contenu',
          type: 'string'
        },
        icon: {
          $ref: '#/$defs/icon'
        },
        titleSize: {
          title: 'Taille du titre',
          type: 'string',
          oneOf: [
            { const: 'h1', title: 'H1' },
            { const: 'h2', title: 'H2' },
            { const: 'h3', title: 'H3' },
            { const: 'h4', title: 'H4' },
            { const: 'h5', title: 'H5' },
            { const: 'h6', title: 'H6' }
          ],
          default: 'h3',
        },
        centered: {
          type: 'boolean',
          title: 'Centrer le titre',
          default: false,
        }
      }
    },
    'element-text': {
      type: 'object',
      title: 'Texte',
      required: ['type'],
      properties: {
        type: {
          const: 'text'
        },
        content: {
          title: 'Contenu',
          type: 'string',
          layout: 'markdown'
        }
      }
    },
    'element-alert': {
      type: 'object',
      title: 'Texte accentué',
      required: ['type', 'alertType'],
      properties: {
        type: {
          const: 'alert'
        },
        alertType: {
          type: 'string',
          title: "Type d'accentuation",
          default: 'info',
          oneOf: [
            {
              const: 'info',
              title: 'Information'
            },
            {
              const: 'success',
              title: 'Succès'
            },
            {
              const: 'error',
              title: 'Erreur'
            },
            {
              const: 'warning',
              title: 'Avertissement'
            },
            {
              const: 'none',
              title: 'Sans accentuation'
            }
          ]
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
        icon: {
          $ref: '#/$defs/icon'
        },
        color: {
          $ref: '#/$defs/color'
        }
      }
    },
    'element-image': {
      type: 'object',
      title: 'Image',
      required: ['type'],
      properties: {
        type: {
          const: 'image'
        },
        title: {
          title: "Titre de l'image",
          description: "recommandé pour l'accessibilité et pour afficher une information utile au survol",
          type: 'string'
        },
        url: {
          title: "URL vers l'image",
          description: "Utile pour pointer vers une image sur un autre serveur Web. Si vous disposez de l'image en fichier sur votre poste vous pouvez la charger ci-dessous.",
          type: 'string'
        },
        imageRef: { $ref: '#/$defs/image-ref' },
        href: {
          title: 'URL vers une autre page',
          description: "L'image devient un lien qui pointe vers l'URL renseignée.",
          type: 'string'
        },
        height: {
          title: 'Hauteur (px)',
          description: "Fixe la hauteur de l'image",
          type: 'integer'
        },
        legend: {
          title: "Légende de l'image",
          description: "Cette légende sera affichée en italique juste en dessous de l'image",
          type: 'string'
        },
        zoomable: {
          title: 'Zoom au clic',
          description: "Ne fonctionne que si aucun lien n'est associé à l'image",
          type: 'boolean'
        }
      }
    },
    'element-divider': {
      type: 'object',
      title: 'Séparateur horizontal',
      required: ['type', 'opacity', 'thickness'],
      properties: {
        type: {
          const: 'divider'
        },
        color: {
          $ref: '#/$defs/color'
        },
        inset: {
          type: 'boolean',
          title: 'Ajouter une indentation'
        },
        opacity: {
          type: 'number',
          title: 'Opacité',
          layout: 'slider',
          default: 0.12,
          minimum: 0.12,
          maximum: 1
        },
        thickness: {
          type: 'integer',
          title: 'Épaisseur',
          layout: 'slider',
          default: 1,
          minimum: 1,
          maximum: 10
        }
      }
    },
    'element-contact': {
      title: 'Contact',
      type: 'object',
      required: ['type'],
      properties: {
        type: {
          const: 'contact'
        },
        showInfo: {
          type: 'boolean',
          layout: 'switch',
          title: 'Afficher les informations de contact'
        },
        showSocial: {
          type: 'boolean',
          layout: 'switch',
          title: 'Afficher les liens de réseaux sociaux'
        }
      }
    },
    'element-card': {
      type: 'object',
      title: 'Boite',
      required: ['type', 'children', 'actions'],
      properties: {
        type: {
          const: 'card'
        },
        title: {
          title: 'Titre',
          type: 'string',
        },
        href: {
          title: 'URL vers une autre page',
          description: "La vignette devient un lien qui pointe vers l'URL renseignée.",
          type: 'string'
        },
        border: {
          title: 'Bordure',
          type: 'boolean',
          default: true
        },
        actions: {
          title: 'Actions',
          type: 'array',
          layout: {
            messages: {
              addItem: 'Ajouter un bouton d\'action'
            },
            listEditMode: 'inline'
          },
          items: {
            $ref: '#/$defs/button'
          }
        },
        children: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: '#/$defs/element'
          }
        }
      }
    },
    'element-two-columns': {
      type: 'object',
      title: '2 colonnes',
      required: ['type', 'disposition', 'gutter', 'children', 'children2'],
      properties: {
        type: {
          const: 'two-columns'
        },
        disposition: {
          type: 'string',
          title: 'Disposition',
          default: 'equal',
          oneOf: [
            {
              const: 'equal',
              title: 'largeur de même taille'
            },
            {
              const: 'left',
              title: 'colonne gauche large'
            },
            {
              const: 'right',
              title: 'colonne droite large'
            }
          ]
        },
        gutter: {
          type: 'string',
          title: 'Espacement',
          default: 'default',
          oneOf: [
            { const: 'none', title: 'aucun' },
            { const: 'dense', title: 'petit' },
            { const: 'default', title: 'normal' }
          ]
        },
        children: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: '#/$defs/element'
          }
        },
        children2: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: '#/$defs/element'
          }
        }
      }
    },
    'element-responsive-flow': {
      title: 'Flux responsive',
      type: 'object',
      required: ['type', 'blocks'],
      properties: {
        type: {
          const: 'responsive-flow'
        },
        blocks: {
          type: 'array',
          title: 'Blocs',
          layout: {
            messages: {
              addItem: 'Ajouter un bloc',
            },
            listEditMode: 'inline'
          },
          items: {
            type: 'object',
            properties: {
              large: {
                title: 'élargir',
                type: 'boolean',
                default: false,
              },
              children: {
                type: 'array',
                layout: 'none',
                items: {
                  $ref: '#/$defs/element'
                }
              }
            }
          }
        }
      }
    },
    'element-tabs': {
      title: 'Onglets',
      type: 'object',
      required: ['type', 'align', 'tabs'],
      properties: {
        type: {
          const: 'tabs'
        },
        grow: {
          type: 'boolean',
          title: 'Étendre'
        },
        align: {
          layout: {
            if: '!parent.data.grow'
          },
          type: 'string',
          title: 'Alignement',
          default: 'start',
          oneOf: [
            { const: 'start', title: 'début' },
            { const: 'center', title: 'centre' },
            { const: 'end', title: 'fin' }
          ]
        },
        border: {
          title: 'Bordure',
          type: 'boolean',
          default: true
        },
        tabs: {
          type: 'array',
          title: 'Onglets',
          layout: {
            messages: {
              addItem: 'Ajouter un onglet',
            },
            listEditMode: 'inline'
          },
          items: {
            type: 'object',
            required: [],
            properties: {
              title: {
                title: 'Titre onglet',
                type: 'string'
              },
              icon: {
                $ref: '#/$defs/icon'
              },
              children: {
                type: 'array',
                layout: 'none',
                items: {
                  $ref: '#/$defs/element'
                }
              }
            }
          }
        }
      }
    },
    'image-ref': {
      type: 'object',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 2400, label: 'chargez une image' } // max width of v-container
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
    icon: {
      type: 'object',
      title: 'Icône',
      required: ['name', 'svg'],
      layout: {
        getItems: {
          url: 'https://koumoul.com/data-fair/api/v1/datasets/icons-mdi-latest/lines?q={q}&select=name,svg,svgPath',
          itemKey: 'data.name',
          itemTitle: 'data.name',
          itemIcon: 'data.svg',
          itemsResults: 'data.results'
        }
      },
      properties: {
        name: { type: 'string' },
        svg: { type: 'string' },
        svgPath: { type: 'string' }
      }
    },
    color: {
      type: 'string',
      title: 'Couleur',
      oneOf: [
        { const: 'primary', title: 'Couleur primaire' },
        { const: 'secondary', title: 'Couleur secondaire' },
        { const: 'accent', title: 'Couleur accentuée' },
        { const: 'info', title: 'Information' },
        { const: 'success', title: 'Succès' },
        { const: 'error', title: 'Erreur' },
        { const: 'warning', title: 'Avertissement' }
      ]
    },
    button: {
      type: 'object',
      title: 'Bouton',
      required: ['color'],
      default: {
        color: 'primary'
      },
      properties: {
        label: {
          type: 'string',
          title: 'Libellé'
        },
        href: {
          type: 'string',
          title: 'URL'
        },
        icon: {
          $ref: '#/$defs/icon'
        },
        color: {
          $ref: '#/$defs/color'
        }
      }
    }
  }
}
