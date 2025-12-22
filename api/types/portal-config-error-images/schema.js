export default {
  $id: 'https://github.com/data-fair/portals/portal-config-error-images',
  'x-exports': [],
  type: 'object',
  title: "Images personnalisées pour les pages d'erreur (404, 500, etc.)",
  unevaluatedProperties: false,
  properties: {
    forbidden: {
      type: 'object',
      title: 'Erreur 401/403 - Accès non autorisé',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Erreur 401/403 - Accès non autorisé' }
          }
        },
        cols: { md: 4 }
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
    notFound: {
      type: 'object',
      title: 'Erreur 404 - Page non trouvée',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Erreur 404 - Page non trouvée' }
          }
        },
        cols: { md: 4 }
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
    fallback: {
      type: 'object',
      title: 'Erreur 500 - Erreur interne',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Erreur 500 - Erreur interne' }
          }
        },
        cols: { md: 4 }
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
    }
  }
}
