export default {
  $id: 'https://github.com/data-fair/portals/portal-ingress',
  'x-exports': ['types', 'validate', 'vjsf'],
  'x-vjsf': { xI18n: true },
  'x-vjsf-locales': ['en', 'fr'],
  title: 'Portal ingress',
  layout: { title: null },
  type: 'object',
  unevaluatedProperties: false,
  required: ['url'],
  properties: {
    url: {
      type: 'string',
      title: 'URL',
      pattern: '^https?://[^/]+$',
      errorMessage: 'The URL must be of the form https://example.com (protocol + domain, without path or trailing `/`).',
      'x-i18n-errorMessage': { fr: "L'URL doit être de la forme https://exemple.com (protocole + domaine, sans chemin ni `/` final)." },
      layout: {
        placeholder: 'https://test.com'
      }
    },
    customerCert: {
      type: 'string',
      title: 'Custom certificate',
      'x-i18n-title': { fr: 'Certificat custom' },
      layout: {
        if: 'parent.data?.controller !== "manual"',
        placeholder: 'Leave empty to use a self-managed certificate',
        'x-i18n-placeholder': { fr: 'Laissez vide pour utiliser un certificat auto-géré' }
      }
    },
    controller: {
      type: 'string',
      title: 'Ingress controller',
      'x-i18n-title': { fr: 'Controleur ingress' },
      layout: {
        if: 'context.ingressControllers.length',
        getItems: 'context.ingressControllers'
      }
    },
    redirects: {
      type: 'array',
      title: 'Specific redirects (resolved by the browser)',
      'x-i18n-title': { fr: 'Redirections spécifiques (résolues par le navigateur)' },
      layout: { if: 'parent.data?.controller !== "manual"' },
      items: {
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: [
          {
            type: 'string',
            title: 'Source',
            'x-i18n-title': { fr: 'Origine' },
            layout: { cols: 6, placeholder: 'For example /pages/accueil/', 'x-i18n-placeholder': { fr: 'Par exemple /pages/accueil/' } }
          },
          {
            type: 'string',
            title: 'Destination',
            layout: { cols: 6, placeholder: 'For example /', 'x-i18n-placeholder': { fr: 'Par exemple /' } }
          }
        ]
      }
    },
    rewrites: {
      type: 'array',
      title: 'Rewrites (resolved directly on the server)',
      'x-i18n-title': { fr: 'Re-écriture (résolues directement sur le serveur)' },
      layout: { if: 'parent.data?.controller !== "manual"' },
      items: {
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: [
          {
            type: 'string',
            title: 'Source',
            'x-i18n-title': { fr: 'Origine' },
            layout: { cols: 6, placeholder: 'For example /api/explore/(.+?)/catalog/datasets/compat-slug/(.*)', 'x-i18n-placeholder': { fr: 'Par exemple /api/explore/(.+?)/catalog/datasets/compat-slug/(.*)' } }
          },
          {
            type: 'string',
            title: 'Destination',
            layout: { cols: 6, placeholder: 'For example /api/explore/$1/catalog/datasets/new-slug/$2', 'x-i18n-placeholder': { fr: 'Par exemple /api/explore/$1/catalog/datasets/new-slug/$2' } }
          }
        ]
      }
    },
    blockedIps: {
      type: 'array',
      title: 'Blocked IPs',
      'x-i18n-title': { fr: 'IPs bloquées' },
      layout: { if: 'parent.data?.controller !== "manual"' },
      items: {
        type: 'string'
      }
    },
    datasetUrlTemplate: {
      type: 'string',
      title: 'Dataset link template',
      'x-i18n-title': { fr: 'Template de lien vers les jeux de données' },
      description: 'Leave empty to create automatic links to the platform portal. Only useful to redirect to an alternative portal rendering.',
      'x-i18n-description': { fr: 'Laisser vide pour créer des liens automatiques vers le portail de la plateforme. Utile uniquement pour rediriger vers un rendu alternatif de portail.' },
      layout: {
        placeholder: 'https://test.com/datasets/{slug}'
      }
    },
    applicationUrlTemplate: {
      type: 'string',
      title: 'Application link template',
      'x-i18n-title': { fr: 'Template de lien vers les visualisations' },
      description: 'Leave empty to create automatic links to the platform portal. Only useful to redirect to an alternative portal rendering.',
      'x-i18n-description': { fr: 'Laisser vide pour créer des liens automatiques vers le portail de la plateforme. Utile uniquement pour rediriger vers un rendu alternatif de portail.' },
      layout: {
        placeholder: 'https://test.com/applications/{slug}'
      }
    }
  }
}
