import { jsFn } from '../common-links/schema.js'

const background = {
  type: 'object',
  title: 'FooterBackground',
  required: ['color'],
  layout: [
    { cols: { md: 4 }, key: 'color' },
    { cols: { md: 4 }, key: 'image' },
    'imageLocation'
  ],
  properties: {
    color: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-background',
      title: 'Background color',
      'x-i18n-title': { fr: 'Couleur de fond' },
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
      title: 'Background image',
      'x-i18n-title': { fr: 'Image de fond' },
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: { component: { name: 'image-upload', props: { width: 2560, label: 'Upload a background image', 'x-i18n-label': { fr: 'Chargez une image de fond' } } } }
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
      title: 'Background image position',
      'x-i18n-title': { fr: "Position de l'image de fond" },
      default: 'right',
      layout: { if: 'parent.data?.image?._id', cols: { md: 4 } },
      oneOf: [
        { const: 'left', title: 'Left', 'x-i18n-title': { fr: 'Gauche' } },
        { const: 'center', title: 'Center', 'x-i18n-title': { fr: 'Centre' } },
        { const: 'right', title: 'Right', 'x-i18n-title': { fr: 'Droite' } },
        { const: 'repeat', title: 'Repeated', 'x-i18n-title': { fr: 'Répétée' } }
      ]
    }
  }
}

// list row labels: js-fn bodies are extracted, so all the logic stays inside each function
/** @param {any} item @param {any} parent */
const rowTitleFn = (item, parent) => {
  const index = parent.data.rows.indexOf(item)
  return index === -1 ? 'Row' : `Row ${index + 1}`
}
/** @param {any} item @param {any} parent */
const rowTitleFnFr = (item, parent) => {
  const index = parent.data.rows.indexOf(item)
  return index === -1 ? 'Ligne' : `Ligne ${index + 1}`
}
/** @param {any} item */
const rowSubtitleFn = (item) => {
  /** @param {string} label @param {any[] | undefined} blocks */
  const column = (label, blocks) => `${label}: ${blocks?.length ?? 0} block${(blocks?.length ?? 0) > 1 ? 's' : ''}`
  if (item.columns === 3) return [column('Left', item.blocks), column('Center', item.blocks2), column('Right', item.blocks3)].join(' · ')
  if (item.columns === 2) {
    const left = new Map([['left', 'Left (wide)'], ['right', 'Left (narrow)']]).get(item.disposition) ?? 'Left'
    const right = new Map([['left', 'Right (narrow)'], ['right', 'Right (wide)']]).get(item.disposition) ?? 'Right'
    return [column(left, item.blocks), column(right, item.blocks2)].join(' · ')
  }
  return column('Single column', item.blocks)
}
/** @param {any} item */
const rowSubtitleFnFr = (item) => {
  /** @param {string} label @param {any[] | undefined} blocks */
  const column = (label, blocks) => `${label} : ${blocks?.length ?? 0} bloc${(blocks?.length ?? 0) > 1 ? 's' : ''}`
  if (item.columns === 3) return [column('Gauche', item.blocks), column('Centre', item.blocks2), column('Droite', item.blocks3)].join(' · ')
  if (item.columns === 2) {
    const left = new Map([['left', 'Gauche (large)'], ['right', 'Gauche (étroite)']]).get(item.disposition) ?? 'Gauche'
    const right = new Map([['left', 'Droite (étroite)'], ['right', 'Droite (large)']]).get(item.disposition) ?? 'Droite'
    return [column(left, item.blocks), column(right, item.blocks2)].join(' · ')
  }
  return column('Colonne unique', item.blocks)
}

const blocks = { $ref: 'https://github.com/data-fair/portals/footer-elements' }
/**
 * @param {string} title
 * @param {string} fr
 * @param {string} key
 */
