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
      // the blocks render an absent mb as 4 (`mb ?? 4`): blocks stored before this default was 0 keep their spacing
      default: 0,
      minimum: 0,
      maximum: 16
    }
  }
}
