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
        content: 'Nouveau élément'
      },
      oneOf: [
        { $ref: '#/$defs/element-title' },
        { $ref: '#/$defs/element-text' },
        { $ref: '#/$defs/element-alert' },
        { $ref: '#/$defs/element-divider' },
        { $ref: '#/$defs/element-card' }
      ]
    },
    'element-title': {
      type: 'object',
      title: 'Titre',
      discriminator: {
        propertyName: 'type'
      },
      required: ['content', 'titleSize'],
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
      required: ['content'],
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
      required: ['alertType', 'content'],
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
        content: {
          title: 'Contenu',
          type: 'string',
          layout: 'markdown'
        }
      }
    },
    'element-divider': {
      type: 'object',
      title: 'Séparateur horizontal',
      properties: {
        type: {
          const: 'divider'
        }
      }
    },
    'element-card': {
      type: 'object',
      title: 'Boite',
      required: ['children'],
      properties: {
        type: {
          const: 'card'
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
    icon: {
      type: 'object',
      title: 'Icone',
      additionalProperties: false,
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
    }
  }
}
