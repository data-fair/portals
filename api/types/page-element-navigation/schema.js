import { linkItemTitle } from '../common-links/schema.js'

export default {
  $id: 'https://github.com/data-fair/portals/page-element-navigation',
  'x-exports': [],
  $defs: {
    'element-button': {
      type: 'object',
      title: 'ButtonElement',
      'x-i18n-title': {
        en: 'Navigation button',
        fr: 'Bouton de navigation'
      },
      layout: {
        children: [
          'type',
          'link',
          {
            title: 'Configuration du bouton',
            comp: 'card',
            children: [
              'usePortalConfig',
              {
                if: '!parent.data?.usePortalConfig',
                children: ['config']
              },
              'centered'
            ]
          },
          'mb'
        ]
      },
      required: ['type'],
      properties: {
        type: { const: 'button' },
        uuid: { type: 'string', layout: 'none' },
        link: { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/linkItem' },
        usePortalConfig: {
          type: 'boolean',
          title: 'Utiliser la configuration du portail',
          layout: 'switch',
          default: true
        },
        config: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/buttonConfig' },
        centered: {
          type: 'boolean',
          title: 'Centré',
          default: true
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-menu': {
      type: 'object',
      title: 'MenuElement',
      'x-i18n-title': {
        en: 'Navigation menu',
        fr: 'Menu de navigation'
      },
      layout: {
        children: [
          'type',
          'label',
          'links',
          {
            title: 'Configuration du menu',
            comp: 'card',
            children: [
              'usePortalConfig',
              {
                if: '!parent.data?.usePortalConfig',
                children: ['config']
              },
              'centered'
            ]
          },
          'mb'
        ]
      },
      required: ['type'],
      properties: {
        type: { const: 'menu' },
        uuid: { type: 'string', layout: 'none' },
        label: {
          type: 'string',
          title: 'Libellé du menu',
          description: 'Texte affiché sur le bouton du menu',
          default: 'Menu'
        },
        links: {
          type: 'array',
          title: 'Liens',
          items: { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/linkItem' },
          layout: {
            itemTitle: linkItemTitle,
            messages: { addItem: 'Ajouter un lien' }
          }
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Utiliser la configuration du portail',
          layout: 'switch',
          default: true
        },
        config: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/buttonConfig' },
        centered: {
          type: 'boolean',
          title: 'Centré',
          default: true
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-breadcrumbs': {
      type: 'object',
      title: 'BreadcrumbsElement',
      'x-i18n-title': {
        en: 'Breadcrumbs',
        fr: 'Fil d\'Ariane'
      },
      required: ['type'],
      properties: {
        type: { const: 'breadcrumbs' },
        uuid: { type: 'string', layout: 'none' },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
  }
}
