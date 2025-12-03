export default {
  $id: 'https://github.com/data-fair/portals/portal-config-uses',
  'x-exports': [],
  title: 'Uses',
  'x-i18n-title': {
    fr: 'Réutilisations'
  },
  type: 'object',
  layout: {
    title: null,
    comp: 'expansion-panels',
    children: [
      {
        title: 'Use card',
        'x-i18n-title': {
          fr: "Vignette d'une réutilisation"
        },
        children: ['card']
      }
    ]
  },
  unevaluatedProperties: false,
  required: ['card'],
  properties: {
    card: { $ref: 'https://github.com/data-fair/portals/portal-config-use-card' }
  }
}
