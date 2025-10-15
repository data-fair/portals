/* eslint-disable no-template-curly-in-string */
export default {
  $id: 'https://github.com/data-fair/portals/page-elements',
  'x-exports': ['types', 'vjsf'],
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
      discriminator: {
        propertyName: 'type'
      },
      oneOf: [
        { $ref: '#/$defs/element-text' },
        { $ref: '#/$defs/element-title' },
        { $ref: '#/$defs/element-alert' },
        { $ref: '#/$defs/element-image' },
        { $ref: '#/$defs/element-iframe' },
        { $ref: '#/$defs/element-divider' },
        { $ref: '#/$defs/element-contact' },
        { $ref: '#/$defs/element-dataset-card' },
        { $ref: '#/$defs/element-dataset-table' },
        { $ref: '#/$defs/element-dataset-form' },
        { $ref: '#/$defs/element-application' },
        { $ref: '#/$defs/element-banner' },
        { $ref: '#/$defs/element-card' },
        { $ref: '#/$defs/element-two-columns' },
        { $ref: '#/$defs/element-responsive-flow' },
        { $ref: '#/$defs/element-tabs' },
      ]
    },
    'element-title': {
      type: 'object',
      title: 'Titre',
      required: ['type', 'titleSize'],
      properties: {
        type: {
          const: 'title'
        },
        content: {
          title: 'Contenu',
          type: 'string'
        },
        icon: {
          $ref: '#/$defs/icon'
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
        }
      }
    },
    'element-alert': {
      type: 'object',
      title: 'Texte accentué',
      required: ['type', 'alertType'],
      layout: {
        switch: [
          {
            if: 'data?.alertType === "none"',
            children: [
              'alertType', 'icon', 'color', 'title', 'content'
            ]
          },
          ['alertType', 'title', 'content']
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
        icon: {
          $ref: '#/$defs/icon'
        },
        color: {
          $ref: '#/$defs/color'
        },
        title: {
          title: 'Titre',
          type: 'string',
        },
        content: {
          title: 'Contenu',
          type: 'string',
          layout: 'markdown'
        }
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
        imageRef: { $ref: '#/$defs/image-ref' },
        href: {
          title: 'URL vers une autre page',
          description: "L'image devient un lien qui pointe vers l'URL renseignée.",
          type: 'string'
        },
        height: {
          title: 'Hauteur (px)',
          description: "Fixe la hauteur de l'image",
          type: 'integer'
        },
        legend: {
          title: "Légende de l'image",
          description: "Cette légende sera affichée en italique juste en dessous de l'image",
          type: 'string'
        },
        zoomable: {
          title: 'Zoom au clic',
          description: "Ne fonctionne que si aucun lien n'est associé à l'image",
          type: 'boolean'
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
        }
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
          description: 'Texte à afficher au centre du séparateur'
        },
        inset: {
          type: 'boolean',
          title: 'Ajouter une indentation'
        },
        rounded: {
          type: 'boolean',
          title: 'Bords arrondis'
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
    'element-contact': {
      title: 'Contact',
      type: 'object',
      required: ['type'],
      properties: {
        type: {
          const: 'contact'
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
        }
      }
    },
    'element-dataset-card': {
      type: 'object',
      title: 'Dataset card',
      'x-i18n-title': {
        fr: 'Carte d\'un jeu de données'
      },
      required: ['type', 'dataset', 'cardConfig'],
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
        cardConfig: {
          type: 'object',
          title: 'Configuration de la carte',
          required: ['thumbnailLocation', 'cropThumbnails', 'showSummary', 'actionsLocation', 'showDepartment', 'actionsStyle'],
          properties: {
            thumbnailLocation: {
              type: 'string',
              title: 'Position de l\'image sur la carte',
              default: 'center',
              oneOf: [
                { const: 'left', title: 'À gauche' },
                { const: 'center', title: 'Sous le titre' },
                { const: 'none', title: 'Ne pas afficher' }
              ]
            },
            useApplicationThumbnail: {
              type: 'boolean',
              title: 'Utiliser l\'image de l\'application',
              description: "Permet d'utiliser l'image de la première application qui utilise ce jeu de données si aucune image n'est définie pour ce dernier.",
              layout: {
                comp: 'switch',
                cols: { md: 6 }
              },
              default: false
            },
            cropThumbnails: {
              type: 'boolean',
              title: 'Recadrer l\'image pour un rendu uniforme',
              description: 'Si désactivé, l\'image gardera son ratio d\'origine',
              layout: {
                comp: 'switch',
                cols: { md: 6 }
              },
              default: true
            },
            showSummary: {
              type: 'boolean',
              layout: 'switch',
              title: 'Afficher le résumé sur la carte',
              default: true
            },
            actionsLocation: {
              type: 'string',
              title: 'Position des boutons d\'actions sur la carte',
              default: 'bottom',
              oneOf: [
                { const: 'right', title: 'À droite' },
                { const: 'bottom', title: 'En bas' },
                { const: 'none', title: 'Aucun' }
              ]
            },
            showDepartment: {
              type: 'boolean',
              layout: 'switch',
              title: 'Afficher le département du propriétaire',
              description: 'Affiche le département du propriétaire si le jeu de données est détenu par un département.',
              default: true
            },
            actionsStyle: {
              type: 'string',
              title: 'Style des boutons d\'actions',
              default: 'full',
              oneOf: [
                {
                  title: 'Icône seulement',
                  const: 'icon'
                },
                {
                  title: 'Icône et texte',
                  const: 'full'
                },
                {
                  title: 'Texte seulement',
                  const: 'text'
                }
              ]
            }
          }
        }
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
              title: 'Table',
              const: 'table'
            },
            {
              title: 'Table dense',
              const: 'table-dense'
            },
            {
              title: 'Liste de vignettes',
              const: 'list'
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
        }
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
        }
      }
    },
    'element-application': {
      type: 'object',
      title: 'Application',
      'x-i18n-title': {
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
          required: ['id', 'title', 'exposedUrl'],
          layout: {
            getItems: {
              url: '/data-fair/api/v1/applications?mine=true&select=id,title,exposedUrl',
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
            exposedUrl: {
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
        }
      }
    },
    'element-banner': {
      type: 'object',
      title: 'Banner',
      'x-i18n-title': {
        fr: 'Bannière'
      },
      required: ['type', 'children'],
      properties: {
        type: {
          const: 'banner'
        },
        backgroundColor: {
          $ref: '#/$defs/color'
        },
        backgroundImage: {
          type: 'object',
          required: ['_id', 'name', 'mimeType'],
          layout: {
            slots: {
              component: {
                name: 'image-upload',
                props: { width: 5152, label: 'chargez une image' } // TODO: allow larger images
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
        children: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: '#/$defs/element'
          }
        }
      }
    },
    'element-card': {
      type: 'object',
      title: 'Boite',
      required: ['type', 'children', 'actions'],
      properties: {
        type: {
          const: 'card'
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
        children: {
          type: 'array',
          layout: 'none',
          items: {
            $ref: '#/$defs/element'
          }
        }
      }
    },
    'element-two-columns': {
      type: 'object',
      title: '2 colonnes',
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
              title: 'largeur de même taille'
            },
            {
              const: 'left',
              title: 'colonne gauche large'
            },
            {
              const: 'right',
              title: 'colonne droite large'
            }
          ]
        },
        gutter: {
          type: 'string',
          title: 'Espacement',
          default: 'default',
          oneOf: [
            { const: 'none', title: 'aucun' },
            { const: 'dense', title: 'petit' },
            { const: 'default', title: 'normal' }
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
        }
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
        }
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
            { const: 'start', title: 'début' },
            { const: 'center', title: 'centre' },
            { const: 'end', title: 'fin' }
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
              icon: {
                $ref: '#/$defs/icon'
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
        }
      }
    },
    'image-ref': {
      type: 'object',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 2400, label: 'chargez une image' } // max width of v-container
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
    icon: {
      type: 'object',
      title: 'Icône',
      required: ['name', 'svg'],
      layout: {
        getItems: {
          url: 'https://koumoul.com/data-fair/api/v1/datasets/icons-mdi-latest/lines?q={q}&select=name,svg,svgPath',
          itemKey: 'data.name',
          itemTitle: 'data.name',
          itemIcon: 'data.svg',
          itemsResults: 'data.results'
        }
      },
      properties: {
        name: { type: 'string' },
        svg: { type: 'string' },
        svgPath: { type: 'string' }
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
    }
  }
}
