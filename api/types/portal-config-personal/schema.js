export default {
  $id: 'https://github.com/data-fair/portals/portal-config-personal',
  'x-exports': [],
  title: 'Personal Space',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    title: '',
    subtitle: "L'espace personnel sera proposé aux utilisateurs connectés si vous activez l'authentification.",
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
      title: 'Pages supplémentaires en iframe',
      children: ['accountPages']
    }]
  },
  required: ['navigationColor', 'hidePages', 'accountPages'],
  properties: {
    navigationColor: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-background',
      title: "Couleur de la barre de navigation de l'espace personnel",
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
      title: "Cacher des pages dans l'espace personnel",
      items: {
        type: 'string',
        oneOf: [
          {
            const: 'notifications',
            title: 'Notifications'
          },
          {
            const: 'api-keys',
            title: "Clés d'API"
          },
          {
            const: 'contribute',
            title: 'Contribuer'
          },
          {
            const: 'processings',
            title: 'Traitements'
          }
        ]
      },
      layout: { cols: { md: 6 } },
      default: []
    },
    accountPages: {
      type: 'array',
      title: 'Pages supplémentaires en iframe',
      layout: {
        title: '',
        messages: {
          addItem: 'Ajouter une page'
        }
      },
      items: {
        type: 'object',
        required: ['id', 'title', 'href', 'icon'],
        properties: {
          id: {
            type: 'string',
            title: 'Identifiant de la page',
            layout: { cols: { md: 4 } }
          },
          title: {
            type: 'string',
            title: 'Libellé du lien',
            layout: { cols: { md: 4 } }
          },
          icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
          href: {
            type: 'string',
            title: 'URL de la page',
          }
        }
      },
      default: []
    }
  }
}
