import { linkItemTitle, linkItemTitleFr } from '../common-links/schema.js'
import { inheritedStyleLayout } from '../common-defs/schema.ts'

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
          title: 'Content',
          'x-i18n-title': { fr: 'Contenu' },
          type: 'string',
          description: 'Text displayed in the center of the divider',
          'x-i18n-description': { fr: 'Texte affiché au centre du séparateur' }
        },
        inset: {
          type: 'boolean',
          title: 'Add an indentation',
          'x-i18n-title': { fr: 'Ajouter une indentation' }
        },
        rounded: {
          type: 'boolean',
          title: 'Rounded edges',
          'x-i18n-title': { fr: 'Bords arrondis' },
          default: true
        },
        opacity: {
          type: 'number',
          title: 'Opacity',
          'x-i18n-title': { fr: 'Opacité' },
          layout: {
            comp: 'slider',
            props: {
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
          title: 'Thickness',
          'x-i18n-title': { fr: 'Épaisseur' },
          layout: {
            comp: 'slider',
            props: {
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
          title: 'Full width',
          'x-i18n-title': { fr: 'Pleine largeur' },
          description: "The section extends across the full width of the screen, ignoring the page's side margins. Only the background is affected, the content stays constrained. This option has no effect if the block is not at the root of the page.",
          'x-i18n-description': { fr: "La section s'étendra sur toute la largeur de l'écran, en ignorant les marges latérales de la page. Seul le fond est impacté, le contenu restera contraint. Cette option n'a aucun effet si le bloc n'est pas à la racine de la page." },
          layout: 'switch'
        },
        background: {
          title: 'Banner background',
          'x-i18n-title': { fr: 'Fond', en: 'Background' },
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
                    props: { width: 2560, label: 'Upload an image', 'x-i18n-label': { fr: 'Chargez une image' } }
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
              title: 'Tint strength',
              'x-i18n-title': { fr: 'Intensité de la teinte' },
              description: 'Controls the strength of the tint on the background image. This option has no effect if the image or the color is not set.',
              'x-i18n-description': { fr: "Contrôle l'intensité de la teinte sur l'image de fond. Cette option n'a aucun effet si l'image ou la couleur n'est pas définie." },
              layout: {
                if: 'parent.data?.color && parent.data?.image',
                comp: 'slider',
                props: {
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
          title: 'Top margin',
          'x-i18n-title': { fr: 'Marge supérieure' },
          layout: { cols: { xs: 6 } },
          minimum: 4,
          maximum: 16
        },
        pb: {
          type: 'integer',
          title: 'Bottom margin',
          'x-i18n-title': { fr: 'Marge inférieure' },
          layout: { cols: { xs: 6 } },
          minimum: 4,
          maximum: 16
        },
        pl: {
          type: 'integer',
          title: 'Left margin',
          'x-i18n-title': { fr: 'Marge gauche' },
          layout: { cols: { xs: 6 } },
          minimum: 4,
          maximum: 16
        },
        pr: {
          type: 'integer',
          title: 'Right margin',
          'x-i18n-title': { fr: 'Marge droite' },
          layout: { cols: { xs: 6 } },
          minimum: 4,
          maximum: 16
        },
        overflowTop: {
          type: 'boolean',
          title: 'Top overflow',
          'x-i18n-title': { fr: 'Débordement supérieur' },
          description: "Lets the section's background overflow onto the previous element.",
          'x-i18n-description': { fr: "Permet au fond de la section de déborder sur l'élément précédent." },
          layout: {
            comp: 'switch',
            cols: { xs: 6 }
          }
        },
        overflowBottom: {
          type: 'boolean',
          title: 'Bottom overflow',
          'x-i18n-title': { fr: 'Débordement inférieur' },
          description: "Lets the section's background overflow onto the next element.",
          'x-i18n-description': { fr: "Permet au fond de la section de déborder sur l'élément suivant." },
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
        en: 'Box',
        fr: 'Boîte'
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
          title: 'Title',
          'x-i18n-title': { fr: 'Titre' },
          type: 'string',
        },
        contentAlign: {
          type: 'string',
          title: 'Vertical alignment of blocks in the box',
          'x-i18n-title': { fr: 'Alignement vertical des blocs dans la boîte' },
          description: 'Useful when the box is placed in a columns block or a grid with the "Stretch blocks" option enabled: this option sets where the blocks added to the box are positioned in the available space.',
          'x-i18n-description': { fr: "Utile quand la boîte est placée dans un bloc colonnes ou une grille avec l'option \"Étendre les blocs\" activée, cette option permet de choisir où se positionnent les blocs ajoutés à la boîte dans l'espace disponible." },
          oneOf: [
            { const: 'start', title: 'Top', 'x-i18n-title': { fr: 'En haut' } },
            { const: 'center', title: 'Center', 'x-i18n-title': { fr: 'Au centre' } },
            { const: 'end', title: 'Bottom', 'x-i18n-title': { fr: 'En bas' } }
          ]
        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          layout: { ...inheritedStyleLayout }
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
          layout: { ...inheritedStyleLayout }
        },
        border: {
          title: 'Show a border',
          'x-i18n-title': { fr: 'Afficher une bordure' },
          type: 'boolean',
          default: true
        },
        keepTextSize: {
          title: 'Keep the portal text size',
          'x-i18n-title': { fr: 'Conserver la taille de texte du portail' },
          description: "By default, the text of boxes is displayed smaller than the portal's (14px instead of 16px, Material Design rule). Enable this option to keep the portal's normal size.",
          'x-i18n-description': { fr: 'Par défaut, le texte des boîtes est affiché plus petit que celui du portail (14px au lieu de 16px, règle Material Design). Activez cette option pour garder la taille normale du portail.' },
          type: 'boolean'
        },
        hover: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/hoverConfigFull',
          title: 'Hover effects',
          'x-i18n-title': { fr: 'Effets au survol' },
          layout: { comp: 'card' }
        },
        thumbnail: {
          type: 'object',
          title: 'Box image',
          'x-i18n-title': { fr: 'Image', en: 'Image' },
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
              title: 'Image position in the box',
              'x-i18n-title': { fr: "Position de l'image sur la carte" },
              default: 'center',
              oneOf: [
                { const: 'left', title: 'Left', 'x-i18n-title': { fr: 'À gauche' } },
                { const: 'top', title: 'Top', 'x-i18n-title': { fr: 'En haut' } },
                { const: 'center', title: 'Below the title', 'x-i18n-title': { fr: 'Sous le titre' } }
              ]
            },
            crop: {
              type: 'boolean',
              title: 'Crop the image for a uniform look',
              'x-i18n-title': { fr: "Recadrer l'image pour un rendu uniforme" },
              description: 'If disabled, the image keeps its original ratio',
              'x-i18n-description': { fr: "Si désactivé, l'image gardera son ratio d'origine" },
              layout: 'switch',
              default: true
            }
          }
        },
        link: {
          $ref: 'https://github.com/data-fair/portals/common-links#/$defs/simpleLinkItem',
          title: 'Link on box click',
          'x-i18n-title': { fr: 'Lien au clic sur la boîte' },
          layout: { comp: 'card' }
        },
        actions: {
          title: 'Navigation buttons',
          'x-i18n-title': { fr: 'Boutons de navigation' },
          type: 'array',
          layout: {
            itemTitle: linkItemTitle,
            'x-i18n-itemTitle': { fr: linkItemTitleFr },
            messages: { addItem: 'Add a navigation button', 'x-i18n-addItem': { fr: 'Ajouter un bouton de navigation' } }
          },
          items: { $ref: 'https://github.com/data-fair/portals/common-links#/$defs/linkItem' }
        },
        actionStyle: {
          title: 'Navigation buttons style',
          'x-i18n-title': { fr: 'Style des boutons de navigation' },
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
              title: 'Use the portal configuration',
              'x-i18n-title': { fr: 'Utiliser la configuration du portail' },
              layout: 'switch',
              default: true
            },
            config: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/buttonConfig' }
          }
        },
        background: {
          title: 'Box background',
          'x-i18n-title': { fr: 'Fond', en: 'Background' },
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
                    props: { width: 2400, label: 'Upload an image', 'x-i18n-label': { fr: 'Chargez une image' } }
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
              title: 'Tint strength',
              'x-i18n-title': { fr: 'Intensité de la teinte' },
              description: 'Controls the strength of the tint on the background image. This option has no effect if the image or the color is not set.',
              'x-i18n-description': { fr: "Contrôle l'intensité de la teinte sur l'image de fond. Cette option n'a aucun effet si l'image ou la couleur n'est pas définie." },
              layout: {
                if: 'parent.data?.color && parent.data?.image',
                comp: 'slider',
                props: {
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
              title: 'Use a tonal background',
              'x-i18n-title': { fr: 'Utiliser un fond teinté' },
              description: 'Light version of the background color, with the text in that color. Not recommended for accessibility: the contrast between the text and the tonal background may be insufficient.',
              'x-i18n-description': { fr: "Version claire de la couleur de fond, avec le texte dans cette couleur. Déconseillé pour l'accessibilité : le contraste entre le texte et le fond teinté peut être insuffisant." },
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
          title: 'Layout',
          'x-i18n-title': { fr: 'Disposition' },
          default: 'equal',
          oneOf: [
            {
              const: 'equal',
              title: 'Equal width',
              'x-i18n-title': { fr: 'Largeur de même taille' }
            },
            {
              const: 'left',
              title: 'Wide left column',
              'x-i18n-title': { fr: 'Colonne gauche large' }
            },
            {
              const: 'right',
              title: 'Wide right column',
              'x-i18n-title': { fr: 'Colonne droite large' }
            }
          ]
        },
        align: {
          type: 'object',
          title: 'Elements alignment',
          'x-i18n-title': { fr: 'Alignement des éléments' },
          properties: {
            left: {
              type: 'string',
              title: 'Column 1',
              'x-i18n-title': { fr: 'Colonne 1' },
              layout: { cols: { xs: 6 } },
              oneOf: [
                { const: 'start', title: 'Align to top', 'x-i18n-title': { fr: 'Aligné en haut' } },
                { const: 'center', title: 'Align to center', 'x-i18n-title': { fr: 'Aligné au centre' } },
                { const: 'end', title: 'Align to bottom', 'x-i18n-title': { fr: 'Aligné en bas' } },
                { const: 'stretch', title: 'Stretch elements', 'x-i18n-title': { fr: 'Étendre les éléments' } }
              ]
            },
            right: {
              type: 'string',
              title: 'Column 2',
              'x-i18n-title': { fr: 'Colonne 2' },
              layout: { cols: { xs: 6 } },
              oneOf: [
                { const: 'start', title: 'Align to top', 'x-i18n-title': { fr: 'Aligné en haut' } },
                { const: 'center', title: 'Align to center', 'x-i18n-title': { fr: 'Aligné au centre' } },
                { const: 'end', title: 'Align to bottom', 'x-i18n-title': { fr: 'Aligné en bas' } },
                { const: 'stretch', title: 'Stretch elements', 'x-i18n-title': { fr: 'Étendre les éléments' } }
              ]
            }
          }
        },
        gutter: {
          type: 'string',
          title: 'Spacing between columns',
          'x-i18n-title': { fr: 'Espacement entre les colonnes' },
          default: 'default',
          oneOf: [
            { const: 'none', title: 'No spacing', 'x-i18n-title': { fr: 'Aucun espacement' } },
            { const: 'dense', title: 'Small spacing', 'x-i18n-title': { fr: 'Petit espacement' } },
            { const: 'default', title: 'Normal spacing', 'x-i18n-title': { fr: 'Espacement normal' } }
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
        en: 'Responsive grid',
        fr: 'Grille de blocs'
      },
      required: ['type', 'children'],
      properties: {
        type: { const: 'responsive-grid' },
        uuid: { type: 'string', layout: 'none' },
        columns: {
          type: 'integer',
          title: 'Number of columns',
          'x-i18n-title': { fr: 'Nombre de colonnes' },
          description: 'Number of columns used on large screens. The number of columns is reduced on smaller screens.\n\n| **Columns** | 2 | 3 | 4 | 6 |  \n| :-- | --: | --: | --: | --: |  \n| **Desktop** | 6 | 4 | 3 | 2 |  \n| **Laptop** | 6 | 6 | 3 | 3 |  \n| **Tablet** | 12 | 6 | 4 | 4 |  \n| **Mobile** | 12 | 12 | 12 | 6 |',
          'x-i18n-description': { fr: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.\n\n| **Colonnes** | 2 | 3 | 4 | 6 |  \n| :-- | --: | --: | --: | --: |  \n| **Ordinateur de bureau** | 6 | 4 | 3 | 2 |  \n| **Ordinateur portable** | 6 | 6 | 3 | 3 |  \n| **Tablette** | 12 | 6 | 4 | 4 |  \n| **Mobile** | 12 | 12 | 12 | 6 |' },
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
          title: 'Spacing between blocks',
          'x-i18n-title': { fr: 'Espacement entre les blocs' },
          default: 'default',
          oneOf: [
            { const: 'none', title: 'No spacing', 'x-i18n-title': { fr: 'Aucun espacement' } },
            { const: 'dense', title: 'Small spacing', 'x-i18n-title': { fr: 'Petit espacement' } },
            { const: 'default', title: 'Normal spacing', 'x-i18n-title': { fr: 'Espacement normal' } }
          ]
        },
        align: {
          type: 'string',
          title: 'Vertical alignment of blocks',
          'x-i18n-title': { fr: 'Alignement vertical des blocs' },
          oneOf: [
            { const: 'start', title: 'Align to top', 'x-i18n-title': { fr: 'Aligné en haut' } },
            { const: 'center', title: 'Align to center', 'x-i18n-title': { fr: 'Aligné au centre' } },
            { const: 'end', title: 'Align to bottom', 'x-i18n-title': { fr: 'Aligné en bas' } },
            { const: 'stretch', title: 'Stretch blocks', 'x-i18n-title': { fr: 'Étendre les blocs' } }
          ]
        },
        centered: {
          type: 'boolean',
          title: 'Center blocks on incomplete rows',
          'x-i18n-title': { fr: 'Centrer les blocs sur les lignes incomplètes' },
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
          title: 'Stretch',
          'x-i18n-title': { fr: 'Étendre' }
        },
        align: {
          layout: {
            if: '!parent.data.grow'
          },
          type: 'string',
          title: 'Alignment',
          'x-i18n-title': { fr: 'Alignement' },
          default: 'start',
          oneOf: [
            { const: 'start', title: 'Start', 'x-i18n-title': { fr: 'Début' } },
            { const: 'center', title: 'Center', 'x-i18n-title': { fr: 'Centre' } },
            { const: 'end', title: 'End', 'x-i18n-title': { fr: 'Fin' } }
          ]
        },
        border: {
          title: 'Show a border',
          'x-i18n-title': { fr: 'Afficher une bordure' },
          type: 'boolean',
          default: true
        },
        keepTextSize: {
          title: 'Keep the portal text size',
          'x-i18n-title': { fr: 'Conserver la taille de texte du portail' },
          description: "By default, the text of tabs is displayed smaller than the portal's (14px instead of 16px, Material Design rule). Enable this option to keep the portal's normal size.",
          'x-i18n-description': { fr: 'Par défaut, le texte des onglets est affiché plus petit que celui du portail (14px au lieu de 16px, règle Material Design). Activez cette option pour garder la taille normale du portail.' },
          type: 'boolean'
        },
        tabs: {
          type: 'array',
          title: 'Tabs',
          'x-i18n-title': { fr: 'Onglets' },
          layout: {
            messages: {
              addItem: 'Add a tab',
              'x-i18n-addItem': { fr: 'Ajouter un onglet' },
            },
            listEditMode: 'inline'
          },
          items: {
            type: 'object',
            required: [],
            properties: {
              title: {
                title: 'Tab title',
                'x-i18n-title': { fr: 'Titre onglet' },
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
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          layout: { ...inheritedStyleLayout }
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
          layout: { ...inheritedStyleLayout }
        },
        keepTextSize: {
          title: 'Keep the portal text size',
          'x-i18n-title': { fr: 'Conserver la taille de texte du portail' },
          description: "By default, the text of panels is displayed smaller than the portal's (14px instead of 16px, Material Design rule). Enable this option to keep the portal's normal size.",
          'x-i18n-description': { fr: 'Par défaut, le texte des panneaux est affiché plus petit que celui du portail (14px au lieu de 16px, règle Material Design). Activez cette option pour garder la taille normale du portail.' },
          type: 'boolean'
        },
        multiple: {
          type: 'boolean',
          title: 'Allow multiple open panels',
          'x-i18n-title': { fr: "Permettre l'ouverture multiple" },
          description: 'Lets the user have several panels open at the same time.',
          'x-i18n-description': { fr: "Permet à l'utilisateur d'avoir plusieurs panneaux ouverts en même temps." }
        },
        openFirst: {
          type: 'boolean',
          title: 'Open the first panel by default',
          'x-i18n-title': { fr: 'Ouvrir le premier panneau par défaut' },
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
          title: 'Open all panels by default',
          'x-i18n-title': { fr: 'Ouvrir tous les panneaux par défaut' },
          layout: { if: 'parent.data?.multiple' }
        },
        titleBackgroundColor: {
          title: 'Titles background color',
          'x-i18n-title': { fr: 'Couleur de fond des titres' },
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
          title: 'Content background color',
          'x-i18n-title': { fr: 'Couleur de fond du contenu' },
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
          title: 'Panels',
          'x-i18n-title': { fr: 'Panneaux' },
          layout: {
            messages: {
              addItem: 'Add a panel',
              'x-i18n-addItem': { fr: 'Ajouter un panneau' },
            },
            listEditMode: 'inline'
          },
          items: {
            type: 'object',
            required: [],
            properties: {
              title: {
                title: 'Panel title',
                'x-i18n-title': { fr: 'Titre du panneau' },
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
