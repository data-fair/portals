export default {
  $id: 'https://github.com/data-fair/portals/portal-config-breadcrumb',
  'x-exports': [],
  title: 'Breadcrumb',
  type: 'object',
  layout: { title: null },
  properties: {
    position: {
      type: 'string',
      title: "Position du fil d'Ariane",
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
    fluid: {
      type: 'boolean',
      title: "Aligner à gauche de l'écran",
      description: "Le fil d'Ariane sera aligné au bord gauche de l'écran. Sinon, il sera aligné au contenu de la page.",
      layout: {
        if: 'parent.data?.position !== "none"',
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
    },
    compact: {
      type: 'boolean',
      title: 'Affichage compact',
      description: "Le texte du fil d'Ariane sera affiché en plus petit.",
      layout: {
        if: 'parent.data?.position !== "none"',
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
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
