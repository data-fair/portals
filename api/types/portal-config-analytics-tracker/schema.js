export default {
  $id: 'https://github.com/data-fair/portals/portal-config-analytics-tracker',
  'x-exports': [],
  type: 'object',
  unevaluatedProperties: false,
  oneOfLayout: { emptyData: true },
  discriminator: { propertyName: 'type' },
  default: {
    type: 'none'
  },
  oneOf: [
    {
      title: 'Aucun suivi',
      properties: {
        type: {
          const: 'none'
        },
        anonymized: {
          const: true
        }
      }
    },
    {
      title: 'Google Analytics v4',
      required: ['type', 'params'],
      properties: {
        type: {
          const: 'google-analytics-v4',
          title: 'Type de système'
        },
        params: {
          type: 'object',
          description: '[Voir la documentation du plugin](https://github.com/DavidWells/analytics/blob/master/packages/analytics-plugin-google-analytics/README.md)',
          additionalProperties: false,
          properties: {
            measurementIds: {
              title: 'Google Analytics MEASUREMENT IDs',
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        },
        anonymized: {
          const: false,
          title: 'Système configuré en mode anonyme'
        }
      }
    },
    {
      title: 'Matomo',
      required: ['type', 'params'],
      properties: {
        type: {
          const: 'matomo',
          title: 'Type de système'
        },
        params: {
          type: 'object',
          additionalProperties: false,
          properties: {
            trackerBase: {
              type: 'string',
              title: 'URL du tracker'
            },
            siteId: {
              type: 'string',
              title: 'Identifiant du site'
            }
          }
        },
        anonymized: {
          type: 'boolean',
          'x-display': 'switch',
          title: 'système configuré en mode anonyme',
          description: "Cochez cette case si votre système de suivi des utilisateurs est configuré pour anonymiser les identifiants personnels des utilisateurs (adresses IPs). Si c'est le cas le portail n'affichera pas de bandeau avertissant l'utilisateur que le site utilise des cookies de suivi."
        }
      }
    },
    {
      title: 'Piano',
      required: ['type', 'params'],
      properties: {
        type: {
          const: 'piano',
          title: 'Type de système'
        },
        params: {
          type: 'object',
          additionalProperties: false,
          properties: {
            site: {
              type: 'number',
              title: 'Site'
            }
          }
        },
        anonymized: {
          type: 'boolean',
          'x-display': 'switch',
          title: 'système configuré en mode anonyme',
          description: "Cochez cette case si votre système de suivi des utilisateurs est configuré pour anonymiser les identifiants personnels des utilisateurs (adresses IPs). Si c'est le cas le portail n'affichera pas de bandeau avertissant l'utilisateur que le site utilise des cookies de suivi."
        }
      }
    }
  ]
}
