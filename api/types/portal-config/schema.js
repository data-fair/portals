export default {
  $id: 'https://github.com/data-fair/portals/portal-config',
  'x-exports': ['types'],
  title: 'Portal config',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    comp: 'vertical-tabs',
    children: [
      { title: 'Métadonnées', children: ['title', 'description', 'authentication'] }
    ]
  },
  required: ['title', 'authentication'],
  properties: {
    title: {
      type: 'string',
      title: 'Titre'
    },
    description: {
      type: 'string',
      title: 'Description'
    },
    authentication: {
      type: 'string',
      oneOf: [
        {
          const: 'none',
          title: 'Aucune'
        },
        {
          const: 'optional',
          title: 'Optionnelle pour voir les contenus protégés, configurer des notifications, etc'
        },
        {
          const: 'required',
          title: 'Requise pour accéder au portail'
        }
      ],
      title: 'Authentification',
      default: 'optional'
    }
  }

}
