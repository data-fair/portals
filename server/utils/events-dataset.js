exports.id = (portal) => {
  // lowercase and replace of _ are for retro-compatibility,
  // previous portals ids ware not accepted as ids for datasets
  // now that we use UUID it should work fine
  return `portals-events-${portal._id.toLowerCase().replace(/_/g, '').replace(/^-/, '').replace(/-$/, '')}`
}

exports.init = (portal) => {
  return {
    title: `Portail - Évènements - ${portal.title}`,
    owner: portal.owner,
    isRest: true,
    rest: {
      history: true,
      lineOwnership: true
    },
    primaryKey: [
      'pageId',
      '_owner'
    ],
    schema: [
      {
        key: 'pageId',
        type: 'string',
        title: 'Identifiant de page',
        icon: 'mdi-text-short',
        'x-capabilities': {
          textAgg: false,
          insensitive: false,
          text: false,
          textStandard: false
        },
        maxLength: 50,
        description: ''
      },
      {
        key: 'pageTitle',
        type: 'string',
        title: 'Libellé de l\'évènement',
        icon: 'mdi-text-short',
        'x-capabilities': {
          textAgg: false,
          insensitive: false,
          textStandard: false,
          values: false,
          index: false
        },
        maxLength: 200,
        description: ''
      },
      {
        key: 'register',
        type: 'boolean',
        title: 'Présent',
        icon: 'mdi-checkbox-marked-circle-outline',
        description: 'Si l\'utilisateur est présent à l\'évènement'
      }
    ]
  }
}
