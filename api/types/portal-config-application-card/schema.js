export default {
  $id: 'https://github.com/data-fair/portals/portal-config-application-card',
  'x-exports': [],
  title: 'Application Card',
  type: 'object',
  layout: { title: null },
  unevaluatedProperties: false,
  properties: {
    actionsLocation: {
      type: 'string',
      title: "Position des boutons d'actions sur la carte",
      layout: { cols: { md: 6 } },
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
      layout: { cols: { md: 6 } },
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
      layout: { cols: { md: 6 } }
    },
    rounded: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
      title: 'Arrondi de la carte',
      layout: { cols: { md: 6 } }
    },
    showSummary: {
      type: 'boolean',
      title: 'Afficher le résumé sur la carte',
      layout: {
        comp: 'switch',
        cols: { md: 6 }
      },
      default: true
    },
    showDepartment: {
      type: 'boolean',
      title: 'Afficher le département du propriétaire',
      description: 'Affiche le département du propriétaire si la visualisation est détenue par un département.',
      layout: {
        comp: 'switch',
        cols: { md: 6 }
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
              'useTopic',
              'crop'
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
          layout: { cols: { md: 4 } }
        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          layout: { cols: { md: 4 } }
        },
        density: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density',
          layout: { cols: { md: 4 } }
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
          layout: { cols: { md: 4 } }
        },
        showIcon: {
          type: 'boolean',
          title: 'Afficher les icônes',
          layout: {
            comp: 'switch',
            cols: { md: 4 }
          },
          default: true
        },
        iconColor: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics',
          title: 'Couleur des icônes',
          layout: {
            if: 'parent.data?.showIcon === true',
            cols: { md: 4 }
          }
        }
      }
    }
  }
}
