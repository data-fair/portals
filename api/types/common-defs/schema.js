export default {
  $id: 'https://github.com/data-fair/portals/common-defs',
  'x-exports': [],
  $defs: {
    'rendered-html': {
      type: 'string',
      readOnly: true,
      layout: 'none'
    },

    rounded: {
      type: 'string',
      title: 'Rounded',
      'x-i18n-title': { fr: 'Arrondi' },
      oneOf: [
        { const: '0', title: 'None', 'x-i18n-title': { fr: 'Aucun' } },
        { const: 'default', title: 'Normal', 'x-i18n-title': { fr: 'Normal' } },
        { const: 'lg', title: 'Medium', 'x-i18n-title': { fr: 'Moyen' } },
        { const: 'xl', title: 'Large', 'x-i18n-title': { fr: 'Grand' } }
      ]
    },

    elevation: {
      type: 'integer',
      title: 'Elevation',
      'x-i18n-title': { fr: 'Élévation' },
      oneOf: [
        { const: 0, title: 'None', 'x-i18n-title': { fr: 'Aucune' } },
        { const: 1, title: 'Light', 'x-i18n-title': { fr: 'Légère' } },
        { const: 2, title: 'Moderate', 'x-i18n-title': { fr: 'Modérée' } },
        { const: 3, title: 'Strong', 'x-i18n-title': { fr: 'Forte' } }
      ]
    },

    density: {
      type: 'string',
      title: 'Density',
      'x-i18n-title': { fr: 'Densité' },
      oneOf: [
        { const: 'default', title: 'Normal', 'x-i18n-title': { fr: 'Normale' } },
        { const: 'comfortable', title: 'Comfortable', 'x-i18n-title': { fr: 'Confortable' } },
        { const: 'compact', title: 'Compact', 'x-i18n-title': { fr: 'Compacte' } }
      ]
    },

    variant: {
      type: 'string',
      title: 'Variant',
      'x-i18n-title': { fr: 'Variante' },
      default: 'default',
      oneOf: [
        { const: 'default', title: 'Default', 'x-i18n-title': { fr: 'Par défaut' } },
        { const: 'outlined', title: 'Outlined', 'x-i18n-title': { fr: 'Avec bordure' } },
        { const: 'tonal', title: 'Tonal', 'x-i18n-title': { fr: 'Tonale' } }
      ]
    },

    icon: {
      type: 'object',
      title: 'Icon configuration',
      'x-i18n-title': { fr: "Configuration de l'icône" },
      layout: 'card',
      properties: {
        mdi: {
          type: 'object',
          title: 'MDI Icon',
          'x-i18n-title': { fr: 'Icône MDI' },
          required: ['name', 'svg', 'svgPath'],
          layout: {
            getItems: {
              url: 'https://koumoul.com/data-fair/api/v1/datasets/icons-mdi-latest/lines?q={q}&select=name,svg,svgPath&size=20',
              itemKey: 'data.name',
              itemTitle: 'data.name',
              itemIcon: 'data.svg',
              itemsResults: 'data.results'
            },
            cols: { md: 6 }
          },
          properties: {
            name: { type: 'string' },
            svg: { type: 'string' },
            svgPath: { type: 'string' }
          }
        },
        custom: {
          type: 'string',
          title: 'Custom icon',
          'x-i18n-title': { fr: 'Icône personnalisée' },
          description: 'Only SVG Path are supported.',
          'x-i18n-description': { fr: 'Seul les SVG Path sont supportés.' },
          layout: { cols: { md: 6 } }
        },
        color: { $ref: '#/$defs/color' }
      }
    },

    // Title common configuration
    linePosition: {
      type: 'string',
      title: 'Display a line',
      'x-i18n-title': { fr: 'Afficher un trait' },
      oneOf: [
        { const: 'none', title: 'Aucun trait' },
        { const: 'left', title: 'Trait à gauche du titre' },
        { const: 'bottom-small', title: 'Petit trait sous le titre' },
        { const: 'bottom-medium', title: 'Trait sous le titre (largeur du texte)' },
        { const: 'bottom-large', title: 'Trait pleine largeur sous le titre' }
      ],
      default: 'none'
    },

    // Standard color definition (Titles, texts,...)
    color: {
      type: 'string',
      title: 'Color',
      'x-i18n-title': { fr: 'Couleur' },
      layout: {
        slots: {
          item: { name: 'color-select-item' },
          selection: { name: 'color-select-selection' }
        }
      },
      oneOf: [
        { const: 'primary', title: 'Primary', 'x-i18n-title': { fr: 'Primaire' } },
        { const: 'secondary', title: 'Secondary', 'x-i18n-title': { fr: 'Secondaire' } },
        { const: 'accent', title: 'Accent', 'x-i18n-title': { fr: 'Accentuée' } },
        { const: 'info', title: 'Info', 'x-i18n-title': { fr: 'Information' } },
        { const: 'success', title: 'Success', 'x-i18n-title': { fr: 'Succès' } },
        { const: 'error', title: 'Error', 'x-i18n-title': { fr: 'Erreur' } },
        { const: 'warning', title: 'Warning', 'x-i18n-title': { fr: 'Avertissement' } }
      ]
    },

    // Background color definition (Navbar, Footer,...)
    'color-background': {
      type: 'string',
      title: 'Color',
      'x-i18n-title': { fr: 'Couleur' },
      layout: {
        slots: {
          item: { name: 'color-select-item' },
          selection: { name: 'color-select-selection' }
        }
      },
      oneOf: [
        { const: 'primary', title: 'Primary', 'x-i18n-title': { fr: 'Primaire' } },
        { const: 'secondary', title: 'Secondary', 'x-i18n-title': { fr: 'Secondaire' } },
        { const: 'accent', title: 'Accent', 'x-i18n-title': { fr: 'Accentuée' } },
        { const: 'surface', title: 'Surface color', 'x-i18n-title': { fr: 'Couleur des surfaces' } },
        { const: 'surface-inverse', title: 'Inverse surface color', 'x-i18n-title': { fr: 'Couleur inversée des surfaces' } },
        { const: 'background', title: 'Background color', 'x-i18n-title': { fr: 'Couleur du fond de page' } }
      ]
    },

    // Full color definition (Cards, banners,...)
    'color-full': {
      type: 'string',
      title: 'Color',
      'x-i18n-title': { fr: 'Couleur' },
      layout: {
        slots: {
          item: { name: 'color-select-item' },
          selection: { name: 'color-select-selection' }
        }
      },
      oneOf: [
        { const: 'primary', title: 'Primary', 'x-i18n-title': { fr: 'Primaire' } },
        { const: 'secondary', title: 'Secondary', 'x-i18n-title': { fr: 'Secondaire' } },
        { const: 'accent', title: 'Accent', 'x-i18n-title': { fr: 'Accentuée' } },
        { const: 'info', title: 'Info', 'x-i18n-title': { fr: 'Information' } },
        { const: 'success', title: 'Success', 'x-i18n-title': { fr: 'Succès' } },
        { const: 'error', title: 'Error', 'x-i18n-title': { fr: 'Erreur' } },
        { const: 'warning', title: 'Warning', 'x-i18n-title': { fr: 'Avertissement' } },
        { const: 'surface', title: 'Surface color', 'x-i18n-title': { fr: 'Couleur des surfaces' } },
        { const: 'surface-inverse', title: 'Inverse surface color', 'x-i18n-title': { fr: 'Couleur inversée des surfaces' } },
        { const: 'background', title: 'Background color', 'x-i18n-title': { fr: 'Couleur du fond de page' } }
      ]
    },

    // Topics color definition
    'color-topics': {
      type: 'string',
      title: 'Color',
      'x-i18n-title': { fr: 'Couleur' },
      oneOf: [
        { const: 'default', title: 'Default topic color', 'x-i18n-title': { fr: 'Couleur de la thématique' } },
        { const: 'primary', title: 'Primary', 'x-i18n-title': { fr: 'Primaire' } },
        { const: 'secondary', title: 'Secondary', 'x-i18n-title': { fr: 'Secondaire' } },
        { const: 'accent', title: 'Accent', 'x-i18n-title': { fr: 'Accentuée' } }
      ]
    }
  }
}
