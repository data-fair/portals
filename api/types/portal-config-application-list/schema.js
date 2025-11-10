export default {
  $id: 'https://github.com/data-fair/portals/portal-config-application-list',
  'x-exports': [],
  title: 'Applications List',
  'x-i18n-title': {
    fr: 'Catalogue de visualisations'
  },
  type: 'object',
  unevaluatedProperties: false,
  properties: {
    filtersLocation: {
      type: 'string',
      title: 'Position des filtres de recherche',
      default: 'top',
      layout: { cols: { md: 4 } },
      oneOf: [
        { const: 'top', title: 'En haut de la page' },
        { const: 'left', title: 'À gauche des résultats' }
      ]
    },
    filtersList: {
      type: 'array',
      title: 'Filtres à afficher',
      layout: { cols: { md: 4 } },
      items: {
        type: 'string',
        oneOf: [
          { const: 'base-application', title: 'Filtres par applications' },
          { const: 'topics', title: 'Filtres par thématiques' }
        ]
      }
    },
    defaultSort: {
      type: 'string',
      title: 'Tri par défaut',
      description: "Ce tri sera appliqué par défaut lorsque l'utilisateur arrive sur la page. Lorsqu'il commence une recherche, le tri par pertinence sera appliqué.",
      layout: { cols: { md: 4 } },
      default: 'createdAt',
      oneOf: [
        { const: 'createdAt', title: 'Date de création' },
        { const: 'dataUpdatedAt', title: 'Date de mise à jour' },
        { const: 'title', title: 'Ordre alphabétique' }
      ]
    },
    columns: {
      type: 'integer',
      title: 'Nombre de colonnes',
      description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
      layout: { cols: { md: 4 } },
      default: 2,
      minimum: 1,
      maximum: 3
    },
    topicsFilters: {
      type: 'object',
      title: 'Configuration des filtres de thématiques',
      layout: 'card',
      properties: {
        color: {
          type: 'string',
          title: 'Couleur',
          layout: { cols: { md: 6 } },
          oneOf: [
            { const: 'default', title: 'Couleur de la thématique' },
            { const: 'primary', title: 'Primaire' },
            { const: 'secondary', title: 'Secondaire' },
            { const: 'accent', title: 'Accentuée' }
          ]
        },
        elevation: {
          type: 'integer',
          title: 'Élévation',
          layout: { cols: { md: 6 } },
          default: 0,
          oneOf: [
            { const: 0, title: 'Aucune' },
            { const: 1, title: 'Légère' },
            { const: 2, title: 'Modérée' },
            { const: 3, title: 'Forte' }
          ]
        },
        density: {
          type: 'string',
          title: 'Densité',
          layout: { cols: { md: 6 } },
          default: 'comfortable',
          oneOf: [
            { const: 'default', title: 'Normale' },
            { const: 'comfortable', title: 'Confortable' },
            { const: 'compact', title: 'Compacte' }
          ]
        },
        rounded: {
          type: 'string',
          title: 'Arrondi',
          layout: { cols: { md: 6 } },
          default: 'default',
          oneOf: [
            { const: '0', title: 'Aucun' },
            { const: 'default', title: 'Normal' },
            { const: 'lg', title: 'Moyen' },
            { const: 'xl', title: 'Grand' }
          ]
        },
        showIcon: {
          type: 'boolean',
          title: 'Afficher les icônes',
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          },
          default: true
        },
        iconColor: {
          type: 'string',
          title: 'Couleur des icônes',
          layout: {
            if: 'parent.data?.showIcon === true',
            cols: { md: 6 }
          },
          oneOf: [
            { const: 'default', title: 'Couleur de la thématique' },
            { const: 'primary', title: 'Primaire' },
            { const: 'secondary', title: 'Secondaire' },
            { const: 'accent', title: 'Accentuée' }
          ]
        }
      }
    }
  }
}
