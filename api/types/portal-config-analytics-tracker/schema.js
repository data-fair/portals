export default {
  $id: 'https://github.com/data-fair/portals/portal-config-analytics-tracker',
  'x-exports': [],
  type: 'object',
  oneOfLayout: { emptyData: true },
  discriminator: { propertyName: 'type' },
  default: {
    type: 'none'
  },
  oneOf: [
    {
      title: 'No tracking',
      'x-i18n-title': { fr: 'Aucun suivi' },
      required: ['type'],
      additionalProperties: false,
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
      additionalProperties: false,
      properties: {
        type: {
          const: 'google-analytics-v4',
          title: 'System type',
          'x-i18n-title': { fr: 'Type de système' }
        },
        params: {
          type: 'object',
          description: '[See the plugin documentation](https://github.com/DavidWells/analytics/blob/master/packages/analytics-plugin-google-analytics/README.md)',
          'x-i18n-description': { fr: '[Voir la documentation du plugin](https://github.com/DavidWells/analytics/blob/master/packages/analytics-plugin-google-analytics/README.md)' },
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
          title: 'System configured in anonymous mode',
          'x-i18n-title': { fr: 'Système configuré en mode anonyme' }
        }
      }
    },
    {
      title: 'Matomo',
      required: ['type', 'params'],
      additionalProperties: false,
      properties: {
        type: {
          const: 'matomo',
          title: 'System type',
          'x-i18n-title': { fr: 'Type de système' }
        },
        params: {
          type: 'object',
          additionalProperties: false,
          properties: {
            trackerBase: {
              type: 'string',
              title: 'Tracker URL',
              'x-i18n-title': { fr: 'URL du tracker' }
            },
            siteId: {
              type: 'string',
              title: 'Site ID',
              'x-i18n-title': { fr: 'Identifiant du site' }
            }
          }
        },
        anonymized: {
          type: 'boolean',
          layout: 'switch',
          title: 'System configured in anonymous mode',
          'x-i18n-title': { fr: 'Système configuré en mode anonyme' },
          description: "Check this box if your user tracking system is configured to anonymize users' personal identifiers (IP addresses). If so, the portal will not display a banner warning the user that the site uses tracking cookies.",
          'x-i18n-description': { fr: "Cochez cette case si votre système de suivi des utilisateurs est configuré pour anonymiser les identifiants personnels des utilisateurs (adresses IPs). Si c'est le cas le portail n'affichera pas de bandeau avertissant l'utilisateur que le site utilise des cookies de suivi." }
        }
      }
    },
    {
      title: 'Piano',
      required: ['type', 'params'],
      additionalProperties: false,
      properties: {
        type: {
          const: 'piano',
          title: 'System type',
          'x-i18n-title': { fr: 'Type de système' }
        },
        params: {
          type: 'object',
          additionalProperties: false,
          properties: {
            site: {
              type: 'number',
              title: 'Site'
            },
            collectDomain: {
              type: 'string',
              title: 'Collect Domain'
            }
          }
        },
        anonymized: {
          type: 'boolean',
          layout: 'switch',
          title: 'System configured in anonymous mode',
          'x-i18n-title': { fr: 'Système configuré en mode anonyme' },
          description: "Check this box if your user tracking system is configured to anonymize users' personal identifiers (IP addresses). If so, the portal will not display a banner warning the user that the site uses tracking cookies.",
          'x-i18n-description': { fr: "Cochez cette case si votre système de suivi des utilisateurs est configuré pour anonymiser les identifiants personnels des utilisateurs (adresses IPs). Si c'est le cas le portail n'affichera pas de bandeau avertissant l'utilisateur que le site utilise des cookies de suivi." }
        }
      }
    }
  ]
}
