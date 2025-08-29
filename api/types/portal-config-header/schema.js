export default {
  $id: 'https://github.com/data-fair/portals/portal-config-header',
  'x-exports': [],
  title: 'Header',
  type: 'object',
  layout: {
    title: null
  },
  required: ['hidden'],
  properties: {
    hidden: {
      type: 'boolean',
      layout: 'switch',
      title: 'Masquer l\'entête',
      description: 'Le logo s\'affichera à gauche de la barre de navigation',
      default: false
    }
  }
}
