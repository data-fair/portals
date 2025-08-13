export default {
  $id: 'https://github.com/data-fair/portals/portal-ingress',
  'x-exports': ['types', 'validate', 'vjsf'],
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
        placeholder: 'laissez vide pour utiliser un certificat auto-géré'
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
      title: 'Redirections spécifiques',
      items: {
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: [
          { type: 'string', title: 'origine', layout: { cols: 6, placeholder: 'par exemple /pages/accueil/' } },
          { type: 'string', title: 'destination', layout: { cols: 6, placeholder: 'par exemple /' } }
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
