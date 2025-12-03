export default {
  $id: 'https://github.com/data-fair/portals/portal-config-reuses',
  'x-exports': [],
  title: 'Reuses',
  'x-i18n-title': {
    fr: 'Réutilisations'
  },
  type: 'object',
  layout: {
    title: null,
    comp: 'expansion-panels',
    children: [
      {
        title: 'Reuse card',
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
    card: { $ref: 'https://github.com/data-fair/portals/portal-config-reuse-card' }
  }
}
