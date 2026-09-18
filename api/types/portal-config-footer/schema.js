import { jsFn } from '../common-links/schema.js'

const background = {
  type: 'object',
  title: 'FooterBackground',
  required: ['color'],
  layout: [
    { cols: { md: 4 }, key: 'color' },
    { cols: { md: 4 }, key: 'imageLocation' },
    { cols: { md: 4 }, key: 'image' }
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
/** @param {any} item */
const rowTitleFn = (item) => {
  if (item.columns === 3) return '3 colonnes'
  if (item.columns === 2) {
    if (item.disposition === 'left') return 'Colonne de gauche large'
    if (item.disposition === 'right') return 'Colonne de droite large'
    return '2 colonnes'
  }
  return '1 colonne'
}
/** @param {any} item */
const rowSubtitleFn = (item) => {
  let blocks = item.blocks?.length ?? 0
  if (item.columns >= 2) blocks += item.blocks2?.length ?? 0
  if (item.columns >= 3) blocks += item.blocks3?.length ?? 0
  const background = item.background?.color ? ` · fond ${item.background.color}` : ''
  return `${blocks} bloc(s)${background}`
}

const blocks = { $ref: 'https://github.com/data-fair/portals/footer-elements' }
/**
 * @param {string} title
 * @param {string} key
 */
const columnSection = (title, key) => ({ comp: 'section', title, children: [key] })

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
      description: 'Cette option est obligatoire : si vous la désactivez, vous devez afficher le logo de Koumoul dans le pied de page.',
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
              columnSection('Colonne de gauche', 'blocks'),
              columnSection('Colonne de droite', 'blocks2')
            ]
          },
          {
            if: 'data.columns === 3',
            children: [
              { cols: { md: 4 }, key: 'columns' },
              { cols: { md: 4 }, key: 'gutter' },
              { cols: { md: 4 }, key: 'align' },
              'background',
              columnSection('Colonne de gauche', 'blocks'),
              columnSection('Colonne centrale', 'blocks2'),
              columnSection('Colonne de droite', 'blocks3')
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
          title: 'Colonnes',
          default: 1,
          oneOf: [
            { const: 1, title: '1 colonne' },
            { const: 2, title: '2 colonnes' },
            { const: 3, title: '3 colonnes' }
          ]
        },
        disposition: {
          type: 'string',
          title: 'Disposition',
          default: 'equal',
          oneOf: [
            { const: 'equal', title: 'Largeurs égales' },
            { const: 'left', title: 'Gauche plus large' },
            { const: 'right', title: 'Droite plus large' }
          ]
        },
        gutter: {
          type: 'string',
          title: 'Espacement',
          default: 'default',
          oneOf: [
            { const: 'none', title: 'Aucun espacement' },
            { const: 'dense', title: 'Petit espacement' },
            { const: 'default', title: 'Espacement normal' }
          ]
        },
        align: {
          type: 'string',
          title: 'Alignement vertical',
          default: 'start',
          oneOf: [
            { const: 'start', title: 'Aligné en haut' },
            { const: 'center', title: 'Aligné au centre' },
            { const: 'end', title: 'Aligné en bas' }
          ]
        },
        background: { ...structuredClone(background), title: 'Fond de la ligne', description: 'Laissez la couleur vide pour utiliser le fond du pied de page.', required: [] },
        blocks,
        blocks2: { ...blocks },
        blocks3: { ...blocks }
      }
    }
  }
}
