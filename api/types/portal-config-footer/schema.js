const background = {
  type: 'object',
  title: 'FooterBackground',
  required: ['color'],
  layout: [
    { cols: { md: 6 }, key: 'color' },
    { cols: { md: 6 }, key: 'imageLocation' },
    'image'
  ],
  properties: {
    color: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-background',
      title: 'Couleur de fond',
      layout: {
        slots: {
          item: { name: 'color-select-item' },
          selection: { name: 'color-select-selection' }
        },
        props: { background: true }
      }
    },
    image: {
      type: 'object',
      title: 'Image de fond',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: { component: { name: 'image-upload', props: { width: 2560, label: 'Chargez une image de fond' } } }
      },
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        mimeType: { type: 'string' },
        mobileAlt: { type: 'boolean' }
      }
    },
    imageLocation: {
      type: 'string',
      title: "Position de l'image de fond",
      default: 'right',
      oneOf: [
        { const: 'left', title: 'Gauche' },
        { const: 'center', title: 'Centre' },
        { const: 'right', title: 'Droite' },
        { const: 'repeat', title: 'Répétée' }
      ]
    }
  }
}

// list row labels: same js-fn mechanism as linkItemTitle in common-links (receives `item` only)
// @ts-expect-error
const rowTitleFn = (item) => {
  // @ts-expect-error
  const widths = (item.columns ?? []).map(column => column.width ?? 'auto').join(' + ')
  return `Ligne · ${widths || 'vide'}`
}
// @ts-expect-error
const rowSubtitleFn = (item) => {
  // @ts-expect-error
  const blocks = (item.columns ?? []).reduce((total, column) => total + (column.blocks?.length ?? 0), 0)
  const background = item.background?.color ? ` · fond ${item.background.color}` : ''
  return `${blocks} bloc(s)${background}`
}
// @ts-expect-error
const columnTitleFn = (item) => {
  const width = (item.width ?? 'auto') === 'auto' ? 'largeur auto' : item.width
  return `Colonne · ${width} · ${item.blocks?.length ?? 0} bloc(s)`
}
// @ts-expect-error
const jsFn = (fn) => ({ expr: fn.toString().replace(/^[^{]+{|}$/g, '').trim(), type: 'js-fn' })

export default {
  $id: 'https://github.com/data-fair/portals/portal-config-footer',
  'x-exports': ['types'],
  'x-jstt': { additionalProperties: false },
  title: 'Footer',
  type: 'object',
  layout: {
    title: null,
    children: [
      {
        comp: 'card',
        title: 'Options',
        children: [
          { if: '!context.whiteLabel', children: ['copyright'] },
          'background'
        ]
      },
      { comp: 'card', title: 'Lignes', children: ['rows'] },
      { name: 'footer-preview' }
    ]
  },
  required: ['copyright', 'background', 'rows'],
  properties: {
    copyright: {
      type: 'boolean',
      title: 'Afficher la mention « ©année — Koumoul » en bas du pied de page',
      description: 'Si vous la masquez, un bloc Images doit contenir le logo Koumoul.',
      default: true
    },
    background: { ...background, title: 'Fond du pied de page' },
    rows: {
      type: 'array',
      title: 'Lignes',
      default: [],
      layout: {
        title: '',
        listEditMode: 'inline-single',
        listActions: ['add', 'edit', 'delete', 'sort', 'duplicate'],
        itemTitle: jsFn(rowTitleFn),
        itemSubtitle: jsFn(rowSubtitleFn),
        messages: { addItem: 'Ajouter une ligne' }
      },
      items: { $ref: '#/$defs/row' }
    }
  },
  $defs: {
    row: {
      type: 'object',
      title: 'FooterRow',
      required: ['columns'],
      layout: [
        {
          comp: 'expansion-panels',
          children: [{
            title: 'Fond de la ligne',
            children: ['background']
          }]
        },
        'columns'
      ],
      properties: {
        background: { ...structuredClone(background), title: 'Fond de la ligne', description: 'Laissez la couleur vide pour utiliser le fond du pied de page.', required: [] },
        columns: {
          type: 'array',
          title: 'Colonnes',
          minItems: 1,
          maxItems: 4,
          default: [{ width: 'auto', blocks: [] }],
          layout: {
            title: '',
            listEditMode: 'inline',
            listActions: ['add', 'delete', 'sort'],
            itemTitle: jsFn(columnTitleFn),
            messages: { addItem: 'Ajouter une colonne' }
          },
          items: { $ref: '#/$defs/column' }
        }
      }
    },
    column: {
      type: 'object',
      title: 'FooterColumn',
      required: ['width', 'blocks'],
      properties: {
        width: {
          type: 'string',
          title: 'Largeur',
          description: "« Automatique » partage l'espace restant à parts égales. Sur mobile les colonnes s'empilent.",
          default: 'auto',
          oneOf: [
            { const: 'auto', title: 'Automatique' },
            { const: '1/4', title: 'Un quart' },
            { const: '1/3', title: 'Un tiers' },
            { const: '1/2', title: 'Moitié' },
            { const: '2/3', title: 'Deux tiers' },
            { const: '3/4', title: 'Trois quarts' }
          ]
        },
        blocks: { $ref: 'https://github.com/data-fair/portals/footer-elements' }
      }
    }
  }
}
