import { jsFn, linkItemTitle } from '../common-links/schema.js'

// @ts-expect-error
const imageRef = (label, width) => ({
  type: 'object',
  title: label,
  required: ['_id', 'name', 'mimeType'],
  layout: {
    if: 'parent.data?.source === "upload"',
    cols: { md: 6 },
    slots: { component: { name: 'image-upload', props: { width, label } } }
  },
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    mimeType: { type: 'string' },
    mobileAlt: { type: 'boolean' }
  }
})

const align = { $ref: '#/$defs/align' }
const mb = { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }

// @ts-expect-error
const linksList = (addItem) => ({
  type: 'array',
  title: 'Liens',
  default: [],
  layout: {
    title: '',
    itemTitle: linkItemTitle,
    messages: { addItem }
  },
  items: { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/linkItem' }
})

// summary shown on a collapsed block in the rows dialog
/** @param {any} item */
const elementSubtitleFn = (item) => {
  const align = new Map([['left', 'à gauche'], ['center', 'centré'], ['right', 'à droite']]).get(item.align ?? 'left')
  if (item.type === 'images') return `${item.items?.length ?? 0} image(s) · ${item.height ?? 40}px · ${align}`
  if (item.type === 'text') return `${(item.content ?? '').split('\n')[0].slice(0, 60)} · ${align}`
  if (item.type === 'links') return `${item.items?.length ?? 0} lien(s)` + (item.display === 'columns' ? '' : ` · ${align}`)
  if (item.type === 'buttons') return `${item.items?.length ?? 0} bouton(s) · ${align}`
  if (item.type === 'social') return align
  return ''
}

/** @param {any} item */
const elementTitleFn = (item) => {
  const titles = new Map([['images', 'Images'], ['text', 'Texte'], ['links', 'Liens'], ['buttons', 'Boutons'], ['social', 'Réseaux sociaux'], ['divider', 'Séparateur']])
  return titles.get(item.type) ?? item.type
}
/** @param {any} item */
const imagesItemTitleFn = (item) => {
  const sources = new Map([['upload', 'Image chargée'], ['global', 'Logo du portail'], ['header', "Logo de l'entête"], ['koumoul', 'Logo Koumoul']])
  return (sources.get(item.source) ?? item.source) + (item.label ? ' · ' + item.label : '')
}
export const elementTitle = jsFn(elementTitleFn)
export const elementSubtitle = jsFn(elementSubtitleFn)

// Branches of the "element" discriminated oneOf are declared as plain consts and
// inlined (not $ref'd) below: a bare $ref member of a discriminated oneOf can get
// sibling keywords injected while schemas are resolved for the vjsf/portal-config
// bundle, which makes ajv's discriminator vocabulary treat it as unresolved and fail
// to find "properties/type" - same reason common-links/page-elements inline their branches
const elementImages = {
  type: 'object',
  title: 'FooterImagesElement',
  'x-i18n-title': { en: 'Images', fr: 'Images' },
  additionalProperties: false,
  required: ['type', 'align', 'height', 'items'],
  layout: ['type', { cols: { md: 6 }, key: 'height' }, { cols: { md: 6 }, key: 'align' }, 'items', 'mb'],
  properties: {
    type: { const: 'images', title: 'Images' },
    align,
    height: {
      type: 'integer',
      title: 'Hauteur des images (px)',
      default: 40,
      minimum: 16,
      maximum: 200
    },
    items: {
      type: 'array',
      title: 'Images',
      default: [],
      layout: {
        title: '',
        listEditMode: 'inline',
        itemTitle: jsFn(imagesItemTitleFn),
        messages: { addItem: 'Ajouter une image' }
      },
      items: {
        type: 'object',
        title: 'FooterImagesItem',
        required: ['source'],
        properties: {
          source: {
            type: 'string',
            title: 'Source',
            default: 'upload',
            pattern: '^(upload|global|header|koumoul)$',
            layout: {
              cols: { md: 6 },
              getItems: {
                expr: "[{ key: 'upload', title: 'Image chargée' }, { key: 'global', title: 'Logo du portail' }, { key: 'header', title: \"Logo principal de l'entête\" }, { key: 'koumoul', title: 'Logo Koumoul' }].filter(i => !context.whiteLabel || i.key !== 'koumoul')",
                itemKey: 'item.key',
                itemTitle: 'item.title'
              }
            }
          },
          label: {
            type: 'string',
            title: 'Libellé',
            description: "Texte alternatif de l'image, pour l'accessibilité.",
            layout: { cols: { md: 6 } }
          },
          image: imageRef('Image', 1280),
          imageDark: imageRef('Image - variante pour thème sombre', 1280),
          link: {
            type: 'string',
            title: 'Lien au clic',
            description: 'Une URL externe ouvre un nouvel onglet ; un chemin commençant par « / » navigue dans le portail. Vide : pas de lien.',
            layout: { props: { clearable: true } }
          }
        }
      }
    },
    mb
  }
}
const elementText = {
  type: 'object',
  title: 'FooterTextElement',
  'x-i18n-title': { en: 'Text', fr: 'Texte' },
  additionalProperties: false,
  required: ['type', 'align', 'markdown'],
  layout: ['type', 'content', { cols: { md: 4 }, key: 'markdown' }, { cols: { md: 4 }, key: 'color' }, { cols: { md: 4 }, key: 'align' }, 'mb'],
  properties: {
    type: { const: 'text', title: 'Texte' },
    align,
    content: { type: 'string', title: 'Contenu', layout: 'markdown' },
    content_html: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rendered-html' },
    markdown: {
      type: 'boolean',
      title: 'Interpréter le markdown',
      description: 'Décoché, le texte est affiché tel quel, sans paragraphes ni mise en forme.',
      default: true
    },
    color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color' },
    mb
  }
}
const elementLinks = {
  type: 'object',
  title: 'FooterLinksElement',
  'x-i18n-title': { en: 'Links', fr: 'Liens' },
  additionalProperties: false,
  required: ['type', 'align', 'display', 'items'],
  // the columns display has its own markup, align has no effect on it
  layout: ['type', { cols: { md: 6 }, key: 'display' }, { if: "data.display !== 'columns'", cols: { md: 6 }, children: ['align'] }, 'items', 'mb'],
  properties: {
    type: { const: 'links', title: 'Liens' },
    align,
    display: {
      type: 'string',
      title: 'Disposition',
      default: 'inline',
      oneOf: [
        { const: 'inline', title: 'En ligne' },
        { const: 'list', title: 'En liste verticale' },
        { const: 'columns', title: 'Sur 2 colonnes' }
      ]
    },
    items: linksList('Ajouter un lien'),
    mb
  }
}
const elementButtons = {
  type: 'object',
  title: 'FooterButtonsElement',
  'x-i18n-title': { en: 'Buttons', fr: 'Boutons' },
  additionalProperties: false,
  required: ['type', 'align', 'variant', 'items'],
  layout: ['type', { cols: { md: 6 }, key: 'variant' }, { cols: { md: 6 }, key: 'align' }, 'items', 'mb'],
  properties: {
    type: { const: 'buttons', title: 'Boutons' },
    align,
    variant: {
      type: 'string',
      title: 'Style des boutons',
      default: 'text',
      oneOf: [
        { const: 'text', title: 'Texte' },
        { const: 'outlined', title: 'Contour' },
        { const: 'tonal', title: 'Teinté' },
        { const: 'flat', title: 'Plein' },
        { const: 'elevated', title: 'Surélevé' }
      ]
    },
    items: linksList('Ajouter un bouton'),
    mb
  }
}
const elementSocial = {
  type: 'object',
  title: 'FooterSocialElement',
  'x-i18n-title': { en: 'Social links', fr: 'Réseaux sociaux' },
  additionalProperties: false,
  required: ['type', 'align'],
  layout: ['type', { cols: { md: 8 }, key: 'title' }, { cols: { md: 4 }, key: 'align' }, 'mb'],
  properties: {
    type: { const: 'social', title: 'Réseaux sociaux' },
    align,
    title: {
      type: 'string',
      title: 'Titre au-dessus des icônes',
      description: 'Laissez vide pour le titre par défaut « Retrouvez-nous sur les réseaux sociaux ». Les réseaux affichés sont ceux de « Paramètres généraux › Réseaux sociaux ».'
    },
    mb
  }
}
const elementDivider = {
  type: 'object',
  title: 'FooterDividerElement',
  'x-i18n-title': { en: 'Divider', fr: 'Séparateur' },
  additionalProperties: false,
  required: ['type', 'align', 'opacity', 'thickness'],
  layout: ['type', 'color', { cols: { md: 6 }, key: 'opacity' }, { cols: { md: 6 }, key: 'thickness' }, 'mb'],
  properties: {
    type: { const: 'divider', title: 'Séparateur' },
    align: { type: 'string', default: 'left', enum: ['left', 'center', 'right'], layout: 'none' },
    color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-full' },
    opacity: {
      type: 'number',
      title: 'Opacité',
      layout: { comp: 'slider', props: { thumbLabel: true, showTicks: 'always' } },
      default: 0.10,
      minimum: 0.10,
      maximum: 1
    },
    thickness: {
      type: 'integer',
      title: 'Épaisseur',
      layout: { comp: 'slider', props: { thumbLabel: true, showTicks: 'always' } },
      default: 1,
      minimum: 1,
      maximum: 10
    },
    mb
  }
}

export default {
  $id: 'https://github.com/data-fair/portals/footer-elements',
  'x-exports': ['types'],
  'x-jstt': { additionalProperties: false },
  title: 'Footer elements',
  type: 'array',
  default: [],
  layout: {
    title: '',
    // shared clipboard so a block can be copied from one column and pasted in another
    clipboardKey: 'footer-blocks',
    listEditMode: 'inline-single',
    listActions: ['add', 'edit', 'delete', 'sort', 'duplicate', 'copy', 'paste'],
    itemTitle: elementTitle,
    itemSubtitle: elementSubtitle,
    messages: { addItem: 'Ajouter un bloc' }
  },
  items: { $ref: '#/$defs/element' },
  $defs: {
    align: {
      type: 'string',
      title: 'Alignement',
      default: 'left',
      oneOf: [
        { const: 'left', title: 'Gauche' },
        { const: 'center', title: 'Centré' },
        { const: 'right', title: 'Droite' }
      ]
    },
    element: {
      title: 'Footer element',
      type: 'object',
      layout: {
        getDefaultData: "{ type: 'text', align: 'left' }",
        switch: [
          { if: 'summary', children: [] },
          {}
        ]
      },
      oneOfLayout: { label: 'Type de bloc' },
      discriminator: { propertyName: 'type' },
      oneOf: [
        structuredClone(elementImages),
        structuredClone(elementText),
        structuredClone(elementLinks),
        structuredClone(elementButtons),
        structuredClone(elementSocial),
        structuredClone(elementDivider)
      ]
    }
  }
}
