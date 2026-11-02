import { jsFn, linkItemTitle, linkItemTitleFr } from '../common-links/schema.js'

// @ts-expect-error
const imageRef = (label, width, fr) => ({
  type: 'object',
  title: label,
  ...(fr && { 'x-i18n-title': { fr } }),
  required: ['_id', 'name', 'mimeType'],
  layout: {
    if: 'parent.data?.source === "upload"',
    cols: { md: 6 },
    slots: { component: { name: 'image-upload', props: { width, label, ...(fr && { 'x-i18n-label': { fr } }) } } }
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
const linksList = (addItem, addItemFr) => ({
  type: 'array',
  title: 'Links',
  'x-i18n-title': { fr: 'Liens' },
  default: [],
  layout: {
    title: '',
    itemTitle: linkItemTitle,
    'x-i18n-itemTitle': { fr: linkItemTitleFr },
    messages: { addItem, 'x-i18n-addItem': { fr: addItemFr } }
  },
  items: { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/linkItem' }
})

// summary shown on a collapsed block in the rows dialog
/** @param {any} item */
const elementSubtitleFn = (item) => {
  const align = new Map([['left', 'left'], ['center', 'centered'], ['right', 'right']]).get(item.align ?? 'left')
  /** @param {string} word */
  const count = (word) => `${item.items?.length ?? 0} ${word}${(item.items?.length ?? 0) > 1 ? 's' : ''}`
  if (item.type === 'images') return `${count('image')} · ${item.height ?? 40}px · ${align}`
  if (item.type === 'text') return `${(item.content ?? '').split('\n')[0].slice(0, 60)} · ${align}`
  if (item.type === 'links') return count('link') + (item.display === 'columns' ? '' : ` · ${align}`)
  if (item.type === 'buttons') return `${count('button')} · ${align}`
  if (item.type === 'social') return align
  return ''
}
/** @param {any} item */
const elementSubtitleFnFr = (item) => {
  const align = new Map([['left', 'à gauche'], ['center', 'centré'], ['right', 'à droite']]).get(item.align ?? 'left')
  /** @param {string} word */
  const count = (word) => `${item.items?.length ?? 0} ${word}${(item.items?.length ?? 0) > 1 ? 's' : ''}`
  if (item.type === 'images') return `${count('image')} · ${item.height ?? 40}px · ${align}`
  if (item.type === 'text') return `${(item.content ?? '').split('\n')[0].slice(0, 60)} · ${align}`
  if (item.type === 'links') return count('lien') + (item.display === 'columns' ? '' : ` · ${align}`)
  if (item.type === 'buttons') return `${count('bouton')} · ${align}`
  if (item.type === 'social') return align
  return ''
}

/** @param {any} item */
const elementTitleFn = (item) => {
  const titles = new Map([['images', 'Image or image list'], ['text', 'Text'], ['links', 'Link or link list'], ['buttons', 'Button or button list'], ['social', 'Social links'], ['divider', 'Divider']])
  return titles.get(item.type) ?? item.type
}
/** @param {any} item */
const elementTitleFnFr = (item) => {
  const titles = new Map([['images', "Image ou liste d'images"], ['text', 'Texte'], ['links', 'Lien ou liste de liens'], ['buttons', 'Bouton ou liste de boutons'], ['social', 'Réseaux sociaux'], ['divider', 'Séparateur']])
  return titles.get(item.type) ?? item.type
}
/** @param {any} item */
const imagesItemTitleFn = (item) => {
  const sources = new Map([['upload', 'Uploaded image'], ['global', 'Portal logo'], ['header', 'Header logo'], ['koumoul', 'Koumoul logo']])
  return (sources.get(item.source) ?? item.source) + (item.label ? ' · ' + item.label : '')
}
/** @param {any} item */
const imagesItemTitleFnFr = (item) => {
  const sources = new Map([['upload', 'Image chargée'], ['global', 'Logo du portail'], ['header', "Logo de l'entête"], ['koumoul', 'Logo Koumoul']])
  return (sources.get(item.source) ?? item.source) + (item.label ? ' · ' + item.label : '')
}
export const elementTitle = jsFn(elementTitleFn)
export const elementTitleFr = jsFn(elementTitleFnFr)
export const elementSubtitle = jsFn(elementSubtitleFn)
export const elementSubtitleFr = jsFn(elementSubtitleFnFr)

// Branches of the "element" discriminated oneOf are declared as plain consts and
// inlined (not $ref'd) below: a bare $ref member of a discriminated oneOf can get
// sibling keywords injected while schemas are resolved for the vjsf/portal-config
// bundle, which makes ajv's discriminator vocabulary treat it as unresolved and fail
// to find "properties/type" - same reason common-links/page-elements inline their branches
const elementImages = {
  type: 'object',
  title: 'FooterImagesElement',
  'x-i18n-title': { en: 'Image or image list', fr: "Image ou liste d'images" },
  additionalProperties: false,
  required: ['type', 'align', 'height', 'items'],
  layout: ['type', { cols: { md: 6 }, key: 'height' }, { cols: { md: 6 }, key: 'align' }, 'items', 'mb'],
  properties: {
    type: { const: 'images', title: 'Image or image list', 'x-i18n-title': { fr: "Image ou liste d'images" } },
    align,
    height: {
      type: 'integer',
      title: 'Image height (px)',
      'x-i18n-title': { fr: 'Hauteur des images (px)' },
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
        'x-i18n-itemTitle': { fr: jsFn(imagesItemTitleFnFr) },
        messages: { addItem: 'Add an image', 'x-i18n-addItem': { fr: 'Ajouter une image' } }
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
                expr: "[{ key: 'upload', title: 'Uploaded image' }, { key: 'global', title: 'Portal logo' }, { key: 'header', title: 'Main header logo' }, { key: 'koumoul', title: 'Koumoul logo' }].filter(i => !context.whiteLabel || i.key !== 'koumoul')",
                'x-i18n-expr': { fr: "[{ key: 'upload', title: 'Image chargée' }, { key: 'global', title: 'Logo du portail' }, { key: 'header', title: \"Logo principal de l'entête\" }, { key: 'koumoul', title: 'Logo Koumoul' }].filter(i => !context.whiteLabel || i.key !== 'koumoul')" },
                itemKey: 'item.key',
                itemTitle: 'item.title'
              }
            }
          },
          label: {
            type: 'string',
            title: 'Label',
            'x-i18n-title': { fr: 'Libellé' },
            description: 'Alternative text of the image, for accessibility.',
            'x-i18n-description': { fr: "Texte alternatif de l'image, pour l'accessibilité." },
            layout: { cols: { md: 6 } }
          },
          image: imageRef('Image', 1280),
          imageDark: imageRef('Image - dark theme variant', 1280, 'Image - variante pour thème sombre'),
          link: {
            type: 'string',
            title: 'Link on click',
            'x-i18n-title': { fr: 'Lien au clic' },
            description: 'An external URL opens a new tab; a path starting with "/" navigates within the portal. Empty: no link.',
            'x-i18n-description': { fr: 'Une URL externe ouvre un nouvel onglet ; un chemin commençant par « / » navigue dans le portail. Vide : pas de lien.' },
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
    type: { const: 'text', title: 'Footer text type', 'x-i18n-title': { fr: 'Texte', en: 'Text' } },
    align,
    content: { type: 'string', title: 'Content', 'x-i18n-title': { fr: 'Contenu' }, layout: 'markdown' },
    content_html: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rendered-html' },
    markdown: {
      type: 'boolean',
      title: 'Interpret markdown',
      'x-i18n-title': { fr: 'Interpréter le markdown' },
      description: 'When unchecked, the text is displayed as is, without paragraphs or formatting.',
      'x-i18n-description': { fr: 'Décoché, le texte est affiché tel quel, sans paragraphes ni mise en forme.' },
      default: true
    },
    color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color' },
    mb
  }
}
const elementLinks = {
  type: 'object',
  title: 'FooterLinksElement',
  'x-i18n-title': { en: 'Link or link list', fr: 'Lien ou liste de liens' },
  additionalProperties: false,
  required: ['type', 'align', 'display', 'items'],
  // the columns display has its own markup, align has no effect on it
  layout: ['type', { cols: { md: 6 }, key: 'display' }, { if: "data.display !== 'columns'", cols: { md: 6 }, children: ['align'] }, 'items', 'mb'],
  properties: {
    type: { const: 'links', title: 'Link or link list', 'x-i18n-title': { fr: 'Lien ou liste de liens' } },
    align,
    display: {
      type: 'string',
      title: 'Layout',
      'x-i18n-title': { fr: 'Disposition' },
      default: 'inline',
      oneOf: [
        { const: 'inline', title: 'Inline', 'x-i18n-title': { fr: 'En ligne' } },
        { const: 'list', title: 'As a vertical list', 'x-i18n-title': { fr: 'En liste verticale' } },
        { const: 'columns', title: 'On 2 columns', 'x-i18n-title': { fr: 'Sur 2 colonnes' } }
      ]
    },
    items: linksList('Add a link', 'Ajouter un lien'),
    mb
  }
}
const elementButtons = {
  type: 'object',
  title: 'FooterButtonsElement',
  'x-i18n-title': { en: 'Button or button list', fr: 'Bouton ou liste de boutons' },
  additionalProperties: false,
  required: ['type', 'align', 'variant', 'items'],
  layout: ['type', { cols: { md: 6 }, key: 'variant' }, { cols: { md: 6 }, key: 'align' }, 'items', 'mb'],
  properties: {
    type: { const: 'buttons', title: 'Button or button list', 'x-i18n-title': { fr: 'Bouton ou liste de boutons' } },
    align,
    variant: {
      type: 'string',
      title: 'Button style',
      'x-i18n-title': { fr: 'Style des boutons' },
      description: 'The "Tonal" style is not recommended for accessibility: the contrast between the text and its tinted background may be insufficient.',
      'x-i18n-description': { fr: "Le style « Teinté » est déconseillé pour l'accessibilité : le contraste entre le texte et son fond teinté peut être insuffisant." },
      default: 'text',
      oneOf: [
        { const: 'text', title: 'Text', 'x-i18n-title': { fr: 'Texte' } },
        { const: 'outlined', title: 'Outlined', 'x-i18n-title': { fr: 'Contour' } },
        { const: 'tonal', title: 'Tonal', 'x-i18n-title': { fr: 'Teinté' } },
        { const: 'flat', title: 'Filled', 'x-i18n-title': { fr: 'Plein' } },
        { const: 'elevated', title: 'Elevated', 'x-i18n-title': { fr: 'Surélevé' } }
      ]
    },
    items: linksList('Add a button', 'Ajouter un bouton'),
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
    type: { const: 'social', title: 'Social networks', 'x-i18n-title': { fr: 'Réseaux sociaux' } },
    align,
    title: {
      type: 'string',
      title: 'Title above the icons',
      'x-i18n-title': { fr: 'Titre au-dessus des icônes' },
      description: 'Leave empty for the default title "Find us on social media". The networks shown are those from "General settings › Social networks".',
      'x-i18n-description': { fr: 'Laissez vide pour le titre par défaut « Retrouvez-nous sur les réseaux sociaux ». Les réseaux affichés sont ceux de « Paramètres généraux › Réseaux sociaux ».' }
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
    type: { const: 'divider', title: 'Divider', 'x-i18n-title': { fr: 'Séparateur' } },
    align: { type: 'string', default: 'left', enum: ['left', 'center', 'right'], layout: 'none' },
    color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-full' },
    opacity: {
      type: 'number',
      title: 'Opacity',
      'x-i18n-title': { fr: 'Opacité' },
      layout: { comp: 'slider', props: { thumbLabel: true, showTicks: 'always' } },
      default: 0.10,
      minimum: 0.10,
      maximum: 1
    },
    thickness: {
      type: 'integer',
      title: 'Thickness',
      'x-i18n-title': { fr: 'Épaisseur' },
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
    'x-i18n-itemTitle': { fr: elementTitleFr },
    itemSubtitle: elementSubtitle,
    'x-i18n-itemSubtitle': { fr: elementSubtitleFr },
    messages: { addItem: 'Add a block', 'x-i18n-addItem': { fr: 'Ajouter un bloc' } }
  },
  items: { $ref: '#/$defs/element' },
  $defs: {
    align: {
      type: 'string',
      title: 'Alignment',
      'x-i18n-title': { fr: 'Alignement' },
      default: 'left',
      oneOf: [
        { const: 'left', title: 'Left', 'x-i18n-title': { fr: 'Gauche' } },
        { const: 'center', title: 'Centered', 'x-i18n-title': { fr: 'Centré' } },
        { const: 'right', title: 'Right', 'x-i18n-title': { fr: 'Droite' } }
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
      oneOfLayout: { label: 'Block type', 'x-i18n-label': { fr: 'Type de bloc' } },
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
