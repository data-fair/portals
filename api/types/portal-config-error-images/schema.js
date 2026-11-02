export default {
  $id: 'https://github.com/data-fair/portals/portal-config-error-images',
  'x-exports': [],
  type: 'object',
  title: 'Custom images for error pages (404, 500, etc.)',
  'x-i18n-title': { fr: "Images personnalisées pour les pages d'erreur (404, 500, etc.)" },
  unevaluatedProperties: false,
  properties: {
    forbidden: {
      type: 'object',
      title: 'Error 401/403 - Unauthorized access',
      'x-i18n-title': { fr: 'Erreur 401/403 - Accès non autorisé' },
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Error 401/403 - Unauthorized access', 'x-i18n-label': { fr: 'Erreur 401/403 - Accès non autorisé' } }
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
      title: 'Error 404 - Page not found',
      'x-i18n-title': { fr: 'Erreur 404 - Page non trouvée' },
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Error 404 - Page not found', 'x-i18n-label': { fr: 'Erreur 404 - Page non trouvée' } }
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
      title: 'Error 500 - Internal error',
      'x-i18n-title': { fr: 'Erreur 500 - Erreur interne' },
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Error 500 - Internal error', 'x-i18n-label': { fr: 'Erreur 500 - Erreur interne' } }
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
