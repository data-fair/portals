export default {
  $id: 'https://github.com/data-fair/portals/common-application-card',
  'x-exports': [],
  title: 'Application Card',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    title: null,
    children: [{
      comp: 'card',
      title: 'Options',
      children: [
        { cols: { md: 6 }, key: 'actionsLocation' },
        { cols: { md: 6 }, key: 'actionsStyle' },
        { cols: { md: 6 }, key: 'elevation' },
        { cols: { md: 6 }, key: 'rounded' },
        { cols: { md: 6 }, key: 'titleLinesCount' },
        { cols: { md: 6 }, key: 'openInFullPage' },
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
      layout: { cols: { md: 4 }, if: 'parent.data?.openInFullPage !== true' },
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
      layout: { cols: { md: 4 }, if: 'parent.data?.openInFullPage !== true' },
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
    openInFullPage: {
      type: 'boolean',
      title: 'Ouvrir la visualisation en plein écran',
      description: 'Au clic sur la vignette, l\'application s\'ouvre en plein écran au lieu d\'afficher la page de détail. Les boutons "Aperçu" et "Plein écran" de la carte sont alors masqués.',
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      },
      default: false
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
              'useTopic',
              'useSummary',
              { markdown: '**Ordre de priorité :**\n1. **Image spécifique** (définie directement sur la visualisation)\n2. **Image de la thématique** (si activé)\n3. **Résumé de la visualisation** (si activé)\n4. **Capture automatique** de la visualisation' }
            ]
          }
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
        crop: {
          type: 'boolean',
          title: "Recadrer l'image pour un rendu uniforme",
          description: "Si désactivé, l'image gardera son ratio d'origine",
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          },
          default: true
        },
        useTopic: {
          type: 'boolean',
          title: "Utiliser l'image de la première thématique",
          description: "Permet d'utiliser l'image de la première thématique de la visualisation si aucune image n'est définie pour cette dernière.",
          layout: {
            comp: 'switch',
            cols: { md: 6 }
          }
        },
        useSummary: {
          type: 'boolean',
          title: 'Utiliser le résumé de la visualisation',
          description: "Affiche le résumé de la visualisation si disponible, à la place de la capture automatique. Disponible uniquement lorsque l'image est positionnée sous le titre.",
          layout: {
            comp: 'switch',
            cols: { md: 6 },
            if: "parent.data?.location === 'center'"
          }
        },
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
              { key: 'color', cols: { md: 4 } },
              { key: 'elevation', cols: { md: 4 } },
              { key: 'density', cols: { md: 4 } },
              { key: 'rounded', cols: { md: 4 } },
              { key: 'variant', cols: { md: 4 } },
              { key: 'showIcon', cols: { md: 4 } },
              { key: 'iconColor', cols: { md: 4 } }
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
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics' },
        elevation: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation' },
        density: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density' },
        rounded: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded' },
        variant: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/variant' },
        showIcon: {
          type: 'boolean',
          title: "Afficher l'icône",
          layout: { comp: 'switch' },
          default: true
        },
        iconColor: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics',
          title: "Couleur de l'icône",
          layout: {
            if: 'parent.data?.showIcon === true'
          }
        }
      }
    }
  }
}
