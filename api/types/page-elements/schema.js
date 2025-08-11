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
        { $ref: '#/$defs/element-title' },
        { $ref: '#/$defs/element-text' },
        { $ref: '#/$defs/element-alert' },
        { $ref: '#/$defs/element-divider' },
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
        titleSize: {
          title: 'Taille du titre',
          type: 'string',
          oneOf: [
            { const: 'h6', title: 'H6' },
            { const: 'h5', title: 'H5' },
            { const: 'h4', title: 'H4' },
            { const: 'h3', title: 'H3' },
            { const: 'h2', title: 'H2' },
            { const: 'h1', title: 'H1' }
          ],
          default: 'h3',
        },
        centered: {
          type: 'boolean',
          title: 'Centré',
          default: false,
        },
        icon: {
          $ref: '#/$defs/icon'
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
              const: 'warning',
              title: 'Avertissement'
            },
            {
              const: 'error',
              title: 'Erreur'
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
      required: ['type', 'direction', 'align', 'tabs'],
      properties: {
        type: {
          const: 'tabs'
        },
        direction: {
          type: 'string',
          title: 'Orientation',
          default: 'horizontal',
          oneOf: [
            { const: 'horizontal', title: 'horizontale' },
            { const: 'vertical', title: 'verticale' }
          ]
        },
        grow: {
          type: 'boolean',
          title: 'Étendre'
        },
        align: {
          layout: {
            if: '!data.grow'
          },
          type: 'string',
          title: 'Alignement',
          default: 'start',
          oneOf: [
            { const: 'start', title: 'début' },
            { const: 'center', title: 'centre' },
            { const: 'entre', title: 'fin' }
          ]
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
    icon: {
      type: 'object',
      title: 'Icone',
      required: ['name', 'svg'],
      layout: {
        getItems: {
          url: 'https://koumoul.com/data-fair/api/v1/datasets/icons-mdi-latest/lines?q={q}',
          itemKey: 'data.name',
          itemTitle: 'data.name',
          itemIcon: 'data.svg',
          itemsResults: 'data.results'
        }
      },
      properties: {
        name: {
          type: 'string'
        },
        svg: {
          type: 'string'
        }
      }
    },
    color: {
      type: 'string',
      title: 'Couleur',
      default: 'primary',
      oneOf: [
        { const: 'primary', title: 'couleur primaire' },
        { const: 'secondary', title: 'couleur secondaire' },
        { const: 'error', title: 'erreur' },
        { const: 'warning', title: 'avertissement' },
        { const: 'info', title: 'information' },
        { const: 'success', title: 'succès' },
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
