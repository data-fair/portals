export default {
  $id: 'https://github.com/data-fair/portals/portal-config-application-card',
  'x-exports': [],
  title: 'Application Card',
  'x-i18n-title': {
    fr: "Vignette d'une application"
  },
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    children: [{
      comp: 'card',
      title: 'Options',
      children: [
        { cols: { md: 6 }, key: 'actionsLocation' },
        { cols: { md: 6 }, key: 'actionsStyle' },
        { cols: { md: 6 }, key: 'elevation' },
        { cols: { md: 6 }, key: 'rounded' },
        { cols: { md: 6 }, key: 'titleLinesCount' },
        { cols: { md: 6 }, key: 'showSummary' },
        { cols: { md: 6 }, key: 'showDepartment' }
      ]
    },
    'thumbnail',
    'topics'
    ]
  },
  properties: {
    actionsLocation: {
      type: 'string',
      title: "Position des boutons d'actions sur la carte",
      layout: { cols: { md: 4 } },
      default: 'bottom',
      oneOf: [
        { const: 'right', title: 'À droite' },
        { const: 'bottom', title: 'En bas' },
        { const: 'none', title: 'Aucun' }
      ]
    },
    actionsStyle: {
      type: 'string',
      title: "Style des boutons d'actions",
      layout: { cols: { md: 4 } },
      default: 'full',
      oneOf: [
        { const: 'icon', title: 'Icône seulement' },
        { const: 'full', title: 'Icône et texte' },
        { const: 'text', title: 'Texte seulement' }
      ]
    },
    elevation: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
      title: 'Élévation de la carte',
      layout: { cols: { md: 4 } }
    },
    rounded: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
      title: 'Arrondi de la carte',
      layout: { cols: { md: 4 } }
    },
    titleLinesCount: {
      type: 'number',
      title: 'Nombre de lignes pour le titre',
      description: 'Force le titre à occuper exactement N lignes.',
      layout: { cols: { md: 4 } },
      default: 2,
      oneOf: [
        { const: 1, title: '1 ligne' },
        { const: 2, title: '2 lignes' },
        { const: 0, title: 'Sans limite de lignes' }
      ]
    },
    showSummary: {
      type: 'boolean',
      title: 'Afficher le résumé',
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      },
      default: true
    },
    showDepartment: {
      type: 'boolean',
      title: 'Afficher le propriétaire',
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      },
      default: true
    },
    thumbnail: {
      type: 'object',
      title: "Configuration de l'image",
      layout: {
        comp: 'card',
        children: [
          'show',
          {
            if: 'data?.show === true',
            children: [
              'location',
              'crop',
              'useTopic'
            ]
          },
        ]
      },
      properties: {
        show: {
          type: 'boolean',
          title: "Afficher l'image",
          layout: 'switch',
          default: true
        },
        location: {
          type: 'string',
          title: "Position de l'image sur la carte",
          layout: { cols: { md: 6 } },
          default: 'center',
          oneOf: [
            { const: 'left', title: 'À gauche' },
            { const: 'top', title: 'En haut' },
            { const: 'center', title: 'Sous le titre' }
          ]
        },
        useTopic: {
          type: 'boolean',
          title: "Utiliser l'image de la première thématique",
          description: "Permet d'utiliser l'image de la première thématique du jeu de données si aucune image n'est définie pour ce dernier.",
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          },
          default: false
        },
        crop: {
          type: 'boolean',
          title: "Recadrer l'image pour un rendu uniforme",
          description: "Si désactivé, l'image gardera son ratio d'origine",
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          },
          default: true
        }
      }
    },
    topics: {
      type: 'object',
      title: 'Configuration des thématiques',
      layout: {
        comp: 'card',
        children: [
          'show',
          {
            if: 'data?.show === true',
            children: [
              'color',
              'elevation',
              'density',
              'rounded',
              'showIcon',
              'iconColor'
            ]
          }
        ]
      },
      properties: {
        show: {
          type: 'boolean',
          title: 'Afficher les thématiques',
          layout: 'switch',
        },
        color: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics',
          layout: { cols: { md: 6 } }
        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          layout: { cols: { md: 6 } }
        },
        density: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density',
          layout: { cols: { md: 6 } }
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
          layout: { cols: { md: 6 } }
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
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics',
          title: 'Couleur des icônes',
          layout: {
            if: 'parent.data?.showIcon === true',
            cols: { md: 6 }
          }
        }
      }
    }
  }
}
