import { linkItemTitle } from '../common-links/schema.js'

export default {
  $id: 'https://github.com/data-fair/portals/page-element-layout',
  'x-exports': [],
  $defs: {
    'element-divider': {
      type: 'object',
      title: 'DividerElement',
      'x-i18n-title': {
        en: 'Divider',
        fr: 'Séparateur horizontal'
      },
      required: ['type', 'opacity', 'thickness'],
      properties: {
        type: { const: 'divider' },
        uuid: { type: 'string', layout: 'none' },
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-full' },
        content: {
          title: 'Contenu',
          type: 'string',
          description: 'Texte affiché au centre du séparateur'
        },
        inset: {
          type: 'boolean',
          title: 'Ajouter une indentation'
        },
        rounded: {
          type: 'boolean',
          title: 'Bords arrondis',
          default: true
        },
        opacity: {
          type: 'number',
          title: 'Opacité',
          layout: {
            comp: 'slider',
            props: {
              step: 0.1,
              thumbLabel: true,
              showTicks: 'always'
            }
          },
          default: 0.10,
          minimum: 0.10,
          maximum: 1
        },
        thickness: {
          type: 'integer',
          title: 'Épaisseur',
          layout: {
            comp: 'slider',
            props: {
              step: 1,
              thumbLabel: true,
              showTicks: 'always'
            }
          },
          default: 1,
          minimum: 1,
          maximum: 10
        }
      }
    },
    'element-banner': {
      type: 'object',
      title: 'BannerElement',
      'x-i18n-title': {
        en: 'Colored background section',
        fr: 'Section sur fond coloré'
      },
      required: ['type', 'children'],
      layout: [
        'type',
        'children',
        'fullWidth',
        'background',
        'pt',
        'pb',
        'pl',
        'pr',
        'overflowTop',
        'overflowBottom',
        { if: '!parent.data?.overflowBottom', children: ['mb'] }
      ],
      properties: {
        type: { const: 'banner' },
        uuid: { type: 'string', layout: 'none' },
        children: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: 'https://github.com/data-fair/portals/page-elements#/$defs/element'
          }
        },
        fullWidth: {
          type: 'boolean',
          title: 'Pleine largeur',
          description: "La section s'étendra sur toute la largeur de l'écran, en ignorant les marges latérales de la page. Seul le fond est impacté, le contenu restera contraint. Cette option n'a aucun effet si le bloc n'est pas à la racine de la page.",
          layout: 'switch'
        },
        background: {
          title: 'Configuration du fond',
          layout: 'card',
          properties: {
            color: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-full',
              layout: {
                props: { background: true },
                slots: {
                  item: { name: 'color-select-item' },
                  selection: { name: 'color-select-selection' }
                }
              }
            },
            image: {
              type: 'object',
              required: ['_id', 'name', 'mimeType'],
              layout: {
                slots: {
                  component: {
                    name: 'image-upload',
                    props: { width: 2560, label: 'Chargez une image' }
                  }
                }
              },
              properties: {
                _id: {
                  type: 'string'
                },
                name: {
                  type: 'string'
                },
                mimeType: {
                  type: 'string'
                },
                mobileAlt: {
                  type: 'boolean'
                }
              }
            },
            tintStrength: {
              type: 'number',
              title: 'Intensité de la teinte',
              description: "Contrôle l'intensité de la teinte sur l'image de fond. Cette option n'a aucun effet si l'image ou la couleur n'est pas définie.",
              layout: {
                if: 'parent.data?.color && parent.data?.image',
                comp: 'slider',
                props: {
                  step: 0.1,
                  thumbLabel: true,
                  showTicks: 'always'
                }
              },
              minimum: 0,
              maximum: 1,
              default: 0.8
            }
          }
        },
        pt: {
          type: 'integer',
          title: 'Marge supérieur',
          layout: { cols: { xs: 6 } },
          minimum: 4,
          maximum: 16
        },
        pb: {
          type: 'integer',
          title: 'Marge inférieur',
          layout: { cols: { xs: 6 } },
          minimum: 4,
          maximum: 16
        },
        pl: {
          type: 'integer',
          title: 'Marge gauche',
          layout: { cols: { xs: 6 } },
          minimum: 4,
          maximum: 16
        },
        pr: {
          type: 'integer',
          title: 'Marge droite',
          layout: { cols: { xs: 6 } },
          minimum: 4,
          maximum: 16
        },
        overflowTop: {
          type: 'boolean',
          title: 'Débordement supérieur',
          description: "Permet au fond de la section de déborder sur l'élément précédent.",
          layout: {
            comp: 'switch',
            cols: { xs: 6 }
          }
        },
        overflowBottom: {
          type: 'boolean',
          title: 'Débordement inférieur',
          description: "Permet au fond de la section de déborder sur l'élément suivant.",
          layout: {
            comp: 'switch',
            cols: { xs: 6 }
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-card': {
      type: 'object',
      title: 'CardElement',
      'x-i18n-title': {
        en: 'Card',
        fr: 'Boite'
      },
      required: ['type', 'children', 'actions'],
      properties: {
        type: { const: 'card' },
        uuid: { type: 'string', layout: 'none' },
        children: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: 'https://github.com/data-fair/portals/page-elements#/$defs/element'
          }
        },
        title: {
          title: 'Titre',
          type: 'string',
        },
        contentAlign: {
          type: 'string',
          title: 'Alignement vertical des blocs dans la boite',
          description: "Utile quand la boite est placée dans un bloc colonnes ou une grille avec l'option \"Étendre les blocs\" activée, cette option permet de choisir où se positionnent les blocs ajoutés à la boite dans l'espace disponible.",
          oneOf: [
            { const: 'start', title: 'En haut' },
            { const: 'center', title: 'Au centre' },
            { const: 'end', title: 'En bas' }
          ]
        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation'
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded'
        },
        border: {
          title: 'Bordure',
          type: 'boolean',
          default: true
        },
        thumbnail: {
          type: 'object',
          title: "Configuration de l'image",
          layout: { comp: 'card' },
          properties: {
            image: {
              type: 'object',
              title: 'Image',
              required: ['_id', 'name', 'mimeType'],
              layout: {
                slots: {
                  component: {
                    name: 'image-upload',
                    props: { width: 1280, label: 'Image' }
                  }
                }
              },
              properties: {
                _id: {
                  type: 'string'
                },
                name: {
                  type: 'string'
                },
                mimeType: {
                  type: 'string'
                },
                mobileAlt: {
                  type: 'boolean'
                }
              }
            },
            location: {
              type: 'string',
              title: "Position de l'image sur la carte",
              default: 'center',
              oneOf: [
                { const: 'top', title: 'En haut' },
                { const: 'center', title: 'Sous le titre' }
              ]
            },
            crop: {
              type: 'boolean',
              title: "Recadrer l'image pour un rendu uniforme",
              description: "Si désactivé, l'image gardera son ratio d'origine",
              layout: 'switch',
              default: true
            }
          }
        },
        link: {
          $ref: 'https://github.com/data-fair/portals/common-links#/$defs/simpleLinkItem',
          title: 'Lien au clic sur la boite',
          layout: { comp: 'card' }
        },
        actions: {
          title: 'Boutons de navigation',
          type: 'array',
          layout: {
            itemTitle: linkItemTitle,
            messages: { addItem: 'Ajouter un bouton de navigation' }
          },
          items: { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/linkItem' }
        },
        actionStyle: {
          title: 'Style des boutons de navigation',
          layout: {
            comp: 'card',
            children: [
              'usePortalConfig',
              {
                if: '!parent.data?.usePortalConfig',
                children: ['config']
              }
            ]
          },
          properties: {
            usePortalConfig: {
              type: 'boolean',
              title: 'Utiliser la configuration du portail',
              layout: 'switch',
              default: true
            },
            config: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/buttonConfig' }
          }
        },
        background: {
          title: 'Configuration du fond',
          layout: 'card',
          properties: {
            color: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-full',
              layout: {
                slots: {
                  item: { name: 'color-select-item' },
                  selection: { name: 'color-select-selection' }
                },
                props: { background: true }
              }
            },
            image: {
              type: 'object',
              required: ['_id', 'name', 'mimeType'],
              layout: {
                slots: {
                  component: {
                    name: 'image-upload',
                    props: { width: 2400, label: 'Chargez une image' }
                  }
                }
              },
              properties: {
                _id: {
                  type: 'string'
                },
                name: {
                  type: 'string'
                },
                mimeType: {
                  type: 'string'
                },
                mobileAlt: {
                  type: 'boolean'
                }
              }
            },
            tintStrength: {
              type: 'number',
              title: 'Intensité de la teinte',
              description: "Contrôle l'intensité de la teinte sur l'image de fond. Cette option n'a aucun effet si l'image ou la couleur n'est pas définie.",
              layout: {
                if: 'parent.data?.color && parent.data?.image',
                comp: 'slider',
                props: {
                  step: 0.1,
                  thumbLabel: true,
                  showTicks: 'always'
                }
              },
              minimum: 0,
              maximum: 1,
              default: 0.8
            },
            tonal: {
              type: 'boolean',
              title: 'Utiliser une variante tonale de la couleur de fond',
              layout: { if: 'parent.data?.color && !parent.data?.image' }
            }
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-two-columns': {
      type: 'object',
      title: 'TwoColumnsElement',
      'x-i18n-title': {
        en: 'Two columns',
        fr: 'Deux colonnes'
      },
      required: ['type', 'disposition', 'gutter', 'children', 'children2'],
      properties: {
        type: { const: 'two-columns' },
        uuid: { type: 'string', layout: 'none' },
        disposition: {
          type: 'string',
          title: 'Disposition',
          default: 'equal',
          oneOf: [
            {
              const: 'equal',
              title: 'Largeur de même taille'
            },
            {
              const: 'left',
              title: 'Colonne gauche large'
            },
            {
              const: 'right',
              title: 'Colonne droite large'
            }
          ]
        },
        align: {
          type: 'object',
          title: 'Alignement des éléments',
          properties: {
            left: {
              type: 'string',
              title: 'Colonne 1',
              layout: { cols: { xs: 6 } },
              oneOf: [
                { const: 'start', title: 'Aligné en haut' },
                { const: 'center', title: 'Aligné au centre' },
                { const: 'end', title: 'Aligné en bas' },
                { const: 'stretch', title: 'Étendre les éléments' }
              ]
            },
            right: {
              type: 'string',
              title: 'Colonne 2',
              layout: { cols: { xs: 6 } },
              oneOf: [
                { const: 'start', title: 'Aligné en haut' },
                { const: 'center', title: 'Aligné au centre' },
                { const: 'end', title: 'Aligné en bas' },
                { const: 'stretch', title: 'Étendre les éléments' }
              ]
            }
          }
        },
        gutter: {
          type: 'string',
          title: 'Espacement entre les colonnes',
          default: 'default',
          oneOf: [
            { const: 'none', title: 'Aucun espacement' },
            { const: 'dense', title: 'Petit espacement' },
            { const: 'default', title: 'Espacement normal' }
          ]
        },
        children: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: 'https://github.com/data-fair/portals/page-elements#/$defs/element'
          }
        },
        children2: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: 'https://github.com/data-fair/portals/page-elements#/$defs/element'
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-responsive-grid': {
      type: 'object',
      title: 'ResponsiveGridElement',
      'x-i18n-title': {
        en: 'Responsive Grid',
        fr: 'Grille responsive'
      },
      required: ['type', 'children'],
      properties: {
        type: { const: 'responsive-grid' },
        uuid: { type: 'string', layout: 'none' },
        columns: {
          type: 'integer',
          title: 'Nombre de colonnes',
          description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.\n\n| **Colonnes** | 2 | 3 | 4 | 6 |  \n| :-- | --: | --: | --: | --: |  \n| **Ordinateur de bureau** | 6 | 4 | 3 | 2 |  \n| **Ordinateur portable** | 6 | 6 | 3 | 3 |  \n| **Tablette** | 12 | 6 | 4 | 4 |  \n| **Mobile** | 12 | 12 | 12 | 6 |',
          oneOf: [
            { const: 2, title: '2' },
            { const: 3, title: '3' },
            { const: 4, title: '4' },
            { const: 6, title: '6' }
          ],
          default: 2
        },
        gutter: {
          type: 'string',
          title: 'Espacement entre les blocs',
          default: 'default',
          oneOf: [
            { const: 'none', title: 'Aucun espacement' },
            { const: 'dense', title: 'Petit espacement' },
            { const: 'default', title: 'Espacement normal' }
          ]
        },
        align: {
          type: 'string',
          title: 'Alignement vertical des blocs',
          oneOf: [
            { const: 'start', title: 'Aligné en haut' },
            { const: 'center', title: 'Aligné au centre' },
            { const: 'end', title: 'Aligné en bas' },
            { const: 'stretch', title: 'Étendre les blocs' }
          ]
        },
        centered: {
          type: 'boolean',
          title: 'Centrer les blocs sur les lignes incomplètes',
        },
        children: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: 'https://github.com/data-fair/portals/page-elements#/$defs/element'
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-tabs': {
      title: 'TabsElement',
      'x-i18n-title': {
        en: 'Tabs',
        fr: 'Onglets'
      },
      type: 'object',
      required: ['type', 'align', 'tabs'],
      properties: {
        type: { const: 'tabs' },
        uuid: { type: 'string', layout: 'none' },
        grow: {
          type: 'boolean',
          title: 'Étendre'
        },
        align: {
          layout: {
            if: '!parent.data.grow'
          },
          type: 'string',
          title: 'Alignement',
          default: 'start',
          oneOf: [
            { const: 'start', title: 'Début' },
            { const: 'center', title: 'Centre' },
            { const: 'end', title: 'Fin' }
          ]
        },
        border: {
          title: 'Bordure',
          type: 'boolean',
          default: true
        },
        tabs: {
          type: 'array',
          title: 'Onglets',
          layout: {
            messages: {
              addItem: 'Ajouter un onglet',
            },
            listEditMode: 'inline'
          },
          items: {
            type: 'object',
            required: [],
            properties: {
              title: {
                title: 'Titre onglet',
                type: 'string'
              },
              icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
              children: {
                type: 'array',
                layout: 'none',
                items: {
                  $ref: 'https://github.com/data-fair/portals/page-elements#/$defs/element'
                }
              }
            }
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-expansion-panels': {
      title: 'ExpansionPanelsElement',
      'x-i18n-title': {
        en: 'Expansion panels',
        fr: 'Accordéons'
      },
      type: 'object',
      required: ['type', 'panels'],
      properties: {
        type: { const: 'expansion-panels' },
        uuid: { type: 'string', layout: 'none' },
        // variant: {
        //   type: 'string',
        //   title: 'Variant',
        //   'x-i18n-title': { fr: 'Variante' },
        //   default: 'default',
        //   oneOf: [
        //     { const: 'default', title: 'Default', 'x-i18n-title': { fr: 'Par défaut' } },
        //     { const: 'accordion', title: 'Accordion', 'x-i18n-title': { fr: 'En accordéon' } }
        //   ]
        // },
        // notStatic: {
        //   title: 'Agrandissement des titres',
        //   description: 'Si activé, les titres des panneaux actifs s'agrandissent.'
        //   type: 'boolean',
        //   default: false
        // },

        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation'
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded'
        },
        multiple: {
          type: 'boolean',
          title: "Permettre l'ouverture multiple",
          description: "Permet à l'utilisateur d'avoir plusieurs panneaux ouverts en même temps."
        },
        openFirst: {
          type: 'boolean',
          title: 'Ouvrir le premier panneau par défaut',
          layout: {
            switch: [
              {
                if: 'parent.data?.openAll',
                props: { disabled: true }
              }
            ]
          }
        },
        openAll: {
          type: 'boolean',
          title: 'Ouvrir tous les panneaux par défaut',
          layout: { if: 'parent.data?.multiple' }
        },
        titleBackgroundColor: {
          title: 'Couleur de fond des titres',
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-full',
          layout: {
            slots: {
              item: { name: 'color-select-item' },
              selection: { name: 'color-select-selection' }
            },
            props: { background: true }
          }
        },
        textBackgroundColor: {
          title: 'Couleur de fond du contenu',
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-full',
          layout: {
            slots: {
              item: { name: 'color-select-item' },
              selection: { name: 'color-select-selection' }
            },
            props: { background: true }
          }
        },

        panels: {
          type: 'array',
          title: 'Panneaux',
          layout: {
            messages: {
              addItem: 'Ajouter un panneau',
            },
            listEditMode: 'inline'
          },
          items: {
            type: 'object',
            required: [],
            properties: {
              title: {
                title: 'Titre du panneau',
                type: 'string'
              },
              icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
              children: {
                type: 'array',
                layout: 'none',
                items: {
                  $ref: 'https://github.com/data-fair/portals/page-elements#/$defs/element'
                }
              }
            }
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
  }
}
