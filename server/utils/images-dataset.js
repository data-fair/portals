exports.id = (portal) => {
  return `portals-images-${portal._id.toLowerCase()}`
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
