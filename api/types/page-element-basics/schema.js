export default {
  $id: 'https://github.com/data-fair/portals/page-element-basics',
  'x-exports': [],
  $defs: {
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
        uuid: { type: 'string', layout: 'none' },
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
            },
            growOnHover: {
              type: 'boolean',
              title: 'Grow on hover',
              'x-i18n-title': { fr: 'Grandit au survol' },
              description: 'Only applies when the title has a link.',
              'x-i18n-description': { fr: "S'applique uniquement lorsque le titre porte un lien." },
              layout: { if: "parent.parent?.data?.link && parent.parent?.data?.link?.type !== 'none' && ['none', 'bottom-small'].includes(parent.data?.position)" }
            }
          }
        },
        link: {
          $ref: 'https://github.com/data-fair/portals/common-links#/$defs/simpleLinkItem',
          title: 'Configuration du lien',
          layout: { comp: 'card' }
        },
        anchor: {
          type: 'object',
          title: 'Anchor & table of contents',
          'x-i18n-title': { fr: 'Ancre & Sommaire' },
          layout: {
            comp: 'card',
            children: [
              'enabled',
              { if: 'data?.enabled', children: ['inToc'] },
              { if: 'data?.enabled && data?.inToc', children: ['label'] }
            ]
          },
          properties: {
            enabled: {
              type: 'boolean',
              title: 'Enable anchor',
              'x-i18n-title': { fr: "Activer l'ancre" },
              description: 'Lets visitors copy a direct link to this title.',
              'x-i18n-description': { fr: 'Permet de copier un lien direct vers le titre.' },
              layout: 'switch'
            },
            inToc: {
              type: 'boolean',
              title: 'Show in the table of contents',
              'x-i18n-title': { fr: 'Afficher dans le sommaire' },
              default: true,
              layout: 'switch'
            },
            label: {
              type: 'string',
              title: 'Table of contents label',
              'x-i18n-title': { fr: 'Libellé du sommaire' },
              description: 'Optional shorter label shown in the table of contents instead of the title content.',
              'x-i18n-description': { fr: 'Libellé plus court, optionnel, affiché dans le sommaire à la place du contenu du titre.' }
            },
            _slug: {
              type: 'string',
              readOnly: true,
              layout: 'none'
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
        type: { const: 'text' },
        uuid: { type: 'string', layout: 'none' },
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
        en: 'Accented text / Alert',
        fr: 'Texte accentué / Alerte'
      },
      required: ['type', 'alertType'],
      layout: {
        switch: [
          {
            if: 'data?.alertType === "none"',
            children: [
              'type', 'alertType', 'icon', 'color', 'variant', 'title', 'content', 'closable', 'mb'
            ]
          },
          ['type', 'alertType', 'variant', 'title', 'content', 'closable', 'mb']
        ]
      },
      properties: {
        type: { const: 'alert' },
        uuid: { type: 'string', layout: 'none' },
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
        variant: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/variant',
          default: 'default'
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
        closable: {
          type: 'boolean',
          title: 'Show a dismiss button',
          'x-i18n-title': {
            fr: 'Afficher un bouton de fermeture'
          },
          description: 'Visitors can dismiss the alert; the dismissal is saved in their browser so it is not shown to them again.',
          'x-i18n-description': {
            fr: "Les visiteurs peuvent fermer l'alerte; la fermeture est enregistrée dans leur navigateur pour ne pas la réafficher ensuite."
          },
          default: false
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
      layout: {
        children: [
          'type',
          {
            comp: 'card',
            title: 'Image source',
            'x-i18n-title': { fr: "Source de l'image" },
            children: [
              'banner',
              'url',
              { if: '!data?.banner && !data?.url', children: ['image'] },
              { if: 'data?.banner && !data?.url', children: ['wideImage'] }
            ]
          },
          {
            comp: 'card',
            title: 'Appearance',
            'x-i18n-title': { fr: 'Apparence' },
            children: [
              { if: '!data?.banner', children: ['cover'] },
              { if: '!data?.banner && !data?.cover', children: ['alignment'] },
              'height'
            ]
          },
          {
            comp: 'card',
            title: 'Text & accessibility',
            'x-i18n-title': { fr: 'Texte & accessibilité' },
            children: [
              'isPresentation',
              { if: '!data?.isPresentation', children: ['title', 'legend'] },
              { if: '!data?.isPresentation && !data?.banner', children: ['zoomable'] },
              'fetchPriority'
            ]
          },
          {
            if: '!data?.isPresentation && !data?.zoomable',
            comp: 'card',
            title: 'Link on click',
            'x-i18n-title': { fr: "Lien au clic sur l'image" },
            children: ['link']
          },
          'mb'
        ]
      },
      properties: {
        type: { const: 'image' },
        uuid: { type: 'string', layout: 'none' },
        banner: {
          type: 'boolean',
          title: 'Full width',
          'x-i18n-title': { fr: 'Pleine largeur' },
          description: 'Display the image edge-to-edge across the page width, using the dedicated wide image upload.',
          'x-i18n-description': { fr: "Affiche l'image sur toute la largeur de la page, bord à bord, via l'upload d'image pleine largeur dédié." },
          layout: 'switch'
        },
        isPresentation: {
          type: 'boolean',
          title: 'Decorative image',
          'x-i18n-title': { fr: 'Image de présentation (décorative)' },
          description: 'Decorative images are hidden from screen readers for accessibility, and cannot carry a link.',
          'x-i18n-description': { fr: "Les images de présentation ne sont pas affichées pour les lecteurs d'écran (accessibilité). Dans ce cas, l'image ne peut pas porter de lien." },
          layout: 'switch'
        },
        url: {
          type: 'string',
          title: 'Image URL',
          'x-i18n-title': { fr: 'URL vers une image' },
          description: 'Use this to point to an image hosted on another web server. Leave empty to upload a file below.',
          'x-i18n-description': { fr: 'Utile pour pointer vers une image hébergée sur un autre serveur web. Laissez vide pour téléverser un fichier ci-dessous.' }
        },
        image: {
          type: 'object',
          required: ['_id', 'name', 'mimeType'],
          layout: {
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
        cover: {
          type: 'boolean',
          title: 'Crop to fill the space',
          'x-i18n-title': { fr: "Recadrer l'image pour remplir l'espace" },
          description: 'The image is cropped to cover the available space instead of fitting entirely inside it.',
          'x-i18n-description': { fr: "L'image est recadrée pour couvrir l'espace disponible au lieu de s'y inscrire entièrement." },
          layout: 'switch'
        },
        alignment: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/horizontal-alignment',
          description: 'Horizontal alignment when the image is narrower than the container (ignored for full-width or cropped images).',
          'x-i18n-description': { fr: "Alignement horizontal quand l'image est plus étroite que le conteneur (sans effet en pleine largeur ou recadrée)." }
        },
        height: {
          type: 'integer',
          title: 'Fixed height (px)',
          'x-i18n-title': { fr: 'Hauteur fixe (px)' },
          description: 'Force a fixed height in pixels. Leave empty to keep the natural ratio.',
          'x-i18n-description': { fr: 'Force une hauteur fixe en pixels. Laissez vide pour conserver le ratio naturel.' },
          minimum: 0
        },
        zoomable: {
          type: 'boolean',
          title: 'Zoom on click',
          'x-i18n-title': { fr: 'Zoom au clic' },
          description: 'Visitors can click the image to view it enlarged. Not available when the image has a link.',
          'x-i18n-description': { fr: "Les visiteurs peuvent cliquer sur l'image pour l'agrandir. Indisponible quand l'image porte un lien." },
          layout: 'switch'
        },
        title: {
          type: 'string',
          title: 'Alternative text (accessibility)',
          'x-i18n-title': { fr: 'Texte alternatif (accessibilité)' },
          description: 'Required for accessibility when the image is not decorative; describes the image for screen readers.',
          'x-i18n-description': { fr: "Nécessaire pour l'accessibilité si l'image n'est pas décorative ; décrit l'image pour les lecteurs d'écran." }
        },
        legend: {
          type: 'string',
          title: 'Caption',
          'x-i18n-title': { fr: "Légende de l'image" },
          description: 'Caption displayed in italic below the image.',
          'x-i18n-description': { fr: "Légende affichée en italique sous l'image." }
        },
        link: {
          $ref: 'https://github.com/data-fair/portals/common-links#/$defs/simpleLinkItem'
        },
        fetchPriority: {
          type: 'boolean',
          title: 'High loading priority',
          'x-i18n-title': { fr: 'Priorité de chargement élevée' },
          description: 'Enable for images visible on first render (above the fold), typically the main image at the top of the page, so they load first. Leave off for images further down; enabling it everywhere is counter-productive.',
          'x-i18n-description': { fr: "À activer pour les images visibles dès le premier affichage de la page (au-dessus de la ligne de flottaison), typiquement l'image principale en haut de page, afin qu'elles se chargent en priorité. À laisser désactivé pour les images plus bas ; l'activer partout est contre-productif." },
          layout: 'switch'
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-iframe': {
      type: 'object',
      title: 'IFrame',
      required: ['type', 'url'],
      properties: {
        type: { const: 'iframe' },
        uuid: { type: 'string', layout: 'none' },
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
        scroll: {
          type: 'boolean',
          title: 'Activer le scroll',
          description: "Permet de scroller dans le contenu de l'iframe"
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
    'element-icon': {
      type: 'object',
      title: 'IconElement',
      'x-i18n-title': {
        en: 'Icon',
        fr: 'Icône'
      },
      required: ['type'],
      properties: {
        type: { const: 'icon' },
        uuid: { type: 'string', layout: 'none' },
        icon: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/icon' },
        size: {
          type: 'integer',
          title: 'Size (px)',
          'x-i18n-title': { fr: 'Taille (px)' },
          minimum: 16,
          maximum: 128,
          default: 48,
          layout: {
            comp: 'slider',
            step: 8,
            props: {
              showTicks: 'always',
              thumbLabel: true
            }
          }
        },
        centered: {
          type: 'boolean',
          title: 'Center the icon',
          'x-i18n-title': { fr: "Centrer l'icône" },
          default: false
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    }
  }
}
