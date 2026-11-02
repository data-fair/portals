export default {
  $id: 'https://github.com/data-fair/portals/portal-config-breadcrumb',
  'x-exports': [],
  title: 'Breadcrumb',
  type: 'object',
  layout: {
    title: null,
    children: [
      'position',
      {
        comp: 'card',
        title: 'Options',
        if: 'parent.data?.position !== "none"',
        children: [
          'showHome',
          'homeLabel',
          'fluid',
          'compact',
          'separator'
        ]
      },
      {
        if: 'parent.data?.position !== "none"',
        children: [{ name: 'breadcrumb-preview' }]
      }
    ]
  },
  properties: {
    position: {
      type: 'string',
      title: 'Breadcrumbs position',
      'x-i18n-title': { fr: "Position du fil d'Ariane" },
      default: 'none',
      oneOf: [
        { const: 'none', title: 'None', 'x-i18n-title': { fr: 'Aucun' } },
        { const: 'below-nav', title: 'Below the navigation bar', 'x-i18n-title': { fr: 'Sous la barre de navigation' } },
        { const: 'above-footer', title: 'Above the footer', 'x-i18n-title': { fr: 'Au-dessus du pied de page' } },
        { const: 'both', title: 'Both', 'x-i18n-title': { fr: 'Les deux' } }
      ]
    },
    showHome: {
      type: 'boolean',
      title: 'Show the link to the home page',
      'x-i18n-title': { fr: "Afficher le lien vers la page d'accueil" },
      layout: {
        comp: 'switch',
        if: 'parent.data?.position !== "none"',
        cols: { md: 6 }
      },
      default: true
    },
    homeLabel: {
      type: 'string',
      title: 'Home page link label',
      'x-i18n-title': { fr: "Libellé du lien vers la page d'accueil" },
      layout: {
        if: 'parent.data?.position !== "none" && parent.data?.showHome === true',
        cols: { md: 6 }
      },
      default: 'Accueil'
    },
    fluid: {
      type: 'boolean',
      title: 'Align to the left of the screen',
      'x-i18n-title': { fr: "Aligner à gauche de l'écran" },
      description: 'The breadcrumbs are aligned to the left edge of the screen. Otherwise, they are aligned with the page content.',
      'x-i18n-description': { fr: "Le fil d'Ariane sera aligné au bord gauche de l'écran. Sinon, il sera aligné au contenu de la page." },
      layout: {
        if: 'parent.data?.position !== "none"',
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
    },
    compact: {
      type: 'boolean',
      title: 'Compact display',
      'x-i18n-title': { fr: 'Affichage compact' },
      description: 'The breadcrumbs text is displayed smaller.',
      'x-i18n-description': { fr: "Le texte du fil d'Ariane sera affiché en plus petit." },
      layout: {
        if: 'parent.data?.position !== "none"',
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
    },
    separator: {
      type: 'object',
      title: 'Separator',
      'x-i18n-title': { fr: 'Séparateur' },
      layout: {
        if: 'parent.data?.position !== "none"',
        comp: 'card'
      },
      properties: {
        type: {
          type: 'string',
          title: 'Separator type',
          'x-i18n-title': { fr: 'Type de séparateur' },
          default: 'text',
          layout: { cols: { md: 4 } },
          oneOf: [
            { const: 'text', title: 'Text', 'x-i18n-title': { fr: 'Texte' } },
            { const: 'icon', title: 'Icon', 'x-i18n-title': { fr: 'Icône' } }
          ]
        },
        text: {
          type: 'string',
          title: 'Separator text',
          'x-i18n-title': { fr: 'Texte du séparateur' },
          layout: {
            if: 'parent.data?.type === "text"',
            cols: { md: 4 }
          },
          default: '/'
        },
        icon: {
          type: 'object',
          title: 'MDI icon',
          'x-i18n-title': { fr: 'Icône MDI' },
          required: ['name', 'svg', 'svgPath'],
          layout: {
            if: 'parent.data?.type === "icon"',
            getItems: {
              url: 'https://koumoul.com/data-fair/api/v1/datasets/icons-mdi-latest/lines?q={q}&select=name,svg,svgPath&size=20',
              itemKey: 'data.name',
              itemTitle: 'data.name',
              itemIcon: 'data.svg',
              itemsResults: 'data.results'
            },
            cols: { md: 4 }
          },
          properties: {
            name: { type: 'string' },
            svg: { type: 'string' },
            svgPath: { type: 'string' }
          }
        },
        color: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color',
          layout: {
            slots: {
              item: { name: 'color-select-item' },
              selection: { name: 'color-select-selection' }
            },
            cols: { md: 4 }
          }
        }
      }
    }
  }
}
