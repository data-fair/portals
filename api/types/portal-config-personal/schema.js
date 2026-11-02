export default {
  $id: 'https://github.com/data-fair/portals/portal-config-personal',
  'x-exports': [],
  title: 'Personal Space',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    title: '',
    subtitle: 'The personal space is offered to logged-in users if you enable authentication.',
    'x-i18n-subtitle': { fr: "L'espace personnel sera proposé aux utilisateurs connectés si vous activez l'authentification." },
    children: [{
      comp: 'card',
      title: 'Options',
      children: [
        'navigationColor',
        'hidePages'
      ]
    },
    {
      comp: 'card',
      title: 'Additional iframe pages',
      'x-i18n-title': { fr: 'Pages supplémentaires en iframe' },
      children: ['accountPages']
    }]
  },
  required: ['navigationColor', 'hidePages', 'accountPages'],
  properties: {
    navigationColor: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-background',
      title: 'Personal space navigation bar color',
      'x-i18n-title': { fr: "Couleur de la barre de navigation de l'espace personnel" },
      default: 'primary',
      layout: {
        slots: {
          item: { name: 'color-select-item' },
          selection: { name: 'color-select-selection' }
        },
        props: { background: true },
        cols: { md: 6 }
      }
    },
    hidePages: {
      type: 'array',
      title: 'Hide pages in the personal space',
      'x-i18n-title': { fr: "Cacher des pages dans l'espace personnel" },
      items: {
        type: 'string',
        oneOf: [
          {
            const: 'notifications',
            title: 'Notifications'
          },
          {
            const: 'api-keys',
            title: 'API keys',
            'x-i18n-title': { fr: "Clés d'API" }
          },
          {
            const: 'contribute',
            title: 'Contribute',
            'x-i18n-title': { fr: 'Contribuer' }
          },
          {
            const: 'processings',
            title: 'Processings',
            'x-i18n-title': { fr: 'Traitements' }
          }
        ]
      },
      layout: { cols: { md: 6 } },
      default: []
    },
    accountPages: {
      type: 'array',
      title: 'Additional iframe pages',
      'x-i18n-title': { fr: 'Pages supplémentaires en iframe' },
      layout: {
        title: '',
        messages: {
          addItem: 'Add a page',
          'x-i18n-addItem': { fr: 'Ajouter une page' }
        }
      },
      items: {
        type: 'object',
        required: ['id', 'title', 'href', 'icon'],
        properties: {
          id: {
            type: 'string',
            title: 'Page identifier',
            'x-i18n-title': { fr: 'Identifiant de la page' },
            layout: { cols: { md: 4 } }
          },
          title: {
            type: 'string',
            title: 'Link label',
            'x-i18n-title': { fr: 'Libellé du lien' },
            layout: { cols: { md: 4 } }
          },
          icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
          href: {
            type: 'string',
            title: 'Page URL',
            'x-i18n-title': { fr: 'URL de la page' },
          }
        }
      },
      default: []
    }
  }
}
