exports.id = (portal) => {
  // lowercase and replace of _ are for retro-compatibility,
  // previous portals ids ware not accepted as ids for datasets
  // now that we use UUID it should work fine
  return `portals-images-${portal._id.toLowerCase().replace(/_/g, '').replace(/^-/, '').replace(/-$/, '')}`
}

exports.init = (portal) => {
  return {
    title: `Portail - Images - ${portal.title}`,
    isRest: true,
    rest: {
      history: false
    },
    primaryKey: [
      'pageId',
      'assetId'
    ],
    attachmentsAsImage: true,
    thumbnails: { resizeMode: 'fitIn', trim: false },
    schema: [
      {
        key: 'attachmentPath',
        type: 'string',
        title: 'Pièce jointe',
        'x-refersTo': 'http://schema.org/DigitalDocument',
        'x-capabilities': {
          indexAttachment: false
        },
        description: ''
      },
      {
        key: 'pageId',
        type: 'string',
        title: 'Page - Identifiant',
        icon: 'mdi-text-short',
        'x-capabilities': {
          textAgg: false,
          insensitive: false,
          text: false,
          textStandard: false
        },
        maxLength: 200,
        description: ''
      },
      {
        key: 'pageTitle',
        type: 'string',
        title: 'Page - Titre',
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
        key: 'assetId',
        type: 'string',
        title: 'Ressource - Identifiant',
        icon: 'mdi-text-short',
        'x-capabilities': {
          textAgg: false,
          insensitive: false,
          text: false,
          textStandard: false,
          values: false
        },
        maxLength: 200,
        description: ''
      },
      {
        key: 'assetTitle',
        type: 'string',
        title: 'Ressource - Titre',
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
      }
    ]
  }
}
