/* eslint-disable no-template-curly-in-string */
export default {
  $id: 'https://github.com/data-fair/portals/page-elements',
  'x-exports': ['types', 'vjsf'],
  'x-jstt': { additionalProperties: false },
  'x-vjsf': {
    pluginsImports: ['@koumoul/vjsf-markdown'],
    xI18n: true
  },
  'x-vjsf-locales': ['en', 'fr'],
  title: 'Page elements',
  type: 'array',
  layout: {
    clipboardKey: 'elements',
    title: '',
    listEditMode: 'dialog'
  },
  items: {
    $ref: '#/$defs/element'
  },
  $defs: {
    element: {
      title: 'Page element',
      type: 'object',
      unevaluatedProperties: false,
      layout: {
        switch: [
          { if: 'summary', slots: { component: 'page-preview-element' } }
        ]
      },
      default: {
        type: 'text',
        content: ''
      },
      oneOf: [
        // Basic elements - Elements de base
        { $ref: '#/$defs/element-title' },
        { $ref: '#/$defs/element-text' },
        { $ref: '#/$defs/element-alert' },
        { $ref: '#/$defs/element-image' },
        { $ref: '#/$defs/element-button' },
        { $ref: '#/$defs/element-divider' },
        { $ref: '#/$defs/element-iframe' },

        // Layout & structure - Mise en page & structure
        { $ref: '#/$defs/element-banner' },
        { $ref: '#/$defs/element-card' },
        { $ref: '#/$defs/element-two-columns' },
        { $ref: '#/$defs/element-responsive-flow' },
        { $ref: '#/$defs/element-tabs' },

        // Functional blocks - Blocs fonctionnels
        { $ref: '#/$defs/element-search' },
        { $ref: '#/$defs/element-topics' },
        { $ref: '#/$defs/element-metrics' },
        { $ref: '#/$defs/element-contact' },

        // Datasets - Jeux de données
        { $ref: '#/$defs/element-datasets-list' },
        { $ref: '#/$defs/element-dataset-card' },
        { $ref: '#/$defs/element-dataset-table' },
        { $ref: '#/$defs/element-dataset-form' },

        // Applications - Visualisations
        { $ref: '#/$defs/element-applications-list' },
        { $ref: '#/$defs/element-application' }
      ]
    },

    // Basic elements
    'element-title': {
      type: 'object',
      title: 'Title Element',
      'x-i18n-title': {
        en: 'Title',
        fr: 'Titre'
      },
      required: ['type', 'titleSize'],
      properties: {
        type: {
          const: 'title'
        },
        content: {
          title: 'Contenu',
          type: 'string'
        },
        titleSize: {
          title: 'Taille du titre',
          type: 'string',
          oneOf: [
            { const: 'h1', title: 'H1' },
            { const: 'h2', title: 'H2' },
            { const: 'h3', title: 'H3' },
            { const: 'h4', title: 'H4' },
            { const: 'h5', title: 'H5' },
            { const: 'h6', title: 'H6' }
          ],
          default: 'h3',
        },
        color: { $ref: '#/$defs/color' },
        centered: {
          type: 'boolean',
          title: 'Centrer le titre',
          default: false,
        },
        icon: { $ref: '#/$defs/icon' },
        line: {
          type: 'object',
          title: 'Configuration du trait',
          layout: 'card',
          properties: {
            position: {
              type: 'string',
              title: 'Afficher un trait',
              oneOf: [
                { const: 'none', title: 'Aucun trait' },
                { const: 'left', title: 'Trait à gauche du titre' },
                { const: 'bottom-small', title: 'Petit trait sous le titre' },
                { const: 'bottom-medium', title: 'Trait sous le titre (largeur du texte)' },
                { const: 'bottom-large', title: 'Trait pleine largeur sous le titre' }
              ],
              default: 'none'
            },
            color: { $ref: '#/$defs/color' }
          }
        }
      }
    },
    'element-text': {
      type: 'object',
      title: 'Texte',
      required: ['type'],
      properties: {
        type: {
          const: 'text'
        },
        content: {
          title: 'Contenu',
          type: 'string',
          layout: 'markdown'
        },
        centered: {
          type: 'boolean',
          title: 'Centrer le contenu',
          default: false,
        },
        mb: { $ref: '#/$defs/margin-bottom' },
        _html: { $ref: '#/$defs/rendered-html' }
      }
    },
    'element-alert': {
      type: 'object',
      title: 'AlertElement',
      'x-i18n-title': {
        en: 'Accented text',
        fr: 'Texte accentué'
      },
      required: ['type', 'alertType'],
      layout: {
        switch: [
          {
            if: 'data?.alertType === "none"',
            children: [
              'type', 'alertType', 'icon', 'color', 'title', 'content', 'mb'
            ]
          },
          ['type', 'alertType', 'title', 'content', 'mb']
        ]
      },
      properties: {
        type: {
          const: 'alert'
        },
        alertType: {
          type: 'string',
          title: 'Type prédéfini',
          default: 'info',
          oneOf: [
            {
              const: 'none',
              title: 'Aucun'
            },
            {
              const: 'info',
              title: 'Information'
            },
            {
              const: 'success',
              title: 'Succès'
            },
            {
              const: 'error',
              title: 'Erreur'
            },
            {
              const: 'warning',
              title: 'Avertissement'
            }
          ]
        },
        icon: { $ref: '#/$defs/icon' },
        color: { $ref: '#/$defs/color' },
        title: {
          title: 'Titre',
          type: 'string',
        },
        content: {
          title: 'Contenu',
          type: 'string',
          layout: 'markdown'
        },
        mb: { $ref: '#/$defs/margin-bottom' },
        _html: { $ref: '#/$defs/rendered-html' }
      }
    },
    'element-image': {
      type: 'object',
      title: 'Image',
      required: ['type'],
      properties: {
        type: {
          const: 'image'
        },
        banner: {
          type: 'boolean',
          title: 'Pleine largeur',
          layout: 'switch'
        },
        title: {
          title: "Titre de l'image",
          description: "Recommandé pour l'accessibilité et pour afficher une information utile au survol",
          type: 'string'
        },
        url: {
          title: "URL vers l'image",
          description: "Utile pour pointer vers une image sur un autre serveur Web. Si vous disposez de l'image en fichier sur votre poste vous pouvez la charger ci-dessous.",
          type: 'string'
        },
        image: {
          type: 'object',
          required: ['_id', 'name', 'mimeType'],
          layout: {
            if: '!parent.data?.banner',
            slots: {
              component: {
                name: 'image-upload',
                props: { width: 2400, label: 'Chargez une image' } // max width of v-container
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
        wideImage: {
          type: 'object',
          required: ['_id', 'name', 'mimeType'],
          layout: {
            if: 'parent.data?.banner',
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
        height: {
          title: 'Hauteur fixe (px)',
          type: 'integer',
          minimum: 0
        },
        cover: {
          type: 'boolean',
          title: 'Recadrer l\'image pour remplir l\'espace',
          layout: {
            if: '!parent.data?.banner',
            comp: 'switch'
          }
        },
        href: {
          title: 'URL vers une autre page',
          description: "L'image devient un lien qui pointe vers l'URL renseignée.",
          type: 'string'
        },
        legend: {
          type: 'string',
          title: "Légende de l'image",
          description: "Légende affichée en italique en dessous de l'image",
        },
        zoomable: {
          type: 'boolean',
          title: 'Zoom au clic',
          description: "Ne fonctionne que si aucun lien n'est associé à l'image",
          layout: { if: '!parent.data?.banner' }
        },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },
    'element-button': {
      type: 'object',
      title: 'ButtonElement',
      'x-i18n-title': {
        en: 'Navigation button',
        fr: 'Bouton de navigation'
      },
      layout: {
        children: [
          'type',
          'link',
          {
            title: 'Configuration du bouton',
            comp: 'card',
            children: [
              'usePortalConfig',
              {
                if: '!parent.data?.usePortalConfig',
                children: ['config']
              }
            ]
          },
          'centered',
          'mb'
        ]
      },
      required: ['type'],
      properties: {
        type: { const: 'button' },
        link: { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/linkItem' },
        usePortalConfig: {
          type: 'boolean',
          title: 'Utiliser la configuration du portail',
          layout: { comp: 'switch' },
          default: true
        },
        config: { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/linkConfig' },
        centered: {
          type: 'boolean',
          title: 'Centré',
          default: true
        },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },
    'element-divider': {
      type: 'object',
      title: 'Séparateur horizontal',
      required: ['type', 'opacity', 'thickness'],
      properties: {
        type: {
          const: 'divider'
        },
        color: {
          $ref: '#/$defs/color'
        },
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
          layout: 'slider',
          default: 0.12,
          minimum: 0.12,
          maximum: 1
        },
        thickness: {
          type: 'integer',
          title: 'Épaisseur',
          layout: 'slider',
          default: 1,
          minimum: 1,
          maximum: 10
        }
      }
    },
    'element-iframe': {
      type: 'object',
      title: 'IFrame',
      required: ['type', 'url'],
      properties: {
        type: {
          const: 'iframe'
        },
        title: {
          title: "Titre de l'iframe",
          description: "Recommandé pour l'accessibilité.",
          type: 'string'
        },
        url: {
          title: "URL de l'iframe",
          description: "URL de la page web à afficher dans l'iframe.",
          type: 'string'
        },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },

    // Layout & structure elements
    'element-banner': {
      type: 'object',
      title: 'Banner Element',
      'x-i18n-title': {
        en: 'Colored background section',
        fr: 'Section sur fond coloré'
      },
      required: ['type', 'children'],
      layout: {
        children: [
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
        ]
      },
      properties: {
        type: {
          const: 'banner'
        },
        children: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: '#/$defs/element'
          }
        },
        fullWidth: {
          type: 'boolean',
          title: 'Pleine largeur',
          description: "La section s'étendra sur toute la largeur de l'écran, en ignorant les marges latérales de la page. Cette option n'a aucun effet si le bloc n'est pas à la racine de la page.",
          layout: 'switch'
        },
        background: {
          title: 'Configuration du fond',
          layout: 'card',
          properties: {
            color: { $ref: '#/$defs/color-background' },
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
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },
    'element-card': {
      type: 'object',
      title: 'Card Element',
      'x-i18n-title': {
        en: 'Card',
        fr: 'Boite'
      },
      required: ['type', 'children', 'actions'],
      properties: {
        type: {
          const: 'card'
        },
        children: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: '#/$defs/element'
          }
        },
        title: {
          title: 'Titre',
          type: 'string',
        },
        href: {
          title: 'URL vers une autre page',
          description: "La vignette devient un lien qui pointe vers l'URL renseignée.",
          type: 'string'
        },
        elevation: {
          type: 'integer',
          title: 'Élévation',
          default: 0,
          oneOf: [
            { const: 0, title: 'Aucune' },
            { const: 1, title: 'Légère' },
            { const: 2, title: 'Modérée' },
            { const: 3, title: 'Forte' }
          ]
        },
        // density: {
        //   type: 'string',
        //   title: 'Densité',
        //   default: 'comfortable',
        //   oneOf: [
        //     { const: 'default', title: 'Normale' },
        //     { const: 'comfortable', title: 'Confortable' },
        //     { const: 'compact', title: 'Compacte' }
        //   ]
        // },
        rounded: {
          type: 'string',
          title: 'Arrondi',
          default: 'default',
          oneOf: [
            { const: '0', title: 'Aucun' },
            { const: 'default', title: 'Normal' },
            { const: 'lg', title: 'Moyen' },
            { const: 'xl', title: 'Grand' }
          ]
        },
        border: {
          title: 'Bordure',
          type: 'boolean',
          default: true
        },
        actions: {
          title: 'Actions',
          type: 'array',
          layout: {
            messages: {
              addItem: 'Ajouter un bouton d\'action'
            },
            listEditMode: 'inline'
          },
          items: {
            $ref: '#/$defs/button'
          }
        },
        background: {
          title: 'Configuration du fond',
          layout: 'card',
          properties: {
            color: { $ref: '#/$defs/color-background' },
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
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },
    'element-two-columns': {
      type: 'object',
      title: 'Two Columns Element',
      'x-i18n-title': {
        en: '2 Columns',
        fr: '2 Colonnes'
      },
      required: ['type', 'disposition', 'gutter', 'children', 'children2'],
      properties: {
        type: {
          const: 'two-columns'
        },
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
            $ref: '#/$defs/element'
          }
        },
        children2: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: '#/$defs/element'
          }
        },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },
    'element-responsive-flow': {
      title: 'Flux responsive',
      type: 'object',
      required: ['type', 'blocks'],
      properties: {
        type: {
          const: 'responsive-flow'
        },
        blocks: {
          type: 'array',
          title: 'Blocs',
          layout: {
            messages: {
              addItem: 'Ajouter un bloc',
            },
            listEditMode: 'inline'
          },
          items: {
            type: 'object',
            properties: {
              large: {
                title: 'élargir',
                type: 'boolean',
                default: false,
              },
              children: {
                type: 'array',
                layout: 'none',
                items: {
                  $ref: '#/$defs/element'
                }
              }
            }
          }
        },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },
    'element-tabs': {
      title: 'Onglets',
      type: 'object',
      required: ['type', 'align', 'tabs'],
      properties: {
        type: {
          const: 'tabs'
        },
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
              icon: { $ref: '#/$defs/icon' },
              children: {
                type: 'array',
                layout: 'none',
                items: {
                  $ref: '#/$defs/element'
                }
              }
            }
          }
        },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },

    // Functional blocks
    'element-search': {
      type: 'object',
      title: 'Search Element',
      'x-i18n-title': {
        en: 'Search datasets',
        fr: 'Recherche de jeux de données'
      },
      required: ['type'],
      properties: {
        type: {
          const: 'search'
        },
        elevation: {
          type: 'integer',
          title: 'Élévation',
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
          default: 'default',
          oneOf: [
            { const: '0', title: 'Aucun' },
            { const: 'default', title: 'Normal' },
            { const: 'lg', title: 'Moyen' },
            { const: 'xl', title: 'Grand' }
          ]
        },
        color: { $ref: '#/$defs/color' },
        fullWidth: {
          type: 'boolean',
          title: 'Pleine largeur',
          description: 'Le champ de recherche s\'étendra sur toute la largeur de son conteneur parent.',
          layout: 'switch'
        },
        centered: {
          type: 'boolean',
          title: 'Centrer le champ de recherche',
          layout: {
            if: '!parent.data?.fullWidth'
          }
        },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },
    'element-topics': {
      type: 'object',
      title: 'Topics Element',
      'x-i18n-title': {
        en: 'Topics list',
        fr: 'Liste des thématiques'
      },
      required: ['type'],
      properties: {
        type: {
          const: 'topics'
        },
        color: {
          type: 'string',
          title: 'Couleur',
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
          title: 'Afficher les icônes des thématiques',
          layout: 'switch',
          default: true
        },
        iconColor: {
          type: 'string',
          title: 'Couleur des icônes des thématiques',
          layout: {
            if: 'parent.data?.showIcon === true'
          },
          oneOf: [
            { const: 'default', title: 'Couleur de la thématique' },
            { const: 'primary', title: 'Primaire' },
            { const: 'secondary', title: 'Secondaire' },
            { const: 'accent', title: 'Accentuée' }
          ]
        },
        centered: {
          type: 'boolean',
          title: 'Centrer les thématiques'
        },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },
    'element-metrics': {
      type: 'object',
      title: 'Metrics Element',
      'x-i18n-title': {
        en: 'Key metrics',
        fr: 'Chiffres clés'
      },
      required: ['type', 'metrics'],
      properties: {
        type: {
          const: 'metrics'
        },
        metrics: {
          type: 'array',
          title: 'Chiffres à afficher',
          description: 'Sélectionnez les chiffres clés à afficher.',
          default: ['datasets', 'records', 'applications'],
          items: {
            type: 'string',
            oneOf: [
              { const: 'datasets', title: 'Jeux de données' },
              { const: 'records', title: 'Enregistrements' },
              { const: 'applications', title: 'Visualisations' }
            ]
          }
        },
        color: { $ref: '#/$defs/color' },
        elevation: {
          type: 'integer',
          title: 'Élévation',
          default: 0,
          oneOf: [
            { const: 0, title: 'Aucune' },
            { const: 1, title: 'Légère' },
            { const: 2, title: 'Modérée' },
            { const: 3, title: 'Forte' }
          ]
        },
        rounded: {
          type: 'string',
          title: 'Arrondi',
          default: 'default',
          oneOf: [
            { const: '0', title: 'Aucun' },
            { const: 'default', title: 'Normal' },
            { const: 'lg', title: 'Moyen' },
            { const: 'xl', title: 'Grand' },
            { const: 'shaped', title: 'Coins opposés' }
          ]
        },
        fullWidth: {
          type: 'boolean',
          title: 'Pleine largeur',
          description: "Les boîtes s'étendront pour remplir la ligne.",
          layout: 'switch'
        },
        border: {
          type: 'boolean',
          title: 'Bordure',
          default: true
        },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },
    'element-contact': {
      type: 'object',
      title: 'ContactElement',
      'x-i18n-title': {
        en: 'Contact form',
        fr: 'Formulaire de contact'
      },
      required: ['type'],
      properties: {
        type: {
          const: 'contact'
        },
        additionalFields: {
          type: 'array',
          title: 'Champs additionnels',
          description: 'Ajoutez des champs supplémentaires au formulaire de contact.',
          layout: {
            messages: {
              addItem: 'Ajouter un champ',
            },
            listEditMode: 'inline'
          },
          items: {
            type: 'object',
            default: { type: 'text' },
            oneOf: [
              {
                title: 'Champ de texte',
                description: "Permet à l'utilisateur de saisir une valeur libre (texte, nom, etc.).",
                required: ['type'],
                properties: {
                  type: { const: 'text' },
                  label: {
                    type: 'string',
                    title: 'Libellé du champ'
                  },
                  required: {
                    type: 'boolean',
                    title: 'Champ obligatoire',
                    layout: 'switch'
                  }
                }
              },
              {
                title: 'Liste déroulante personnalisée',
                description: "Propose à l'utilisateur de choisir parmi une liste de valeurs que vous définissez.",
                required: ['type'],
                properties: {
                  type: { const: 'select' },
                  label: {
                    type: 'string',
                    title: 'Libellé du champ'
                  },
                  options: {
                    type: 'array',
                    title: 'Options disponibles',
                    description: 'Liste des valeurs proposées dans le menu déroulant.',
                    items: {
                      type: 'string',
                      title: 'Option'
                    }
                  },
                  required: {
                    type: 'boolean',
                    title: 'Champ obligatoire',
                    layout: 'switch'
                  },
                  multiple: {
                    type: 'boolean',
                    title: 'Choix multiple autorisé',
                    layout: 'switch'
                  }
                }
              },
              {
                title: 'Liste déroulante de jeux de données',
                description: "Permet à l'utilisateur de sélectionner un jeu de données publié sur votre portail.",
                required: ['type'],
                properties: {
                  type: { const: 'dataset' },
                  label: {
                    type: 'string',
                    title: 'Libellé du champ'
                  },
                  required: {
                    type: 'boolean',
                    title: 'Champ obligatoire',
                    layout: 'switch'
                  }
                }
              },
              {
                title: 'Liste déroulante de visualisations',
                description: "Permet à l'utilisateur de choisir une visualisation publiée sur votre portail.",
                required: ['type'],
                properties: {
                  type: { const: 'application' },
                  label: {
                    type: 'string',
                    title: 'Libellé du champ'
                  },
                  required: {
                    type: 'boolean',
                    title: 'Champ obligatoire',
                    layout: 'switch'
                  }
                }
              }
            ]
          }
        },
        showInfo: {
          type: 'boolean',
          layout: 'switch',
          title: 'Afficher les informations de contact'
        },
        showSocial: {
          type: 'boolean',
          layout: 'switch',
          title: 'Afficher les liens de réseaux sociaux'
        },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },

    // Datasets
    'element-datasets-list': {
      type: 'object',
      title: 'Datasets List Element',
      'x-i18n-title': {
        en: 'Datasets list',
        fr: 'Liste de jeux de données'
      },
      layout: {
        children: [
          'type',
          'columns',
          'limit',
          'mb',
          {
            title: 'Dataset Card',
            'x-i18n-title': {
              fr: 'Configuration des vignettes'
            },
            comp: 'card',
            children: [
              'usePortalConfig',
              {
                if: '!data?.usePortalConfig',
                children: ['cardConfig']
              }
            ]
          }
        ]
      },
      required: ['type', 'columns', 'limit', 'usePortalConfig'],
      properties: {
        type: {
          const: 'datasets-list'
        },
        columns: {
          type: 'integer',
          title: 'Nombre de colonnes',
          description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
          default: 3,
          minimum: 1,
          maximum: 3
        },
        limit: {
          type: 'integer',
          title: 'Nombre de jeux de données',
          default: 3,
          minimum: 1,
          maximum: 12
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Utiliser la configuration du portail',
          layout: 'switch',
          default: true
        },
        cardConfig: { $ref: 'https://github.com/data-fair/portals/portal-config-dataset-card' },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },
    'element-dataset-card': {
      type: 'object',
      title: 'Dataset Card Element',
      'x-i18n-title': {
        en: 'Dataset card',
        fr: 'Vignette d\'un jeu de données'
      },
      layout: {
        children: [
          'type',
          'dataset',
          'mb',
          {
            title: 'Dataset Card',
            'x-i18n-title': {
              fr: 'Configuration de la vignette'
            },
            comp: 'card',
            children: [
              'usePortalConfig',
              {
                if: '!data?.usePortalConfig',
                children: ['cardConfig']
              }
            ]
          }
        ]
      },
      required: ['type', 'dataset', 'usePortalConfig'],
      properties: {
        type: {
          const: 'dataset-card'
        },
        dataset: {
          type: 'object',
          title: 'Jeu de données',
          additionalProperties: false,
          required: ['id'],
          layout: {
            getItems: {
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&select=id,title',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.id})`',
              itemKey: 'item.id'
            }
          },
          properties: {
            id: {
              type: 'string'
            },
            title: {
              type: 'string'
            }
          }
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Utiliser la configuration du portail',
          layout: 'switch',
          default: true
        },
        cardConfig: { $ref: 'https://github.com/data-fair/portals/portal-config-dataset-card' },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },
    'element-dataset-table': {
      type: 'object',
      title: 'Dataset table',
      'x-i18n-title': {
        fr: 'Tableau d\'un jeu de données'
      },
      required: ['type', 'dataset', 'interactions'],
      properties: {
        type: {
          const: 'dataset-table'
        },
        dataset: {
          type: 'object',
          title: 'Jeu de données',
          additionalProperties: false,
          required: ['id'],
          layout: {
            getItems: {
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&select=id,title',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.id})`',
              itemKey: 'item.id'
            }
          },
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            href: { type: 'string' }
          }
        },
        syncParams: {
          type: 'boolean',
          layout: 'switch',
          title: 'Synchroniser les paramètres d\'URL',
          description: 'Si activé, les paramètres de la page seront transmis au tableau. Utile pour partager la page avec une vue spécifique du tableau.',
          default: true
        },
        display: {
          type: 'string',
          title: 'Mode d\'affichage par défaut',
          description: 'L\'utilisateur final peut modifier le mode d\'affichage sauf si les interactions sont désactivées.',
          oneOf: [
            {
              const: 'table',
              title: 'Table'
            },
            {
              const: 'table-dense',
              title: 'Table dense'
            },
            {
              const: 'list',
              title: 'Liste de vignettes'
            }
          ]
        },
        cols: {
          title: 'Colonnes visibles par défaut',
          description: 'Si aucune colonne n\'est sélectionnée, toutes les colonnes seront affichées par défaut. L\'utilisateur final peut modifier les colonnes visibles sauf si les interactions sont désactivées.',
          type: 'array',
          layout: {
            getItems: {
              url: '/data-fair/api/v1/datasets/${parent.data.dataset.id}/schema?calculated=false',
              itemTitle: 'item.label',
              itemValue: 'item.key'
            }
          },
          items: { type: 'string' }
        },
        interactions: {
          title: 'Autoriser les interactions',
          description: 'Autorise le tri, la recherche, les filtres,...',
          type: 'boolean',
          default: true
        },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },
    'element-dataset-form': {
      type: 'object',
      title: 'Dataset form',
      'x-i18n-title': {
        fr: 'Formulaire d\'un jeu de données'
      },
      required: ['type', 'dataset'],
      properties: {
        type: {
          const: 'dataset-form'
        },
        dataset: {
          type: 'object',
          title: 'Jeu de données',
          additionalProperties: false,
          required: ['id'],
          layout: {
            getItems: {
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&rest=true&status=finalized&select=id,title',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.id})`',
              itemKey: 'item.id'
            }
          },
          properties: {
            id: {
              type: 'string'
            },
            title: {
              type: 'string'
            }
          }
        },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },

    // Applications
    'element-applications-list': {
      type: 'object',
      title: 'Applications List Element',
      'x-i18n-title': {
        en: 'Applications list',
        fr: 'Liste de visualisations'
      },
      layout: {
        children: [
          'type',
          'columns',
          'limit',
          'mb',
          {
            title: 'Application Card',
            'x-i18n-title': {
              fr: 'Vignette d\'une visualisation'
            },
            comp: 'card',
            children: [
              'usePortalConfig',
              {
                if: '!data?.usePortalConfig',
                children: ['cardConfig']
              }
            ]
          }
        ]
      },
      required: ['type', 'columns', 'limit'],
      properties: {
        type: {
          const: 'applications-list'
        },
        columns: {
          type: 'integer',
          title: 'Nombre de colonnes',
          description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
          default: 3,
          minimum: 1,
          maximum: 3
        },
        limit: {
          type: 'integer',
          title: 'Nombre de visualisations',
          description: 'Nombre total de visualisations à afficher.',
          default: 3,
          minimum: 1,
          maximum: 12
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Utiliser la configuration du portail',
          layout: 'switch',
          default: true
        },
        cardConfig: { $ref: 'https://github.com/data-fair/portals/portal-config-application-card' },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },
    'element-application': {
      type: 'object',
      title: 'Application Element',
      'x-i18n-title': {
        en: 'Application',
        fr: 'Visualisation'
      },
      required: ['type', 'application'],
      properties: {
        type: {
          const: 'application'
        },
        application: {
          type: 'object',
          title: 'Application',
          'x-i18n-title': {
            fr: 'Visualisations'
          },
          additionalProperties: false,
          required: ['id', 'title', 'slug'],
          layout: {
            getItems: {
              url: '/data-fair/api/v1/applications?mine=true&select=id,title,slug',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.id})`',
              itemKey: 'item.id'
            }
          },
          properties: {
            id: {
              type: 'string'
            },
            title: {
              type: 'string'
            },
            slug: {
              type: 'string'
            }
          }
        },
        syncParams: {
          type: 'boolean',
          layout: 'switch',
          title: 'Synchroniser les paramètres d\'URL',
          description: 'Si activé, les paramètres de la page seront transmis à l\'application. Utile pour partager la page avec une vue spécifique de l\'application.',
          default: true
        },
        mb: { $ref: '#/$defs/margin-bottom' }
      }
    },

    // Reusable definitions
    icon: {
      type: 'object',
      title: 'Configuration de l\'icône',
      layout: 'card',
      properties: {
        mdi: {
          type: 'object',
          title: 'Icône MDI',
          required: ['name', 'svg', 'svgPath'],
          layout: {
            getItems: {
              url: 'https://koumoul.com/data-fair/api/v1/datasets/icons-mdi-latest/lines?q={q}&select=name,svg,svgPath',
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
          title: 'Icône personnalisée',
          description: 'Seul les SVG Path sont supportés.',
          layout: { cols: { md: 6 } }
        },
        color: { $ref: '#/$defs/color' }
      }
    },
    color: {
      type: 'string',
      title: 'Couleur',
      oneOf: [
        { const: 'primary', title: 'Primaire' },
        { const: 'secondary', title: 'Secondaire' },
        { const: 'accent', title: 'Accentuée' },
        { const: 'info', title: 'Information' },
        { const: 'success', title: 'Succès' },
        { const: 'error', title: 'Erreur' },
        { const: 'warning', title: 'Avertissement' }
      ]
    },
    'color-background': {
      type: 'string',
      title: 'Couleur',
      oneOf: [
        { const: 'primary', title: 'Primaire' },
        { const: 'secondary', title: 'Secondaire' },
        { const: 'accent', title: 'Accentuée' },
        { const: 'info', title: 'Information' },
        { const: 'success', title: 'Succès' },
        { const: 'error', title: 'Erreur' },
        { const: 'warning', title: 'Avertissement' },
        { const: 'surface', title: 'Couleur des surfaces' },
        { const: 'surface-inverse', title: 'Couleur inversée des surfaces' },
        { const: 'background', title: 'Couleur du fond de page' }
      ]
    },
    button: {
      type: 'object',
      title: 'Bouton',
      required: ['color'],
      default: {
        color: 'primary'
      },
      properties: {
        label: {
          type: 'string',
          title: 'Libellé'
        },
        href: {
          type: 'string',
          title: 'URL'
        },
        icon: {
          $ref: '#/$defs/icon'
        },
        color: {
          $ref: '#/$defs/color'
        }
      }
    },
    'margin-bottom': {
      title: 'Espacement inférieur',
      type: 'integer',
      layout: {
        comp: 'slider',
        props: {
          step: 1,
          thumbLabel: true,
          showTicks: 'always'
        }
      },
      default: 4,
      minimum: 0,
      maximum: 16
    },
    'rendered-html': {
      title: 'Contenu rendu en HTML',
      type: 'string',
      readOnly: true,
      layout: 'none'
    }
  }
}
