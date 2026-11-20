export default {
  $id: 'https://github.com/data-fair/portals/portal-config-labels-overrides',
  'x-exports': [],
  type: 'object',
  title: '',
  properties: {
    owner: {
      type: 'string',
      title: 'Word to use instead of "Owner"',
      'x-i18n-title': { fr: 'Mot à utiliser à la place de « Propriétaire »' },
      description: 'Overrides the term `owner`, used in the metadata of datasets and applications as well as in the related filters.',
      'x-i18n-description': { fr: 'Surcharge le terme `propriétaire`, utilisé dans les métadonnées des jeux de données et des visualisations ainsi que dans les filtres associés.' },
    }
  }
}
