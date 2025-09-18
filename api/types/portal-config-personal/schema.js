export default {
  $id: 'https://github.com/data-fair/portals/portal-config-personal',
  'x-exports': [],
  title: 'Personal Space',
  type: 'object',
  layout: { title: 'L\'espace personnel sera proposé aux utilisateurs connectés si vous activez l\'authentification.' },
  unevaluatedProperties: false,
  required: ['navigationColor', 'hidePages', 'accountPages'],
  properties: {
    navigationColor: {
      type: 'string',
      title: 'Couleur de la barre de navigation de l\'espace personnel',
      default: 'primary',
      oneOf: [
        { const: 'primary', title: 'Couleur principale' },
        { const: 'secondary', title: 'Couleur secondaire' },
        { const: 'accent', title: 'Couleur accentuée' },
        { const: 'surface', title: 'Couleur des surfaces' },
        { const: 'background', title: 'Couleur du fond de page' }
      ]
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
      default: []
    },
    accountPages: {
      type: 'array',
      title: 'Pages supplémentaires en iframe',
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
          icon: {
            title: 'Icône',
            description: 'Il est possible de consulter plus facilement la liste des icônes disponibles sur <a href="https://pictogrammers.com/library/mdi/" target="_blank">ce site</a>.',
            type: 'object',
            layout: {
              cols: { md: 4 },
              getItems: {
                url: 'https://koumoul.com/data-fair/api/v1/datasets/icons-mdi-latest/lines?q={q}&select=name,svg,svgPath&size=25',
                itemsResults: 'data.results',
                itemTitle: 'item.name',
                itemIcon: 'item.svg',
                itemKey: 'item.name'
              }
            },
            properties: {
              name: { type: 'string' },
              svg: { type: 'string' },
              svgPath: { type: 'string' }
            }
          },
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
