// hoverConfig and hoverConfigFull are identical except for their color palette
const makeHoverConfig = (colorRef: string) => ({
  type: 'object',
  title: 'Hover effects',
  'x-i18n-title': { fr: 'Effets au survol' },
  properties: {
    effects: { $ref: '#/$defs/hoverEffectsList' },
    color: {
      $ref: colorRef,
      title: 'Hover color',
      'x-i18n-title': { fr: 'Couleur de survol' },
      layout: {
        if: "parent.data?.effects?.some(e => ['background', 'border'].includes(e))",
        slots: {
          item: { name: 'color-select-item' },
          selection: { name: 'color-select-selection' }
        },
        cols: { md: 4 }
      }
    }
  }
})

// Topics are only clickable as a link to the catalog or as a toggle filter, and the second mode
// paints its own state, hence a distinct effects list per mode (see hoverConfigTopics).
const topicsEffectTitles: Record<string, string> = {
  darken: 'Darken',
  elevate: 'Elevate',
  grow: 'Grow',
  background: 'Background color',
  border: 'Color the border',
  invert: 'Fill inversion'
}
const topicsEffectTitlesFr: Record<string, string> = {
  darken: 'Assombrissement',
  elevate: 'Élévation',
  grow: 'Agrandissement',
  background: 'Couleur de fond',
  border: 'Colorer le bord',
  invert: 'Inversion du remplissage'
}
const topicsEffectItems = (...keys: string[]) => keys.map(key => ({ key, title: topicsEffectTitles[key], 'x-i18n-title': { fr: topicsEffectTitlesFr[key] } }))
// Same condition as the `variant` property of the topics element: redirection needs a single source.
const topicsLinkMode = 'parent.parent?.data?.redirectPage && (!Array.isArray(parent.parent?.data?.mode) || parent.parent?.data?.mode.length <= 1)'

// a style select left empty takes the portal's « Style visuel par défaut »
export const inheritedStyleLayout = { placeholder: 'Portal default style', 'x-i18n-placeholder': { fr: 'Style par défaut du portail' }, props: { persistentPlaceholder: true } }

