/* eslint-disable no-template-curly-in-string */
const mdiShapeOutlineIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>shape-outline</title><path d="M11,13.5V21.5H3V13.5H11M9,15.5H5V19.5H9V15.5M12,2L17.5,11H6.5L12,2M12,5.86L10.08,9H13.92L12,5.86M17.5,13C20,13 22,15 22,17.5C22,20 20,22 17.5,22C15,22 13,20 13,17.5C13,15 15,13 17.5,13M17.5,15A2.5,2.5 0 0,0 15,17.5A2.5,2.5 0 0,0 17.5,20A2.5,2.5 0 0,0 20,17.5A2.5,2.5 0 0,0 17.5,15Z" /></svg>'
const mdiViewGridOutline = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>view-grid-outline</title><path d="M3 11H11V3H3M5 5H9V9H5M13 21H21V13H13M15 15H19V19H15M3 21H11V13H3M5 15H9V19H5M13 3V11H21V3M19 9H15V5H19Z" /></svg>'
const mdiPuzzleOutline = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>puzzle-outline</title><path d="M22,13.5C22,15.26 20.7,16.72 19,16.96V20A2,2 0 0,1 17,22H13.2V21.7A2.7,2.7 0 0,0 10.5,19C9,19 7.8,20.21 7.8,21.7V22H4A2,2 0 0,1 2,20V16.2H2.3C3.79,16.2 5,15 5,13.5C5,12 3.79,10.8 2.3,10.8H2V7A2,2 0 0,1 4,5H7.04C7.28,3.3 8.74,2 10.5,2C12.26,2 13.72,3.3 13.96,5H17A2,2 0 0,1 19,7V10.04C20.7,10.28 22,11.74 22,13.5M17,15H18.5A1.5,1.5 0 0,0 20,13.5A1.5,1.5 0 0,0 18.5,12H17V7H12V5.5A1.5,1.5 0 0,0 10.5,4A1.5,1.5 0 0,0 9,5.5V7H4V9.12C5.76,9.8 7,11.5 7,13.5C7,15.5 5.75,17.2 4,17.88V20H6.12C6.8,18.25 8.5,17 10.5,17C12.5,17 14.2,18.25 14.88,20H17V15Z" /></svg>'
const mdiDatabaseOutline = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>database-outline</title><path d="M12 3C7.58 3 4 4.79 4 7V17C4 19.21 7.59 21 12 21S20 19.21 20 17V7C20 4.79 16.42 3 12 3M18 17C18 17.5 15.87 19 12 19S6 17.5 6 17V14.77C7.61 15.55 9.72 16 12 16S16.39 15.55 18 14.77V17M18 12.45C16.7 13.4 14.42 14 12 14C9.58 14 7.3 13.4 6 12.45V9.64C7.47 10.47 9.61 11 12 11C14.39 11 16.53 10.47 18 9.64V12.45M12 9C8.13 9 6 7.5 6 7S8.13 5 12 5C15.87 5 18 6.5 18 7S15.87 9 12 9Z" /></svg>'
const mdiImageMultiple = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>image-multiple</title><path d="M22,16V4A2,2 0 0,0 20,2H8A2,2 0 0,0 6,4V16A2,2 0 0,0 8,18H20A2,2 0 0,0 22,16M11,12L13.03,14.71L16,11L20,16H8M2,6V20A2,2 0 0,0 4,22H18V20H4V6" /></svg>'

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
      oneOfLayout: {
        label: 'Type of element',
        'x-i18n-label': {
          fr: "Type d'élément"
        },
        oneOfItems: [
          {
            header: true,
            title: 'Basic elements',
            'x-i18n-title': {
              fr: 'Éléments de base'
            },
            icon: mdiShapeOutlineIcon
          },
          { key: 0, title: 'Title', 'x-i18n-title': { fr: 'Titre' } },
          { key: 1, title: 'Text', 'x-i18n-title': { fr: 'Texte' } },
          { key: 2, title: 'Accented text', 'x-i18n-title': { fr: 'Texte accentué' } },
          { key: 3, title: 'Image', 'x-i18n-title': { fr: 'Image' } },
          { key: 4, title: 'Navigation button', 'x-i18n-title': { fr: 'Bouton de navigation' } },
          { key: 5, title: 'Navigation menu', 'x-i18n-title': { fr: 'Menu de navigation' } },
          { key: 6, title: 'Divider', 'x-i18n-title': { fr: 'Séparateur horizontal' } },
          { key: 7, title: 'IFrame', 'x-i18n-title': { fr: 'IFrame' } },
          {
            header: true,
            title: 'Layout & structure',
            'x-i18n-title': {
              fr: 'Mise en page & structure'
            },
            icon: mdiViewGridOutline
          },
          { key: 8, title: 'Colored background section', 'x-i18n-title': { fr: 'Section sur fond coloré' } },
          { key: 9, title: 'Card', 'x-i18n-title': { fr: 'Boite' } },
          { key: 10, title: 'Two columns', 'x-i18n-title': { fr: 'Deux colonnes' } },
          // { key: 11, title: 'Responsive Flow', 'x-i18n-title': { fr: 'Flux responsive' } }, // TODO: Create the element-responsive-flow
          { key: 12, title: 'Tabs', 'x-i18n-title': { fr: 'Onglets' } },
          {
            header: true,
            title: 'Functional blocks',
            'x-i18n-title': {
              fr: 'Blocs fonctionnels'
            },
            icon: mdiPuzzleOutline
          },
          { key: 13, title: 'Search', 'x-i18n-title': { fr: 'Barre de recherche' } },
          { key: 14, title: 'Topics list', 'x-i18n-title': { fr: 'Liste des thématiques' } },
          // { key: 15, title: 'Key metrics', 'x-i18n-title': { fr: 'Chiffres clés' } }, // Deprecated ?
          { key: 16, title: 'Contact form', 'x-i18n-title': { fr: 'Formulaire de contact' } },
          {
            header: true,
            title: 'Datasets',
            'x-i18n-title': {
              fr: 'Jeux de données'
            },
            icon: mdiDatabaseOutline
          },
          { key: 17, title: 'Datasets catalog', 'x-i18n-title': { fr: 'Catalogue de données' } },
          { key: 18, title: 'Datasets list', 'x-i18n-title': { fr: 'Liste de jeux de données' } },
          { key: 19, title: 'Dataset card', 'x-i18n-title': { fr: "Vignette d'un jeu de données" } },
          { key: 20, title: 'Dataset table', 'x-i18n-title': { fr: "Tableau d'un jeu de données" } },
          { key: 21, title: 'Dataset form', 'x-i18n-title': { fr: "Formulaire d'un jeu de données" } },
          {
            header: true,
            title: 'Applications',
            'x-i18n-title': {
              fr: 'Visualisations'
            },
            icon: mdiImageMultiple
          },
          { key: 22, title: 'Applications catalog', 'x-i18n-title': { fr: 'Catalogue de visualisations' } },
          { key: 23, title: 'Applications list', 'x-i18n-title': { fr: 'Liste de visualisations' } },
          { key: 24, title: 'Application', 'x-i18n-title': { fr: 'Visualisation' } }
        ]
      },
      default: {
        type: 'text',
        content: ''
      },
      oneOf: [
        // Basic elements
        { $ref: '#/$defs/element-title' },
        { $ref: '#/$defs/element-text' },
        { $ref: '#/$defs/element-alert' },
        { $ref: '#/$defs/element-image' },
        { $ref: '#/$defs/element-button' },
        { $ref: '#/$defs/element-menu' },
        { $ref: '#/$defs/element-divider' },
        { $ref: '#/$defs/element-iframe' },

        // Layout & structure
        { $ref: '#/$defs/element-banner' },
        { $ref: '#/$defs/element-card' },
        { $ref: '#/$defs/element-two-columns' },
        { $ref: '#/$defs/element-responsive-flow' },
        { $ref: '#/$defs/element-tabs' },

        // Functional blocks
        { $ref: '#/$defs/element-search' },
        { $ref: '#/$defs/element-topics' },
        { $ref: '#/$defs/element-metrics' },
        { $ref: '#/$defs/element-contact' },

        // Datasets
        { $ref: '#/$defs/element-datasets-catalog' },
        { $ref: '#/$defs/element-datasets-list' },
        { $ref: '#/$defs/element-dataset-card' },
        { $ref: '#/$defs/element-dataset-table' },
        { $ref: '#/$defs/element-dataset-form' },

        // Applications
        { $ref: '#/$defs/element-applications-catalog' },
        { $ref: '#/$defs/element-applications-list' },
        { $ref: '#/$defs/element-application' }
      ]
    },

    // Basic elements
    'element-title': {
      type: 'object',
      title: 'TitleElement',
      'x-i18n-title': {
        en: 'Title',
        fr: 'Titre'
      },
      required: ['type', 'titleSize'],
      properties: {
        type: { const: 'title' },
        content: {
          title: 'Content',
          'x-i18n-title': {
            fr: 'Contenu'
          },
          type: 'string'
        },
        titleSize: {
          title: 'Title size',
          'x-i18n-title': {
            fr: 'Taille du titre'
          },
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
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color' },
        centered: {
          type: 'boolean',
          title: 'Center the title',
          'x-i18n-title': {
            fr: 'Centrer le titre'
          },
          default: false,
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
        line: {
          type: 'object',
          title: 'Line configuration',
          'x-i18n-title': {
            fr: 'Configuration du trait'
          },
          layout: 'card',
          properties: {
            position: {
              type: 'string',
              title: 'Display a line',
              'x-i18n-title': {
                fr: 'Afficher un trait'
              },
              oneOf: [
                { const: 'none', title: 'Aucun trait' },
                { const: 'left', title: 'Trait à gauche du titre' },
                { const: 'bottom-small', title: 'Petit trait sous le titre' },
                { const: 'bottom-medium', title: 'Trait sous le titre (largeur du texte)' },
                { const: 'bottom-large', title: 'Trait pleine largeur sous le titre' }
              ],
              default: 'none'
            },
            color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color' }
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
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' },
        _html: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/rendered-html' }
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
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-full' },
        title: {
          title: 'Titre',
          type: 'string',
        },
        content: {
          title: 'Contenu',
          type: 'string',
          layout: 'markdown'
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' },
        _html: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/rendered-html' }
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
          title: "Recadrer l'image pour remplir l'espace",
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
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
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
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-menu': {
      type: 'object',
      title: 'MenuElement',
      'x-i18n-title': {
        en: 'Navigation menu',
        fr: 'Menu de navigation'
      },
      layout: {
        children: [
          'type',
          'label',
          'links',
          {
            title: 'Configuration du menu',
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
        type: { const: 'menu' },
        label: {
          type: 'string',
          title: 'Libellé du menu',
          description: 'Texte affiché sur le bouton du menu',
          default: 'Menu'
        },
        links: {
          type: 'array',
          title: 'Liens',
          items: { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/linkItem' },
          layout: {
            listEditMode: 'inline',
            messages: { addItem: 'Ajouter un lien' }
          }
        },
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
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
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
          type: 'string',
          layout: {
            slots: {
              before: "**Important** : Pour que l'intégration IFrame fonctionne correctement, vous devez ajouter le nom de domaine de l'URL dans la **Configuration du portail** → section **Sécurité**."
            }
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },

    // Layout & structure elements
    'element-banner': {
      type: 'object',
      title: 'BannerElement',
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
            color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-full' },
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
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation'
        },
        // density: {
        //   $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density'
        // },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded'
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
              addItem: "Ajouter un bouton d'action"
            },
            listEditMode: 'inline'
          },
          items: {
            type: 'object',
            title: 'Bouton',
            required: ['color'],
            default: { color: 'primary' },
            properties: {
              label: {
                type: 'string',
                title: 'Libellé'
              },
              href: {
                type: 'string',
                title: 'URL'
              },
              icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
              color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color' }
            }
          }
        },
        background: {
          title: 'Configuration du fond',
          layout: 'card',
          properties: {
            color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-full' },
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
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-responsive-flow': {
      type: 'object',
      title: 'ResponsiveFlowElement',
      'x-i18n-title': {
        en: 'Responsive Flow',
        fr: 'Flux responsive'
      },
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
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-tabs': {
      title: 'TabsElement',
      'x-i18n-title': {
        en: 'tabs',
        fr: 'Onglets'
      },
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
              icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
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
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },

    // Functional blocks
    'element-search': {
      type: 'object',
      title: 'SearchElement',
      'x-i18n-title': {
        en: 'Search',
        fr: 'Barre de recherche'
      },
      required: ['type'],
      properties: {
        type: {
          const: 'search'
        },
        density: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density'
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded'
        },
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color' },
        btnPosition: {
          type: 'string',
          title: 'Position du bouton',
          description: 'Définit la position du bouton de recherche par rapport à la barre de saisie',
          default: 'included',
          oneOf: [
            { const: 'included', title: 'Included', 'x-i18n-title': { fr: 'Inclus' } },
            { const: 'attached', title: 'Attached', 'x-i18n-title': { fr: 'Collé' } },
            { const: 'spaced', title: 'Spaced', 'x-i18n-title': { fr: 'Espacé' } }
          ]
        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          title: 'Élévation du bouton',
          layout: { if: 'parent.data?.btnPosition !== "spaced"' }
        },
        border: {
          type: 'boolean',
          title: 'Bordure',
          description: 'Afficher une bordure autour de la barre de recherche',
          layout: 'switch',
          default: false
        },
        fullWidth: {
          type: 'boolean',
          title: 'Pleine largeur',
          description: "Le champ de recherche s'étendra sur toute la largeur de son conteneur parent.",
          layout: 'switch'
        },
        centered: {
          type: 'boolean',
          title: 'Centrer le champ de recherche',
          layout: {
            if: '!parent.data?.fullWidth'
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-topics': {
      type: 'object',
      title: 'TopicsElement',
      'x-i18n-title': {
        en: 'Topics list',
        fr: 'Liste des thématiques'
      },
      required: ['type'],
      properties: {
        type: { const: 'topics' },
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics' },
        elevation: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation' },
        density: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density' },
        rounded: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded' },
        showIcon: {
          type: 'boolean',
          title: 'Afficher les icônes des thématiques',
          layout: 'switch',
          default: true
        },
        iconColor: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics',
          title: 'Couleur des icônes des thématiques',
          layout: { if: 'parent.data?.showIcon === true' }
        },
        centered: {
          type: 'boolean',
          title: 'Centrer les thématiques'
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-metrics': {
      type: 'object',
      title: 'MetricsElement',
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
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-full' },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation'
        },
        rounded: {
          type: 'string',
          title: 'Rounded',
          'x-i18n-title': { fr: 'Arrondi' },
          default: 'default',
          oneOf: [
            { const: '0', title: 'None', 'x-i18n-title': { fr: 'Aucun' } },
            { const: 'default', title: 'Normal', 'x-i18n-title': { fr: 'Normal' } },
            { const: 'lg', title: 'Medium', 'x-i18n-title': { fr: 'Moyen' } },
            { const: 'xl', title: 'Large', 'x-i18n-title': { fr: 'Grand' } },
            { const: 'shaped', title: 'Opposite corners', 'x-i18n-title': { fr: 'Coins opposés' } }
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
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
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
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation'
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded'
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
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' },
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
        sendButton: {
          title: 'Configuration du bouton',
          layout: { comp: 'card' },
          properties: {
            usePortalConfig: {
              type: 'boolean',
              title: 'Utiliser la configuration du portail',
              layout: { comp: 'switch' },
              default: true
            },
            config: {
              $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/linkConfig',
              layout: { if: '!parent.data?.usePortalConfig' }
            }
          }
        }
      }
    },

    // Datasets
    'element-datasets-catalog': {
      title: 'DatasetsCatalogElement',
      'x-i18n-title': {
        en: 'Datasets catalog',
        fr: 'Catalogue de données'
      },
      type: 'object',
      unevaluatedProperties: false,
      required: ['type'],
      properties: {
        type: { const: 'datasets-catalog' },
        defaultSort: {
          type: 'string',
          title: 'Tri par défaut',
          description: "Ce tri sera appliqué par défaut lorsque l'utilisateur arrive sur la page. Lorsqu'il commence une recherche, le tri par pertinence sera appliqué.",
          default: 'createdAt:-1',
          oneOf: [
            { const: 'createdAt:-1', title: 'Date de création (du plus récent au plus ancien)' },
            { const: 'dataUpdatedAt:-1', title: 'Date de mise à jour (du plus récent au plus ancien)' },
            { const: 'title:1', title: 'Ordre alphabétique (A à Z)' }
          ]
        },
        columns: {
          type: 'integer',
          title: 'Nombre de colonnes',
          description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
          default: 2,
          minimum: 1,
          maximum: 3
        },
        datasetsCountPosition: {
          type: 'string',
          title: 'Position du nombre de résultats',
          default: 'top',
          oneOf: [
            { const: 'none', title: 'Aucun' },
            { const: 'top', title: 'Au dessus des filtres' }, // Used for compat with old portals
            { const: 'bottom', title: 'Au dessus des résultats' }
          ]
        },
        // Used for compat with old portals
        showApiButton: {
          type: 'boolean',
          title: 'Afficher le bouton d\'accès à la documentation API',
          description: 'Affiche un bouton à coté du nombre de résultats permettant d\'accéder à la documentation de l\'API **(Seulement sur desktop)**.',
          layout: { comp: 'switch' },
          default: true
        },
        showSortBesideCount: {
          type: 'boolean',
          title: 'Afficher le tri à droite du nombre de résultats.',
          layout: {
            if: 'parent.data?.datasetsCountPosition === "bottom"',
            comp: 'switch'
          }
        },
        showAdvancedFilters: {
          type: 'boolean',
          title: 'Activer les filtres avancés',
          description: 'Mode de configuration avancé. Permet de configurer des blocs de pages personnalisés entre les filtres de base et les résultats.',
          layout: { comp: 'switch' }
        },
        filters: {
          type: 'object',
          title: 'Configuration des filtres',
          layout: 'card',
          properties: {
            position: {
              type: 'string',
              title: 'Position des filtres',
              default: 'top',
              oneOf: [
                { const: 'top', title: 'Au dessus des résultats' },
                { const: 'left', title: 'À gauche des résultats' }
              ]
            },
            items: {
              type: 'array',
              title: 'Filtres à afficher',
              description: 'Mode simplifié pour choisir les filtres à afficher sur la page. Vous pouvez aussi utiliser des blocs fonctionnels pour plus de personnalisation des filtres.',
              items: {
                type: 'string',
                oneOf: [
                  { const: 'search', title: 'Barre de recherche' },
                  { const: 'concepts', title: 'Filtres par concepts' },
                  { const: 'topics', title: 'Filtres par thématiques' },
                  { const: 'keywords', title: 'Filtres par mots-clés' },
                  { const: 'owners', title: 'Filtres par propriétaires' },
                  { const: 'sort', title: 'Tri' }
                ]
              }
            },
            density: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density'
            },
            rounded: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded'
            },
          }
        },
        pagination: {
          type: 'object',
          title: 'Configuration de la pagination',
          layout: 'card',
          properties: {
            position: {
              type: 'string',
              title: 'Position',
              description: 'Désactiver la pagination affichera les résultats en scroll infini.',
              default: 'none',
              oneOf: [
                { const: 'none', title: 'Scroll infini' },
                { const: 'before', title: 'Avant les résultats' },
                { const: 'after', title: 'Après les résultats' },
                { const: 'both', title: 'Les deux' }
              ]
            },
            alignment: {
              type: 'string',
              title: 'Alignement',
              default: 'center',
              layout: { if: 'parent.data?.position !== "none"' },
              oneOf: [
                { const: 'left', title: 'Gauche' },
                { const: 'center', title: 'Centré' },
                { const: 'right', title: 'Droite' }
              ]
            }
          }
        },
        // TODO: add static filters ?
        advancedFilters: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: '#/$defs/element'
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-datasets-list': {
      type: 'object',
      title: 'DatasetsListElement',
      'x-i18n-title': {
        en: 'Datasets list',
        fr: 'Liste de jeux de données'
      },
      layout: {
        children: [
          'type',
          'mode',
          {
            if: 'data?.mode !== "custom"',
            children: ['limit']
          },
          {
            if: 'data?.mode === "custom"',
            children: ['datasets']
          },
          'columns',
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
        mode: {
          type: 'string',
          title: 'Type de liste',
          default: 'lastUpdated',
          oneOf: [
            { const: 'lastUpdated', title: 'Last updated', 'x-i18n-title': { fr: 'Les derniers modifiés' } },
            { const: 'lastCreated', title: 'Last created', 'x-i18n-title': { fr: 'Les derniers créés' } },
            { const: 'custom', title: 'Custom list', 'x-i18n-title': { fr: 'Liste libre' } }
          ]
        },
        limit: {
          type: 'integer',
          title: 'Nombre de jeux de données',
          default: 3,
          minimum: 1,
          maximum: 12
        },
        datasets: {
          type: 'array',
          title: 'Liste de jeux de données',
          description: 'Sélectionnez manuellement les jeux de données à afficher.',
          items: {
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
              title: { type: 'string' }
            }
          },
          maxItems: 100
        },
        columns: {
          type: 'integer',
          title: 'Nombre de colonnes',
          description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
          default: 3,
          minimum: 1,
          maximum: 3
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Utiliser la configuration du portail',
          layout: 'switch',
          default: true
        },
        cardConfig: {
          $ref: 'https://github.com/data-fair/portals/portal-config-dataset-card',
          layout: { title: null }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-dataset-card': {
      type: 'object',
      title: 'DatasetCardElement',
      'x-i18n-title': {
        en: 'Dataset card',
        fr: "Vignette d'un jeu de données"
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
            id: { type: 'string' },
            title: { type: 'string' }
          }
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Utiliser la configuration du portail',
          layout: 'switch',
          default: true
        },
        cardConfig: {
          $ref: 'https://github.com/data-fair/portals/portal-config-dataset-card',
          layout: { title: null }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-dataset-table': {
      type: 'object',
      title: 'Dataset table',
      'x-i18n-title': {
        fr: "Tableau d'un jeu de données"
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
          title: "Synchroniser les paramètres d'URL",
          description: 'Si activé, les paramètres de la page seront transmis au tableau. Utile pour partager la page avec une vue spécifique du tableau.',
          default: true
        },
        display: {
          type: 'string',
          title: "Mode d'affichage par défaut",
          description: "L'utilisateur final peut modifier le mode d'affichage sauf si les interactions sont désactivées.",
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
          description: "Si aucune colonne n'est sélectionnée, toutes les colonnes seront affichées par défaut. L'utilisateur final peut modifier les colonnes visibles sauf si les interactions sont désactivées.",
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
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-dataset-form': {
      type: 'object',
      title: 'Dataset form',
      'x-i18n-title': {
        fr: "Formulaire d'un jeu de données"
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
            id: { type: 'string' },
            title: { type: 'string' }
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },

    // Applications
    'element-applications-catalog': {
      title: 'ApplicationsCatalogElement',
      'x-i18n-title': {
        en: 'Applications catalog',
        fr: 'Catalogue de visualisations'
      },
      type: 'object',
      unevaluatedProperties: false,
      required: ['type'],
      properties: {
        type: { const: 'applications-catalog' },
        defaultSort: {
          type: 'string',
          title: 'Tri par défaut',
          description: "Ce tri sera appliqué par défaut lorsque l'utilisateur arrive sur la page. Lorsqu'il commence une recherche, le tri par pertinence sera appliqué.",
          default: 'createdAt:-1',
          oneOf: [
            { const: 'createdAt:-1', title: 'Date de création (du plus récent au plus ancien)' },
            { const: 'updatedAt:-1', title: 'Date de mise à jour (du plus récent au plus ancien)' },
            { const: 'title:1', title: 'Ordre alphabétique (A à Z)' }
          ]
        },
        columns: {
          type: 'integer',
          title: 'Nombre de colonnes',
          description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
          default: 2,
          minimum: 1,
          maximum: 3
        },
        applicationsCountPosition: {
          type: 'string',
          title: 'Position du nombre de résultats',
          default: 'top',
          oneOf: [
            { const: 'none', title: 'Aucun' },
            { const: 'top', title: 'Au dessus des filtres' }, // Used for compat with old portals
            { const: 'bottom', title: 'Au dessus des résultats' }
          ]
        },
        showSortBesideCount: {
          type: 'boolean',
          title: 'Afficher le tri à droite du nombre de résultats.',
          layout: {
            if: 'parent.data?.applicationsCountPosition === "bottom"',
            comp: 'switch'
          }
        },
        showAdvancedFilters: {
          type: 'boolean',
          title: 'Activer les filtres avancés',
          description: 'Mode de configuration avancé. Permet de configurer des blocs de pages personnalisés entre les filtres de base et les résultats.',
          layout: { comp: 'switch' }
        },
        filters: {
          type: 'object',
          title: 'Configuration des filtres',
          layout: 'card',
          properties: {
            position: {
              type: 'string',
              title: 'Position des filtres',
              default: 'top',
              oneOf: [
                { const: 'top', title: 'Au dessus des résultats' },
                { const: 'left', title: 'À gauche des résultats' }
              ]
            },
            items: {
              type: 'array',
              title: 'Filtres à afficher',
              description: 'Mode simplifié pour choisir les filtres à afficher sur la page. Vous pouvez aussi utiliser des blocs fonctionnels pour plus de personnalisation des filtres.',
              items: {
                type: 'string',
                oneOf: [
                  { const: 'search', title: 'Barre de recherche' },
                  { const: 'base-application', title: 'Filtres par applications' },
                  { const: 'topics', title: 'Filtres par thématiques' },
                  { const: 'owners', title: 'Filtres par propriétaires' },
                  { const: 'sort', title: 'Tri' }
                ]
              }
            },
            density: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density'
            },
            rounded: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded'
            },
          }
        },
        pagination: {
          type: 'object',
          title: 'Configuration de la pagination',
          layout: 'card',
          properties: {
            position: {
              type: 'string',
              title: 'Position',
              description: 'Désactiver la pagination affichera les résultats en scroll infini.',
              default: 'none',
              oneOf: [
                { const: 'none', title: 'Scroll infini' },
                { const: 'before', title: 'Avant les résultats' },
                { const: 'after', title: 'Après les résultats' },
                { const: 'both', title: 'Les deux' }
              ]
            },
            alignment: {
              type: 'string',
              title: 'Alignement',
              default: 'center',
              layout: { if: 'parent.data?.position !== "none"' },
              oneOf: [
                { const: 'left', title: 'Gauche' },
                { const: 'center', title: 'Centré' },
                { const: 'right', title: 'Droite' }
              ]
            }
          }
        },
        // TODO: add static filters ?
        advancedFilters: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: '#/$defs/element'
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-applications-list': {
      type: 'object',
      title: 'ApplicationsListElement',
      'x-i18n-title': {
        en: 'Applications list',
        fr: 'Liste de visualisations'
      },
      layout: {
        children: [
          'type',
          'mode',
          {
            if: 'data?.mode !== "custom"',
            children: ['limit']
          },
          {
            if: 'data?.mode === "custom"',
            children: ['applications']
          },
          'columns',
          'limit',
          'mb',
          {
            title: 'Application Card',
            'x-i18n-title': {
              fr: "Vignette d'une visualisation"
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
        mode: {
          type: 'string',
          title: 'Type de liste',
          default: 'lastUpdated',
          oneOf: [
            { const: 'lastUpdated', title: 'Last updated', 'x-i18n-title': { fr: 'Les derniers modifiés' } },
            { const: 'lastCreated', title: 'Last created', 'x-i18n-title': { fr: 'Les derniers créés' } },
            { const: 'custom', title: 'Custom list', 'x-i18n-title': { fr: 'Liste libre' } }
          ]
        },
        applications: {
          type: 'array',
          title: 'Liste de visualisations',
          description: 'Sélectionnez manuellement les visualisations à afficher.',
          items: {
            type: 'object',
            title: 'Visualisation',
            additionalProperties: false,
            required: ['id'],
            layout: {
              getItems: {
                url: '/data-fair/api/v1/applications?mine=true&raw=true&select=id,title',
                qSearchParam: 'q',
                itemsResults: 'data.results',
                itemTitle: '`${item.title} (${item.id})`',
                itemKey: 'item.id'
              }
            },
            properties: {
              id: { type: 'string' },
              title: { type: 'string' }
            }
          },
          maxItems: 100
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
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-application': {
      type: 'object',
      title: 'ApplicationElement',
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
          title: "Synchroniser les paramètres d'URL",
          description: "Si activé, les paramètres de la page seront transmis à l'application. Utile pour partager la page avec une vue spécifique de l'application.",
          default: true
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    }
  }
}
