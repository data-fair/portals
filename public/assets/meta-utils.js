export const datasetPageHead = (dataset, applications, pageUrl) => {
  if (!dataset) return { title: 'Page non trouvée' }
  const description = (dataset.description || dataset.title).split('</p>').shift().replace('<p>', '')
  const schema = {
    '@context': 'http://schema.org',
    '@type': 'Dataset',
    url: pageUrl,
    name: dataset.title,
    description,
    author: {
      '@type': dataset.owner.type === 'user' ? 'Person' : 'Organization',
      name: dataset.owner.name
    },
    creator: {
      '@type': dataset.owner.type === 'user' ? 'Person' : 'Organization',
      name: dataset.owner.name
    },
    dateCreated: dataset.createdAt,
    dateModified: dataset.dataUpdatedAt,
    sdPublisher: require('~/assets/organization.json'),
    sdDatePublished: dataset.createdAt,
    encodingFormat: 'application/json',
    citation: dataset.origin
  }
  if (dataset.bbox) {
    schema.spatialCoverage = {
      '@type': 'Place',
      geo: {
        '@type': 'GeoShape',
        box: dataset.bbox.slice(0, 2).join(',') + ' ' + dataset.bbox.slice(2, 4).join(',')
      }
    }
  }
  if (dataset.license && dataset.license.href) schema.license = dataset.license.href
  if (applications && applications.count) {
    schema.image = {
      '@type': 'imageObject',
      url: applications.results[0].href + '/capture'
    }
    schema.thumbnailUrl = applications.results[0].href + '/capture'
  }
  const meta = [
    { hid: 'description', name: 'description', content: description },
    { property: 'og:url', content: pageUrl },
    { hid: 'og:title', property: 'og:title', content: dataset.title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'article' },
    { property: 'article:author', content: dataset.owner.name },
    { property: 'article:modified_time', content: dataset.dataUpdatedAt },
    { property: 'article:published_time', content: dataset.createdAt },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
  if (applications && applications.count) {
    meta.push({ hid: 'og:image', property: 'og:image', content: applications.results[0].href + '/capture' })
    meta.push({ hid: 'og:image:width', property: 'og:image:width', content: 800 })
    meta.push({ hid: 'og:image:height', property: 'og:image:height', content: 450 })
  }
  return {
    title: dataset.title,
    meta,
    __dangerouslyDisableSanitizers: ['script'],
    script: [
      {
        hid: 'schema',
        innerHTML: JSON.stringify(schema),
        type: 'application/ld+json'
      }
    ]
  }
}
