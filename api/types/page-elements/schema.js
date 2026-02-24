/* eslint-disable no-template-curly-in-string */
import { linkItemTitle } from '../portal-config-links/schema.js'

const mdiShapeOutlineIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>shape-outline</title><path d="M11,13.5V21.5H3V13.5H11M9,15.5H5V19.5H9V15.5M12,2L17.5,11H6.5L12,2M12,5.86L10.08,9H13.92L12,5.86M17.5,13C20,13 22,15 22,17.5C22,20 20,22 17.5,22C15,22 13,20 13,17.5C13,15 15,13 17.5,13M17.5,15A2.5,2.5 0 0,0 15,17.5A2.5,2.5 0 0,0 17.5,20A2.5,2.5 0 0,0 20,17.5A2.5,2.5 0 0,0 17.5,15Z" /></svg>'
const mdiViewGridOutline = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>view-grid-outline</title><path d="M3 11H11V3H3M5 5H9V9H5M13 21H21V13H13M15 15H19V19H15M3 21H11V13H3M5 15H9V19H5M13 3V11H21V3M19 9H15V5H19Z" /></svg>'
const mdiPuzzleOutline = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>puzzle-outline</title><path d="M22,13.5C22,15.26 20.7,16.72 19,16.96V20A2,2 0 0,1 17,22H13.2V21.7A2.7,2.7 0 0,0 10.5,19C9,19 7.8,20.21 7.8,21.7V22H4A2,2 0 0,1 2,20V16.2H2.3C3.79,16.2 5,15 5,13.5C5,12 3.79,10.8 2.3,10.8H2V7A2,2 0 0,1 4,5H7.04C7.28,3.3 8.74,2 10.5,2C12.26,2 13.72,3.3 13.96,5H17A2,2 0 0,1 19,7V10.04C20.7,10.28 22,11.74 22,13.5M17,15H18.5A1.5,1.5 0 0,0 20,13.5A1.5,1.5 0 0,0 18.5,12H17V7H12V5.5A1.5,1.5 0 0,0 10.5,4A1.5,1.5 0 0,0 9,5.5V7H4V9.12C5.76,9.8 7,11.5 7,13.5C7,15.5 5.75,17.2 4,17.88V20H6.12C6.8,18.25 8.5,17 10.5,17C12.5,17 14.2,18.25 14.88,20H17V15Z" /></svg>'
const mdiDatabaseOutline = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>database-outline</title><path d="M12 3C7.58 3 4 4.79 4 7V17C4 19.21 7.59 21 12 21S20 19.21 20 17V7C20 4.79 16.42 3 12 3M18 17C18 17.5 15.87 19 12 19S6 17.5 6 17V14.77C7.61 15.55 9.72 16 12 16S16.39 15.55 18 14.77V17M18 12.45C16.7 13.4 14.42 14 12 14C9.58 14 7.3 13.4 6 12.45V9.64C7.47 10.47 9.61 11 12 11C14.39 11 16.53 10.47 18 9.64V12.45M12 9C8.13 9 6 7.5 6 7S8.13 5 12 5C15.87 5 18 6.5 18 7S15.87 9 12 9Z" /></svg>'
const mdiImageMultiple = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>image-multiple</title><path d="M22,16V4A2,2 0 0,0 20,2H8A2,2 0 0,0 6,4V16A2,2 0 0,0 8,18H20A2,2 0 0,0 22,16M11,12L13.03,14.71L16,11L20,16H8M2,6V20A2,2 0 0,0 4,22H18V20H4V6" /></svg>'
const mdiPageNext = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>page-next</title><path d="M20,3H5A2,2 0 0,0 3,5V11H7V9L11,12L7,15V13H3V19A2,2 0 0,0 5,21H20A2,2 0 0,0 22,19V5A2,2 0 0,0 20,3M17,17H13V15H17V17M20,13H13V11H20V13M20,9H13V7H20V9M3,13H0V11H3V13Z" /></svg>'
const mdiNavigationVariant = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>navigation-variant</title><path d="M21 3L3 10.53V11.5L9.84 14.16L12.5 21H13.46L21 3Z" /></svg>'

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
          { key: 4, title: 'IFrame', 'x-i18n-title': { fr: 'IFrame' } },

          {
            header: true,
            title: 'Navigation elements',
            'x-i18n-title': {
              fr: 'Éléments de navigation'
            },
            icon: mdiNavigationVariant
          },
          { key: 5, title: 'Navigation button', 'x-i18n-title': { fr: 'Bouton de navigation' } },
          { key: 6, title: 'Navigation menu', 'x-i18n-title': { fr: 'Menu de navigation' } },
          { key: 7, title: 'Breadcrumbs', 'x-i18n-title': { fr: 'Fil d\'Ariane' } },

          {
            header: true,
            title: 'Layout & structure',
            'x-i18n-title': {
              fr: 'Mise en page & structure'
            },
            icon: mdiViewGridOutline
          },
          { key: 8, title: 'Divider', 'x-i18n-title': { fr: 'Séparateur horizontal' } },
          { key: 9, title: 'Colored background section', 'x-i18n-title': { fr: 'Section sur fond coloré' } },
          { key: 10, title: 'Card', 'x-i18n-title': { fr: 'Boite' } },
          { key: 11, title: 'Two columns', 'x-i18n-title': { fr: 'Deux colonnes' } },
          { key: 12, title: 'Responsive Grid', 'x-i18n-title': { fr: 'Grille responsive' } },
          { key: 13, title: 'Tabs', 'x-i18n-title': { fr: 'Onglets' } },
          { key: 14, title: 'Expansion panels', 'x-i18n-title': { fr: 'Accordéons' } },

          {
            header: true,
            title: 'Functional blocks',
            'x-i18n-title': {
              fr: 'Blocs fonctionnels'
            },
            icon: mdiPuzzleOutline
          },
          { key: 15, title: 'Search', 'x-i18n-title': { fr: 'Barre de recherche' } },
          { key: 16, title: 'Topics list', 'x-i18n-title': { fr: 'Liste de thématiques' } },
          // { key: 17, title: 'Key metrics', 'x-i18n-title': { fr: 'Chiffres clés' } }, // Deprecated
          { key: 18, title: 'Contact form', 'x-i18n-title': { fr: 'Formulaire de contact' } },

          {
            header: true,
            title: 'Datasets',
            'x-i18n-title': {
              fr: 'Jeux de données'
            },
            icon: mdiDatabaseOutline
          },
          { key: 19, title: 'Datasets catalog', 'x-i18n-title': { fr: 'Catalogue de données' } },
          { key: 20, title: 'Datasets list', 'x-i18n-title': { fr: 'Liste de jeux de données' } },
          { key: 21, title: 'Dataset card', 'x-i18n-title': { fr: "Vignette d'un jeu de données" } },
          { key: 22, title: 'Dataset table', 'x-i18n-title': { fr: "Tableau d'un jeu de données" } },
          { key: 23, title: 'Dataset form', 'x-i18n-title': { fr: "Formulaire d'un jeu de données" } },

          {
            header: true,
            title: 'Applications',
            'x-i18n-title': {
              fr: 'Visualisations'
            },
            icon: mdiImageMultiple
          },
          { key: 24, title: 'Applications catalog', 'x-i18n-title': { fr: 'Catalogue de visualisations' } },
          { key: 25, title: 'Applications list', 'x-i18n-title': { fr: 'Liste de visualisations' } },
          { key: 26, title: 'Application', 'x-i18n-title': { fr: 'Visualisation' } },

          {
            header: true,
            title: 'Reuses',
            'x-i18n-title': {
              fr: 'Réutilisations'
            },
            icon: mdiPageNext
          },
          { key: 27, title: 'Reuses catalog', 'x-i18n-title': { fr: 'Catalogue de réutilisations' } },
          { key: 28, title: 'Reuses list', 'x-i18n-title': { fr: 'Liste de réutilisations' } },
          { key: 29, title: 'Reuse card', 'x-i18n-title': { fr: 'Vignette de réutilisation' } }
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
        { $ref: '#/$defs/element-iframe' },

        // Navigation elements
        { $ref: '#/$defs/element-button' },
        { $ref: '#/$defs/element-menu' },
        { $ref: '#/$defs/element-breadcrumbs' },

        // Layout & structure
        { $ref: '#/$defs/element-divider' },
        { $ref: '#/$defs/element-banner' },
        { $ref: '#/$defs/element-card' },
        { $ref: '#/$defs/element-two-columns' },
        { $ref: '#/$defs/element-responsive-grid' },
        { $ref: '#/$defs/element-tabs' },
        { $ref: '#/$defs/element-expansion-panels' },

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
        { $ref: '#/$defs/element-application' },

        // Reuses
        { $ref: '#/$defs/element-reuses-catalog' },
        { $ref: '#/$defs/element-reuses-list' },
        { $ref: '#/$defs/element-reuse-card' }
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
            { const: 'h1', title: 'Titre principal' },
            { const: 'h2', title: 'Très grand' },
            { const: 'h3', title: 'Grand' },
            { const: 'h4', title: 'Moyen' },
            { const: 'h5', title: 'Petit' },
            { const: 'h6', title: 'Très petit' }
          ],
          default: 'h3',
          layout: { cols: { xs: 8 } },
        },
        titleTag: {
          title: 'Heading tag',
          'x-i18n-title': {
            fr: 'Balise'
          },
          type: 'string',
          oneOf: [
            { const: 'h1', title: 'H1' },
            { const: 'h2', title: 'H2' },
            { const: 'h3', title: 'H3' },
            { const: 'h4', title: 'H4' },
            { const: 'h5', title: 'H5' },
            { const: 'h6', title: 'H6' },
            { const: 'div', title: 'Div' }
          ],
          layout: { cols: { xs: 4 } },
        },
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color' },
        centered: {
          type: 'boolean',
          title: 'Center the title',
          'x-i18n-title': { fr: 'Centrer le titre' },
          layout: { cols: { xs: 6 } }
        },
        bold: {
          type: 'boolean',
          title: 'Bold text',
          'x-i18n-title': { fr: 'Texte en gras' },
          layout: { cols: { xs: 6 } },
        },
        link: {
          $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/simpleLinkItem',
          title: 'Configuration du lien',
          layout: { comp: 'card' }
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
            position: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/linePosition' },
            color: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color',
              title: 'Line color',
              'x-i18n-title': { fr: 'Couleur du trait' },
              layout: {
                slots: {
                  item: { name: 'color-select-item' },
                  selection: { name: 'color-select-selection' }
                },
                props: { background: true }
              }
            }
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
        _html: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rendered-html' }
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
            { const: 'none', title: 'Aucun' },
            { const: 'info', title: 'Information' },
            { const: 'success', title: 'Succès' },
            { const: 'error', title: 'Erreur' },
            { const: 'warning', title: 'Avertissement' }
          ]
        },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
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
        _html: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rendered-html' }
      }
    },
    'element-image': {
      type: 'object',
      title: 'ImageElement',
      'x-i18n-title': {
        en: 'Image',
        fr: 'Image'
      },
      required: ['type'],
      properties: {
        type: { const: 'image' },
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
        banner: {
          type: 'boolean',
          title: 'Pleine largeur',
          layout: 'switch'
        },
        isPresentation: {
          type: 'boolean',
          title: 'Image de présentation (décorative)',
          description: "Les images de présentations ne sont pas affichés pour les lecteurs d'écrans pour l'accessibilité. Dans ce cas, l'image ne peut pas porter de liens.",
          layout: 'switch'
        },
        cover: {
          type: 'boolean',
          title: "Recadrer l'image pour remplir l'espace",
          layout: {
            if: '!parent.data?.banner',
            comp: 'switch'
          }
        },
        title: {
          type: 'string',
          title: "Titre de l'image (Accessibilité)",
          description: "Nécessaire pour l'accessibilité si l'image n'est pas décorative.",
          layout: { if: '!parent.data?.isPresentation' }
        },
        legend: {
          type: 'string',
          title: "Légende de l'image",
          description: "Légende affichée en italique en dessous de l'image",
          layout: { if: '!parent.data?.isPresentation' }
        },
        zoomable: {
          type: 'boolean',
          title: 'Zoom au clic',
          layout: { if: '!parent.data?.banner && !parent.data?.href' }
        },
        link: {
          $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/simpleLinkItem',
          title: "Lien au clic sur l'image",
          layout: {
            if: '!parent.data?.isPresentation',
            comp: 'card'
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
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
              before: "**Important** : Pour que l'intégration IFrame fonctionne correctement, vous devez ajouter le nom de domaine de l'URL dans la **Configuration du portail** → **Paramètres généraux** → **Sécurité**."
            }
          }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },

    // Navigation elements
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
              },
              'centered'
            ]
          },
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
          layout: 'switch',
          default: true
        },
        config: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/buttonConfig' },
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
              },
              'centered'
            ]
          },
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
            itemTitle: linkItemTitle,
            messages: { addItem: 'Ajouter un lien' }
          }
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Utiliser la configuration du portail',
          layout: 'switch',
          default: true
        },
        config: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/buttonConfig' },
        centered: {
          type: 'boolean',
          title: 'Centré',
          default: true
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-breadcrumbs': {
      type: 'object',
      title: 'BreadcrumbsElement',
      'x-i18n-title': {
        en: 'Breadcrumbs',
        fr: 'Fil d\'Ariane'
      },
      required: ['type'],
      properties: {
        type: { const: 'breadcrumbs' },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },

    // Layout & structure elements
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
        link: {
          $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/simpleLinkItem',
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
          items: { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/linkItem' }
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
            $ref: '#/$defs/element'
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
        //   description: 'Si activé, les titres des panneaux actifs s’agrandissent.'
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
        color: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color',
          layout: {
            props: { background: true },
            slots: {
              item: { name: 'color-select-item' },
              selection: { name: 'color-select-selection' }
            }
          }
        },
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
        redirectPage: {
          type: 'boolean',
          title: 'Rediriger vers la page de jeux de données',
          description: "Si activé, la recherche redirigera vers la page des jeux de données Sinon, la recherche s'appliquera sur la page actuelle.",
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
        fr: 'Liste de thématiques'
      },
      required: ['type'],
      properties: {
        type: { const: 'topics' },
        mode: {
          type: 'string',
          title: 'Source des thématiques',
          default: 'datasets',
          oneOf: [
            { const: 'datasets', title: 'Jeux de données' },
            { const: 'applications', title: 'Visualisations' }
          ]
        },
        redirectPage: {
          type: 'boolean',
          title: 'Rediriger vers la page',
          description: 'Si activé, cliquer sur une thématique redirigera vers la page sélectionnée (Jeux de données ou Visualisations) avec le filtre de thématique. Sinon, les thématiques agiront en tant que filtres sur la page actuelle.',
          layout: 'switch'
        },
        centered: {
          type: 'boolean',
          title: 'Centrer les thématiques'
        },
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics' },
        elevation: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation' },
        density: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density' },
        rounded: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded' },
        showIcon: {
          type: 'boolean',
          title: "Afficher l'icône",
          layout: 'switch',
          default: true
        },
        iconColor: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics',
          title: "Couleur de l'icône",
          layout: { if: 'parent.data?.showIcon === true' }
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
      layout: [
        'type',
        'defaultFields', 'additionalFields', 'subjectTemplate', 'bodyTemplate',
        {
          title: 'Appearance',
          'x-i18n-title': { fr: 'Apparence' },
          comp: 'card',
          children: ['elevation', 'rounded', 'showInfo', 'showSocial', 'mb']
        },
        'sendButton'
      ],
      properties: {
        type: {
          const: 'contact'
        },
        defaultFields: {
          type: 'object',
          title: 'Default fields',
          'x-i18n-title': {
            fr: 'Champs par défaut'
          },
          layout: {
            comp: 'card',
            children: [
              { children: ['enableSubject', 'requiredSubject'] },
              { children: ['enableMessage', 'requiredMessage', 'messageMinLength', 'messageMaxLength'] }
            ]
          },
          properties: {
            enableSubject: {
              type: 'boolean',
              title: 'Afficher le champ sujet',
              layout: {
                comp: 'switch',
                cols: { xs: 6 }
              },
              default: true
            },
            requiredSubject: {
              type: 'boolean',
              title: 'Sujet obligatoire',
              layout: {
                if: 'parent.data?.enableSubject',
                comp: 'switch',
                cols: { xs: 6 }
              },
              default: true
            },
            enableMessage: {
              type: 'boolean',
              title: 'Afficher le champ message',
              layout: {
                comp: 'switch',
                cols: { xs: 6 }
              },
              default: true
            },
            requiredMessage: {
              type: 'boolean',
              title: 'Message obligatoire',
              layout: {
                if: 'parent.data?.enableMessage',
                comp: 'switch',
                cols: { xs: 6 }
              },
              default: true
            },
            messageMinLength: {
              type: 'integer',
              title: 'Min. caractères',
              description: 'Longueur minimale du message. Utilisez -1 pour désactiver la limite.',
              minimum: -1,
              default: 50,
              layout: {
                if: 'parent.data?.enableMessage',
                cols: { xs: 6 }
              }
            },
            messageMaxLength: {
              type: 'integer',
              title: 'Max. caractères',
              description: 'Longueur maximale du message. Utilisez -1 pour désactiver la limite.',
              minimum: -1,
              default: 2000,
              layout: {
                if: 'parent.data?.enableMessage',
                cols: { xs: 6 }
              }
            }
          }
        },
        additionalFields: {
          type: 'array',
          title: 'Champs additionnels',
          description: 'Ajoutez des champs supplémentaires au formulaire de contact. Ils seront positionnés entre le champ email et le champ sujet',
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
                  key: {
                    type: 'string',
                    title: 'Clé dans le template',
                    description: 'Identifiant utilisé dans les templates (ex: department_name).',
                    pattern: '^[a-z]+(?:_[a-z]+)*$',
                    errorMessage: 'Utilisez uniquement des minuscules séparés par des _'
                  },
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
                  key: {
                    type: 'string',
                    title: 'Clé dans le template',
                    description: 'Identifiant utilisé dans les templates (ex: department_name).',
                    pattern: '^[a-z]+(?:_[a-z]+)*$',
                    errorMessage: 'Utilisez uniquement des minuscules séparés par des _'
                  },
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
                    description: "Si activé, les valeurs seront séparées par des virgules dans l'email",
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
                  key: {
                    type: 'string',
                    title: 'Clé dans le template',
                    description: 'Identifiant utilisé dans les templates (ex: department_name).',
                    pattern: '^[a-z]+(?:_[a-z]+)*$',
                    errorMessage: 'Utilisez uniquement des minuscules séparés par des _'
                  },
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
                  key: {
                    type: 'string',
                    title: 'Clé dans le template',
                    description: 'Identifiant utilisé dans les templates (ex: department_name).',
                    pattern: '^[a-z]+(?:_[a-z]+)*$',
                    errorMessage: 'Utilisez uniquement des minuscules séparés par des _'
                  },
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
        subjectTemplate: {
          type: 'string',
          title: "Format de l'objet de l'email",
          description: "Personnalisez le format de l'objet des emails reçus. Vous pouvez insérer les valeurs saisies par l'utilisateur en utilisant des balises entre accolades :\n* **{subject}** : Le texte saisi dans le champ \"Sujet\" par défaut.\n* **{message}** : Le texte saisi dans le champ \"Message\" par défaut.\n* **{from}** : L'adresse email de l'expéditeur.\n* **{portalName}** : Le nom du portail.\n* **{portalDomain}** : Le domaine du portail.\n* **{votre_cle}** : Pour les champs additionnels, utilisez la **Clé dans le template** que vous avez définie (ex: si la clé est *departement*, utilisez **{departement}**).\n\nLaissez vide pour utiliser le format par défaut : **{subject}**",
          layout: {
            comp: 'textarea',
            props: {
              autoGrow: true,
              rows: 2
            }
          }
        },
        bodyTemplate: {
          type: 'string',
          title: "Format du corps de l'email",
          description: "Personnalisez le format du corps des emails reçus. Le contenu est interprété en **Markdown** et sera rendu en HTML dans l'email. Vous pouvez insérer les valeurs saisies par l'utilisateur en utilisant des balises entre accolades :\n* **{subject}** : Le texte saisi dans le champ \"Sujet\" par défaut.\n* **{message}** : Le texte saisi dans le champ \"Message\" par défaut.\n* **{from}** : L'adresse email de l'expéditeur.\n* **{portalName}** : Le nom du portail.\n* **{portalDomain}** : Le domaine du portail.\n* **{votre_cle}** : Pour les champs additionnels, utilisez la **Clé dans le template** que vous avez définie (ex: si la clé est *departement*, utilisez **{departement}**).\n\nLaissez vide pour utiliser le format par défaut.",
          layout: 'markdown',
        },
        bodyTemplate_html: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rendered-html' },
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
        sendButton: {
          title: "Configuration du bouton d'envoi",
          layout: { comp: 'card' },
          properties: {
            usePortalConfig: {
              type: 'boolean',
              title: 'Utiliser la configuration du portail',
              layout: 'switch',
              default: true
            },
            config: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/buttonConfig',
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
            { const: 'title:1', title: 'Ordre alphabétique (A à Z)' },
            { const: 'owner.departmentName:1', title: 'Propriétaire' }
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
          layout: 'switch',
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
          layout: 'switch'
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
          title: 'Jeux de données',
          description: 'Sélectionnez manuellement les jeux de données à afficher.',
          layout: {
            getItems: {
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&select=id,title&size=20',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.id})`',
              itemKey: 'item.id'
            },
            props: {
              chips: true,
              closableChips: true,
              clearable: false
            }
          },
          items: {
            type: 'object',
            required: ['id'],
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
          $ref: 'https://github.com/data-fair/portals/portal-config-dataset-card'
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
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&select=id,title&size=20',
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
          $ref: 'https://github.com/data-fair/portals/portal-config-dataset-card'
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
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&select=id,title&size=20',
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
          description: 'Si activé, les paramètres de la page seront transmis au tableau. Utile pour partager la page avec une vue spécifique du tableau.'
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
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&rest=true&status=finalized&select=id,title&size=20',
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
          layout: 'switch'
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
          title: 'Visualisations',
          description: 'Sélectionnez manuellement les visualisations à afficher.',
          layout: {
            getItems: {
              url: '/data-fair/api/v1/applications?mine=true&raw=true&select=id,title&size=20',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.id})`',
              itemKey: 'item.id'
            },
            props: {
              chips: true,
              closableChips: true,
              clearable: false
            }
          },
          items: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string' },
              title: { type: 'string' }
            }
          },
          maxItems: 20
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
              url: '/data-fair/api/v1/applications?mine=true&select=id,title,slug&size=20',
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
          description: "Si activé, les paramètres de la page seront transmis à l'application. Utile pour partager la page avec une vue spécifique de l'application."
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },

    // Reuses
    'element-reuses-catalog': {
      title: 'ReusesCatalogElement',
      'x-i18n-title': {
        en: 'Reuses catalog',
        fr: 'Catalogue de réutilisations'
      },
      type: 'object',
      unevaluatedProperties: false,
      required: ['type'],
      properties: {
        type: { const: 'reuses-catalog' },
        defaultSort: {
          type: 'string',
          title: 'Tri par défaut',
          description: "Ce tri sera appliqué par défaut lorsque l'utilisateur arrive sur la page.",
          default: 'updatedAt:-1',
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
        reusesCountPosition: {
          type: 'string',
          title: 'Position du nombre de résultats',
          default: 'top',
          oneOf: [
            { const: 'none', title: 'Aucun' },
            { const: 'top', title: 'Au dessus des filtres' },
            { const: 'bottom', title: 'Au dessus des résultats' }
          ]
        },
        showSortBesideCount: {
          type: 'boolean',
          title: 'Afficher le tri à droite du nombre de résultats.',
          layout: {
            if: 'parent.data?.reusesCountPosition === "bottom"',
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
                  { const: 'sort', title: 'Tri' }
                ]
              }
            },
            density: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density'
            },
            rounded: {
              $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded'
            }
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
    'element-reuses-list': {
      type: 'object',
      title: 'ReusesListElement',
      'x-i18n-title': {
        en: 'Reuses list',
        fr: 'Liste de réutilisations'
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
            children: ['reuses']
          },
          'columns',
          'mb',
          {
            title: 'Reuse Card',
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
      required: ['type', 'columns', 'limit'],
      properties: {
        type: {
          const: 'reuses-list'
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
        reuses: {
          type: 'array',
          title: 'Réutilisations',
          description: 'Sélectionnez manuellement les réutilisations à afficher.',
          layout: {
            getItems: {
              url: '/portals-manager/api/reuses?select=slug,title&size=20',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.slug})`',
              itemKey: 'item.slug'
            },
            props: {
              chips: true,
              closableChips: true,
              clearable: false
            }
          },
          items: {
            type: 'object',
            required: ['slug'],
            properties: {
              slug: { type: 'string' },
              title: { type: 'string' }
            }
          },
          maxItems: 100
        },
        columns: {
          type: 'integer',
          title: 'Nombre de colonnes',
          description: 'Nombre de colonnes utilisées sur les écrans larges. Le nombre de colonnes sera réduit sur les écrans plus petits.',
          default: 2,
          minimum: 1,
          maximum: 3
        },
        limit: {
          type: 'integer',
          title: 'Nombre de réutilisations',
          description: 'Nombre total de réutilisations à afficher.',
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
        cardConfig: { $ref: 'https://github.com/data-fair/portals/portal-config-reuse-card' },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-reuse-card': {
      type: 'object',
      title: 'ReuseCardElement',
      'x-i18n-title': {
        en: 'Reuse card',
        fr: 'Vignette de réutilisation'
      },
      layout: {
        children: [
          'type',
          'reuse',
          'mb',
          {
            title: 'Reuse Card',
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
      required: ['type', 'reuse', 'usePortalConfig'],
      properties: {
        type: {
          const: 'reuse-card'
        },
        reuse: {
          type: 'object',
          title: 'Réutilisation',
          additionalProperties: false,
          required: ['slug'],
          layout: {
            getItems: {
              url: '/portals-manager/api/reuses?select=slug,title&size=20',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: '`${item.title} (${item.slug})`',
              itemKey: 'item.slug'
            }
          },
          properties: {
            slug: { type: 'string' },
            title: { type: 'string' }
          }
        },
        usePortalConfig: {
          type: 'boolean',
          title: 'Utiliser la configuration du portail',
          layout: 'switch',
          default: true
        },
        cardConfig: { $ref: 'https://github.com/data-fair/portals/portal-config-reuse-card' },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    }
  }
}
