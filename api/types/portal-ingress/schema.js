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
      title: 'Redirections spécifiques',
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
    blockedIps: {
      type: 'array',
      title: 'IPs bloquées',
      items: {
        type: 'string'
      }
    },
    waf: {
      type: 'string',
      title: 'Activation du WAF',
      default: 'on',
      oneOf: [
        { title: 'actif', const: 'on' },
        { title: 'inactif', const: 'off' },
        { title: 'actif non bloquant', const: 'detectionOnly' }
      ],
      description: '"Web Application Firewall", fortement recommandé, à désactiver uniquement ponctuellement si le WAF créé un blocage.'
    }
  }
}