const columnSection = (title, fr, key) => ({ comp: 'section', title, 'x-i18n-title': { fr }, children: [key] })

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
      { comp: 'card', title: 'Rows', 'x-i18n-title': { fr: 'Lignes' }, children: ['rows'] },
      { name: 'footer-preview' }
    ]
  },
  required: ['copyright', 'background', 'rows'],
  properties: {
    copyright: {
      type: 'boolean',
      title: 'Show the "©year — Koumoul" credit at the bottom of the footer',
      'x-i18n-title': { fr: 'Afficher la mention « ©année — Koumoul » en bas du pied de page' },
      description: 'Required, unless the Koumoul logo is shown in a footer row.',
      'x-i18n-description': { fr: 'Obligatoire, sauf si le logo Koumoul figure dans une ligne du pied de page.' },
      default: true
    },
    background: { ...background, title: 'Footer background', 'x-i18n-title': { fr: 'Fond du pied de page' } },
    rows: {
      type: 'array',
      title: 'Rows',
      'x-i18n-title': { fr: 'Lignes' },
      default: [],
      layout: {
        title: '',
        listEditMode: 'inline-single',
        listActions: ['add', 'edit', 'delete', 'sort', 'duplicate'],
        itemTitle: { ...jsFn(rowTitleFn), pure: false },
        'x-i18n-itemTitle': { fr: { ...jsFn(rowTitleFnFr), pure: false } },
        itemSubtitle: jsFn(rowSubtitleFn),
        'x-i18n-itemSubtitle': { fr: jsFn(rowSubtitleFnFr) },
        messages: { addItem: 'Add a row', 'x-i18n-addItem': { fr: 'Ajouter une ligne' } }
      },
      items: { $ref: '#/$defs/row' }
    }
  },
  $defs: {
    row: {
      type: 'object',
      title: 'FooterRow',
      required: ['columns', 'blocks'],
      layout: {
        switch: [
          { if: 'summary', children: [] },
          {
            if: 'data.columns === 2',
            children: [
              { cols: { md: 3 }, key: 'columns' },
              { cols: { md: 3 }, key: 'disposition' },
              { cols: { md: 3 }, key: 'gutter' },
              { cols: { md: 3 }, key: 'align' },
              'background',
              columnSection('Left column', 'Colonne de gauche', 'blocks'),
              columnSection('Right column', 'Colonne de droite', 'blocks2')
            ]
          },
          {
            if: 'data.columns === 3',
            children: [
              { cols: { md: 4 }, key: 'columns' },
              { cols: { md: 4 }, key: 'gutter' },
              { cols: { md: 4 }, key: 'align' },
              'background',
              columnSection('Left column', 'Colonne de gauche', 'blocks'),
              columnSection('Center column', 'Colonne centrale', 'blocks2'),
              columnSection('Right column', 'Colonne de droite', 'blocks3')
            ]
          },
          {
            children: [
              { cols: { md: 3 }, key: 'columns' },
              'background',
              'blocks'
            ]
          }
        ]
      },
      properties: {
        columns: {
          type: 'integer',
          title: 'Columns',
          'x-i18n-title': { fr: 'Colonnes' },
          default: 1,
          oneOf: [
            { const: 1, title: '1 column', 'x-i18n-title': { fr: '1 colonne' } },
            { const: 2, title: '2 columns', 'x-i18n-title': { fr: '2 colonnes' } },
            { const: 3, title: '3 columns', 'x-i18n-title': { fr: '3 colonnes' } }
          ]
        },
        disposition: {
          type: 'string',
          title: 'Layout',
          'x-i18n-title': { fr: 'Disposition' },
          default: 'equal',
          oneOf: [
            { const: 'equal', title: 'Equal widths', 'x-i18n-title': { fr: 'Largeurs égales' } },
            { const: 'left', title: 'Wider left', 'x-i18n-title': { fr: 'Gauche plus large' } },
            { const: 'right', title: 'Wider right', 'x-i18n-title': { fr: 'Droite plus large' } }
          ]
        },
        gutter: {
          type: 'string',
          title: 'Spacing',
          'x-i18n-title': { fr: 'Espacement' },
          default: 'default',
          oneOf: [
            { const: 'none', title: 'No spacing', 'x-i18n-title': { fr: 'Aucun espacement' } },
            { const: 'dense', title: 'Small spacing', 'x-i18n-title': { fr: 'Petit espacement' } },
            { const: 'default', title: 'Normal spacing', 'x-i18n-title': { fr: 'Espacement normal' } }
          ]
        },
        align: {
          type: 'string',
          title: 'Vertical alignment',
          'x-i18n-title': { fr: 'Alignement vertical' },
          default: 'start',
          oneOf: [
            { const: 'start', title: 'Top-aligned', 'x-i18n-title': { fr: 'Aligné en haut' } },
            { const: 'center', title: 'Center-aligned', 'x-i18n-title': { fr: 'Aligné au centre' } },
            { const: 'end', title: 'Bottom-aligned', 'x-i18n-title': { fr: 'Aligné en bas' } }
          ]
        },
        background: {
          ...structuredClone(background),
          title: 'Row background',
          'x-i18n-title': { fr: 'Fond de la ligne' },
          description: 'Leave the color empty to use the footer background.',
          'x-i18n-description': { fr: 'Laissez la couleur vide pour utiliser le fond du pied de page.' },
          required: []
        },
        blocks,
        blocks2: { ...blocks },
        blocks3: { ...blocks }
      }
    }
  }
}
