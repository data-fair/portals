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
      layout: {
        placeholder: 'https://test.com'
      }
    },
    customerCert: {
      type: 'string',
      title: 'Certificat custom',
      layout: {
        placeholder: 'Laissez vide pour utiliser un certificat auto-géré'
      }
    },
    controller: {
      type: 'string',
      title: 'Controleur ingress',
      layout: {
        if: 'context.ingressControllers.length',
        getItems: 'context.ingressControllers'
      }
    },
    redirects: {
      type: 'array',
      title: 'Redirections spécifiques (résolues par le navigateur)',
      items: {
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: [
          { type: 'string', title: 'Origine', layout: { cols: 6, placeholder: 'Par exemple /pages/accueil/' } },
          { type: 'string', title: 'Destination', layout: { cols: 6, placeholder: 'Par exemple /' } }
        ]
      }
    },
    rewrites: {
      type: 'array',
      title: 'Re-écriture (résolues directement sur le serveur)',
      items: {
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: [
          { type: 'string', title: 'Origine', layout: { cols: 6, placeholder: 'Par exemple /api/explore/(.+?)/catalog/datasets/compat-slug/(.*)' } },
          { type: 'string', title: 'Destination', layout: { cols: 6, placeholder: 'Par exemple /api/explore/$1/catalog/datasets/new-slug/$2' } }
        ]
      }
    },
    blockedIps: {
      type: 'array',
      title: 'IPs bloquées',
      items: {
        type: 'string'
      }
    }
  }
}
