import { linkItemTitle, linkItemTitleFr } from '../common-links/schema.js'

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
            title: 'Button appearance',
            'x-i18n-title': { fr: 'Apparence du bouton' },
            comp: 'card',
            children: [
              'usePortalConfig',
              {
                if: '!parent.data?.usePortalConfig',
                children: ['config']
              },
              'fullWidth',
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
          title: 'Use the portal configuration',
          'x-i18n-title': { fr: 'Utiliser la configuration du portail' },
          layout: 'switch',
          default: true
        },
        config: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/buttonConfig' },
        fullWidth: {
          type: 'boolean',
          title: 'Show the button at full width',
          'x-i18n-title': { fr: 'Afficher le bouton en pleine largeur' }
        },
        centered: {
          type: 'boolean',
          title: 'Centered',
          'x-i18n-title': { fr: 'Centré' },
          default: true,
          layout: { if: '!parent.data?.fullWidth' }
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
            title: 'Menu appearance',
            'x-i18n-title': { fr: 'Apparence du menu' },
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
          title: 'Menu label',
          'x-i18n-title': { fr: 'Libellé du menu' },
          description: 'Text displayed on the menu button',
          'x-i18n-description': { fr: 'Texte affiché sur le bouton du menu' },
          default: 'Menu'
        },
        links: {
          type: 'array',
          title: 'Links',
          'x-i18n-title': { fr: 'Liens' },
          items: { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/linkItem' },
          layout: {
            itemTitle: linkItemTitle,
            'x-i18n-itemTitle': { fr: linkItemTitleFr },
            messages: {
              addItem: 'Add a link',
              'x-i18n-addItem': { fr: 'Ajouter un lien' }
            }
          }
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Use the portal configuration',
          'x-i18n-title': { fr: 'Utiliser la configuration du portail' },
          layout: 'switch',
          default: true
        },
        config: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/buttonConfig' },
        centered: {
          type: 'boolean',
          title: 'Centered',
          'x-i18n-title': { fr: 'Centré' },
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
