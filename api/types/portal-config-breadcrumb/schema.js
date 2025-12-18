export default {
  $id: 'https://github.com/data-fair/portals/portal-config-breadcrumb',
  'x-exports': [],
  title: 'Breadcrumb',
  type: 'object',
  layout: { title: null },
  properties: {
    position: {
      type: 'string',
      title: 'Position du fil d\'arianne',
      default: 'none',
      oneOf: [
        { const: 'none', title: 'Aucun' },
        { const: 'below-nav', title: 'Sous la barre de navigation' },
        { const: 'above-footer', title: 'Au-dessus du pied de page' },
        { const: 'both', title: 'Les deux' }
      ]
    },
    showHome: {
      type: 'boolean',
      title: "Afficher le lien vers la page d'accueil",
      layout: {
        comp: 'switch',
        if: 'parent.data?.position !== "none"',
        cols: { md: 6 }
      },
      default: true
    },
    homeLabel: {
      type: 'string',
      title: "Libellé du lien vers la page d'accueil",
      layout: {
        if: 'parent.data?.position !== "none" && parent.data?.showHome === true',
        cols: { md: 6 }
      },
      default: 'Accueil'
    },
    separator: {
      type: 'object',
      title: 'Séparateur',
      layout: {
        if: 'parent.data?.position !== "none"',
        comp: 'card'
      },
      properties: {
        type: {
          type: 'string',
          title: 'Type de séparateur',
          default: 'text',
          layout: { cols: { md: 4 } },
          oneOf: [
            { const: 'text', title: 'Texte' },
            { const: 'icon', title: 'Icône' }
          ]
        },
        text: {
          type: 'string',
          title: 'Texte du séparateur',
          layout: {
            if: 'parent.data?.type === "text"',
            cols: { md: 4 }
          },
          default: '/'
        },
        icon: {
          type: 'object',
          title: 'Icône MDI',
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
          layout: { cols: { md: 4 } }
        }
      }
    }
  }
}
