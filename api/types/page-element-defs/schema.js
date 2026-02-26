export default {
  $id: 'https://github.com/data-fair/portals/page-elements-defs',
  'x-exports': [],
  $defs: {
    'margin-bottom': {
      title: 'Espacement inférieur',
      type: 'integer',
      layout: {
        comp: 'slider',
        props: {
          step: 1,
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
