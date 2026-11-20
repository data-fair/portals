export default {
  $id: 'https://github.com/data-fair/portals/page-elements-defs',
  'x-exports': [],
  $defs: {
    'margin-bottom': {
      title: 'Bottom spacing',
      'x-i18n-title': { fr: 'Espacement inférieur' },
      type: 'integer',
      layout: {
        comp: 'slider',
        props: {
          thumbLabel: true,
          showTicks: 'always'
        }
      },
      default: 0,
      minimum: 0,
      maximum: 16
    }
  }
}