export default {
  $id: 'https://github.com/data-fair/portals/common-defs',
  'x-exports': ['types'],
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
        { const: 'default', title: 'Small', 'x-i18n-title': { fr: 'Petit' } },
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
        { const: 'default', title: 'Spacious', 'x-i18n-title': { fr: 'Aérée' } },
        { const: 'comfortable', title: 'Normal', 'x-i18n-title': { fr: 'Normale' } },
        { const: 'compact', title: 'Compact', 'x-i18n-title': { fr: 'Compacte' } }
      ]
    },

    variant: {
      type: 'string',
      title: 'Variant',
      'x-i18n-title': { fr: 'Variante' },
      description: 'The "Tonal" variant is not recommended for accessibility: the contrast between the text and its tinted background may be too low.',
      'x-i18n-description': { fr: "La variante « Avec fond teinté » est déconseillée pour l'accessibilité : le contraste entre le texte et son fond teinté peut être insuffisant." },
      oneOf: [
        { const: 'default', title: 'Filled', 'x-i18n-title': { fr: 'Avec fond coloré' } },
        { const: 'outlined', title: 'Outlined', 'x-i18n-title': { fr: 'Avec bordure' } },
        { const: 'tonal', title: 'Tonal', 'x-i18n-title': { fr: 'Avec fond teinté' } }
      ]
    },

    ownerDisplay: {
      type: 'string',
      title: 'Owner display',
      'x-i18n-title': { fr: 'Affichage du propriétaire' },
      default: 'avatar',
      oneOf: [
        { const: 'none', title: 'None', 'x-i18n-title': { fr: 'Aucun' } },
        { const: 'avatar', title: 'Avatar only (name on hover)', 'x-i18n-title': { fr: 'Avatar seul (nom au survol)' } },
        { const: 'avatarName', title: 'Avatar and name', 'x-i18n-title': { fr: 'Avatar et nom' } }
      ]
    },

    // Shared effects list for the hover configs (see hoverConfig / hoverConfigFull).
    hoverEffectsList: {
      type: 'array',
      title: 'Effects',
      'x-i18n-title': { fr: 'Effets' },
      description: 'Title and image effects only apply to boxes and thumbnails. "Title underline" and "Animated title underline" are mutually exclusive (animated takes precedence if both are selected). The standard darken effect is applied by default.',
      'x-i18n-description': { fr: "Les effets sur le titre et l'image ne s'appliquent qu'aux boîtes et vignettes. « Soulignement du titre » et « Soulignement animé du titre » sont exclusifs (l'animé prime si les deux sont cochés). Par défaut, l'effet d'assombrissement standard est appliqué." },
      layout: {
        switch: [
          { if: "parent.data?.effects?.some(e => ['background', 'border'].includes(e))", cols: { md: 8 } }
        ]
      },
      items: {
        type: 'string',
        oneOf: [
          { const: 'darken', title: 'Darken', 'x-i18n-title': { fr: 'Assombrissement' } },
          { const: 'elevate', title: 'Elevate', 'x-i18n-title': { fr: 'Élévation' } },
          { const: 'background', title: 'Background color', 'x-i18n-title': { fr: 'Couleur de fond' } },
          { const: 'border', title: 'Border color', 'x-i18n-title': { fr: 'Couleur de bordure' } },
          { const: 'grow', title: 'Grow', 'x-i18n-title': { fr: 'Agrandissement' } },
          { const: 'titleUnderline', title: 'Title underline', 'x-i18n-title': { fr: 'Soulignement du titre' } },
          { const: 'titleUnderlineAnimated', title: 'Animated title underline', 'x-i18n-title': { fr: 'Soulignement animé du titre' } },
          { const: 'imageZoom', title: 'Image zoom', 'x-i18n-title': { fr: "Zoom sur l'image" } }
        ]
      }
    },

    // Hover config with the standard color palette (thumbnails, portal default).
    hoverConfig: makeHoverConfig('#/$defs/color'),

    // Hover config with the extended color palette, matching the box background colors.
    hoverConfigFull: makeHoverConfig('#/$defs/color-full'),

    // Topics hover config: applies to clickable topics only; the offered effects depend on the
    // mode, filter chips already encoding their selection through their fill.
    hoverConfigTopics: {
      type: 'object',
      title: 'Hover effects',
      'x-i18n-title': { fr: 'Effets au survol' },
      properties: {
        effects: {
          type: 'array',
          title: 'Topics effects',
          'x-i18n-title': { fr: 'Effets', en: 'Effects' },
          description: 'Applied when topics are clickable (redirection or filter). Only the checked effects are applied; with no selection, the portal effects are inherited. In filter mode, "Fill inversion" fills an inactive topic on hover and empties an active one.',
          'x-i18n-description': { fr: 'Appliqués quand les thématiques sont cliquables (redirection ou filtre). Seuls les effets cochés sont appliqués ; sans sélection, ce sont les effets du portail qui sont hérités. En mode filtre, « Inversion du remplissage » remplit au survol une thématique inactive et vide une thématique active.' },
          layout: {
            // json-layout only derives the options from the oneOf when the layout provides none,
            // so each case offers the effects that actually do something in that mode.
            switch: [
              { if: topicsLinkMode, items: topicsEffectItems('darken', 'elevate', 'grow', 'background', 'border') },
              { items: topicsEffectItems('darken', 'elevate', 'grow', 'border', 'invert') }
            ]
          },
          items: {
            type: 'string',
            // every value stays valid in both modes so switching mode never invalidates a config
            oneOf: Object.entries(topicsEffectTitles).map(([value, title]) => ({ const: value, title, 'x-i18n-title': { fr: topicsEffectTitlesFr[value] } }))
          }
        },
        color: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics',
          title: 'Hover color',
          'x-i18n-title': { fr: 'Couleur de survol' },
          layout: {
            // "border" colors the outline in both modes, "background" only fills in link mode
            if: `parent.data?.effects?.includes('border') || ((${topicsLinkMode}) && parent.data?.effects?.includes('background'))`,
            slots: {
              item: { name: 'color-select-item' },
              selection: { name: 'color-select-selection' }
            }
          }
        }
      }
    },

    icon: {
      type: 'object',
      title: 'Icon configuration',
      'x-i18n-title': { fr: 'Icône', en: 'Icon' },
      layout: 'card',
      properties: {
        mdi: {
          type: 'object',
          title: 'Icon',
          'x-i18n-title': { fr: 'Icône' },
          required: ['name', 'svg', 'svgPath'],
          layout: {
            getItems: {
              url: 'https://koumoul.com/data-fair/api/v1/datasets/icons-mdi-latest/lines?q={q}&select=name,svg,svgPath&size=50',
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
          'x-i18n-description': { fr: 'Seuls les SVG Path carrés sont supportés.' },
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
        { const: 'none', title: 'No line', 'x-i18n-title': { fr: 'Aucun trait' } },
        { const: 'left', title: 'Line to the left of the title', 'x-i18n-title': { fr: 'Trait à gauche du titre' } },
        { const: 'bottom-small', title: 'Small line under the title', 'x-i18n-title': { fr: 'Petit trait sous le titre' } },
        { const: 'bottom-medium', title: 'Line under the title (text width)', 'x-i18n-title': { fr: 'Trait sous le titre (largeur du texte)' } },
        { const: 'underline', title: 'Underlined text (under each line)', 'x-i18n-title': { fr: 'Texte souligné (sous chaque ligne)' } },
        { const: 'bottom-large', title: 'Full-width line under the title', 'x-i18n-title': { fr: 'Trait pleine largeur sous le titre' } }
      ],
      default: 'none'
    },

    // Horizontal alignment (left / center / right)
    'horizontal-alignment': {
      type: 'string',
      title: 'Alignment',
      'x-i18n-title': { fr: 'Alignement' },
      default: 'center',
      oneOf: [
        { const: 'left', title: 'Left', 'x-i18n-title': { fr: 'Gauche' } },
        { const: 'center', title: 'Center', 'x-i18n-title': { fr: 'Centré' } },
        { const: 'right', title: 'Right', 'x-i18n-title': { fr: 'Droite' } }
      ]
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

    // Main colors definition (global settings: links,...)
    'color-main': {
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
        { const: 'accent', title: 'Accent', 'x-i18n-title': { fr: 'Accentuée' } }
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
    },

    buttonConfig: {
      type: 'object',
      properties: {
        color: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color',
          layout: {
            switch: [
              {
                if: '!parent.data?.variant || parent.data.variant === "default"',
                props: { background: true },
                slots: {
                  item: { name: 'color-select-item' },
                  selection: { name: 'color-select-selection' }
                },
                cols: { md: 4 }
              },
              {
                slots: {
                  item: { name: 'color-select-item' },
                  selection: { name: 'color-select-selection' }
                },
                cols: { md: 4 }
              }
            ]
          },

        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          layout: { cols: { md: 4 }, ...inheritedStyleLayout }
        },
        density: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density',
          layout: { cols: { md: 4 }, ...inheritedStyleLayout }
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
          layout: { cols: { md: 4 }, ...inheritedStyleLayout }
        },
        variant: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/variant',
          layout: { cols: { md: 4 } }
        },
        hoverEffects: {
          type: 'array',
          title: 'Hover effects',
          'x-i18n-title': { fr: 'Effets au survol' },
          description: 'The "Color" effect tints the button on hover: border color for the "Outlined" variant, background color for the "Tonal" and "Filled" variants. The standard darken effect is applied by default.',
          'x-i18n-description': { fr: "L'effet « Coloration » teinte le bouton au survol : couleur de bordure pour la variante « Avec bordure », couleur de fond pour les variantes « Avec fond teinté » et « Avec fond coloré ». Par défaut, l'effet d'assombrissement standard est appliqué." },
          layout: {
            switch: [
              { if: "parent.data?.hoverEffects?.includes('color')", cols: { md: 8 } }
            ]
          },
          items: {
            type: 'string',
            oneOf: [
              { const: 'darken', title: 'Darken', 'x-i18n-title': { fr: 'Assombrissement' } },
              { const: 'elevate', title: 'Elevate', 'x-i18n-title': { fr: 'Élévation' } },
              { const: 'color', title: 'Color', 'x-i18n-title': { fr: 'Coloration (selon la variante)' } },
              { const: 'grow', title: 'Grow', 'x-i18n-title': { fr: 'Agrandissement' } }
            ]
          }
        },
        hoverColor: {
          $ref: '#/$defs/color',
          title: 'Hover color',
          'x-i18n-title': { fr: 'Couleur au survol' },
          layout: {
            if: "parent.data?.hoverEffects?.includes('color')",
            slots: {
              item: { name: 'color-select-item' },
              selection: { name: 'color-select-selection' }
            },
            cols: { md: 4 }
          }
        },
        showIcon: {
          type: 'boolean',
          title: 'Show icon',
          'x-i18n-title': { fr: "Afficher l'icône" },
          layout: {
            comp: 'switch',
            cols: { md: 4 }
          },
          default: true
        },
        uppercase: {
          type: 'boolean',
          title: 'Uppercase text',
          'x-i18n-title': { fr: 'Texte en majuscules' },
          layout: {
            comp: 'switch',
            cols: { md: 4 }
          },
          default: true
        }
      }
    },

    // Topics rendering configuration (shared by detail pages)
    topicsConfig: {
      type: 'object',
      title: 'Topics configuration',
      'x-i18n-title': {
        en: 'Topics',
        fr: 'Thématiques'
      },
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
          title: 'Show topics',
          'x-i18n-title': { fr: 'Afficher les thématiques' },
          layout: 'switch',
          default: true
        },
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics' },
        elevation: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation', layout: { ...inheritedStyleLayout } },
        density: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density', layout: { ...inheritedStyleLayout } },
        rounded: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded', layout: { ...inheritedStyleLayout } },
        variant: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/variant' },
        showIcon: {
          type: 'boolean',
          title: 'Show icon',
          'x-i18n-title': { fr: "Afficher l'icône" },
          layout: { comp: 'switch' },
          default: true
        },
        iconColor: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics',
          title: 'Icon color',
          'x-i18n-title': { fr: "Couleur de l'icône" },
          layout: {
            if: 'parent.data?.showIcon === true'
          }
        }
      }
    },

    // Keywords rendering configuration (shared by detail pages)
    keywordsConfig: {
      type: 'object',
      title: 'Keywords configuration',
      'x-i18n-title': {
        en: 'Keywords',
        fr: 'Mots-clés'
      },
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
              { key: 'variant', cols: { md: 4 } }
            ]
          }
        ]
      },
      properties: {
        show: {
          type: 'boolean',
          title: 'Show keywords',
          'x-i18n-title': { fr: 'Afficher les mots-clés' },
          layout: 'switch',
          default: true
        },
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color' },
        elevation: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation' },
        density: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density' },
        rounded: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded' },
        variant: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/variant' }
      }
    },
    staticFilterValues: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' }
        }
      }
    }
  }
}
