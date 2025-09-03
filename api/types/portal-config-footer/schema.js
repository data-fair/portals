export default {
  $id: 'https://github.com/data-fair/portals/portal-config-footer',
  'x-exports': [],
  title: 'Footer',
  type: 'object',
  layout: {
    title: null
  },
  required: ['color', 'showSocial', 'copyright', 'logoPrimaryType', 'extraLogos', 'linksMode', 'links', 'importantLinks', 'showPrivacyPolicyLink', 'showSitemapLink'],
  properties: {
    color: {
      type: 'string',
      title: 'Couleur du pied de page',
      default: 'primary',
      oneOf: [
        { const: 'primary', title: 'Couleur principale' },
        { const: 'secondary', title: 'Couleur secondaire' },
        { const: 'accent', title: 'Couleur accentuée' },
        { const: 'surface', title: 'Couleur des surfaces' },
        { const: 'background', title: 'Couleur du fond de page' }
      ]
    },
    showSocial: {
      type: 'boolean',
      title: 'Afficher les liens de réseaux sociaux',
      layout: 'switch'
    },
    copyright: {
      type: 'string',
      title: 'Affichage du copyright',
      description: 'Vous pouvez afficher le copyright de 2 manières : \n- Afficher un texte du type **2025 © Koumoul** en bas du pied de page.\n- Afficher le logo de l\'entreprise parmis la liste des logos du pied de page.',
      default: 'text',
      oneOf: [
        {
          const: 'text',
          title: 'Afficher en bas du pied de page',
        },
        {
          const: 'logo',
          title: 'Afficher le logo Koumoul',
        }
      ]
    },
    logoPrimaryType: {
      type: 'string',
      title: 'Logo principal',
      default: 'default',
      oneOf: [
        { const: 'default', title: 'Utiliser l\'image globale' },
        { const: 'header', title: 'Utiliser l\'image de l\'entête' },
        { const: 'local', title: 'Charger une image' },
        { const: 'hidden', title: 'Ne pas afficher de logo' }
      ]
    },
    logoPrimary: {
      type: 'object',
      title: 'Logo principal',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        if: 'parent.data?.logoPrimaryType === "local"',
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Logo principal' }
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
    logoPrimaryLink: {
      layout: {
        if: 'parent.data?.logoPrimaryType !== "hidden"',
        props: {
          clearable: true
        }
      },
      type: 'string',
      title: 'Lien au clic sur le logo principal',
      description: 'Lien vers lequel l\'utilisateur sera redirigé en cliquant sur le logo.'
    },
    extraLogos: {
      type: 'array',
      title: 'Liste des logos',
      layout: { messages: { addItem: 'Ajouter un logo' } },
      items: {
        type: 'object',
        required: ['logo', 'label'],
        properties: {
          logo: {
            type: 'object',
            title: 'Logo',
            required: ['_id', 'name', 'mimeType'],
            layout: {
              slots: {
                component: {
                  name: 'image-upload',
                  props: { width: 1280, label: 'Logo' }
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
          label: {
            type: 'string',
            title: 'Libellé',
            description: 'Texte affiché au survol du logo, pour l’accessibilité.',
            layout: { cols: { md: 6 } }
          },
          link: {
            type: 'string',
            title: 'Lien au clic sur le logo',
            description: 'Lien vers lequel l\'utilisateur sera redirigé en cliquant sur le logo.',
            layout: { cols: { md: 6 } }
          }
        }
      }
    },
    linksMode: {
      type: 'string',
      title: "Mode d'affichage des liens",
      default: 'lines',
      oneOf: [
        { title: 'En lignes', const: 'lines' },
        { title: 'Sur 2 colonnes', const: 'columns' }
      ]
    },
    links: {
      type: 'array',
      title: 'Liens',
      layout: { messages: { addItem: 'Ajouter un lien' } },
      items: { $ref: '#/$defs/linkItem' },
      default: []
    },
    importantLinks: {
      type: 'array',
      title: 'Liens importants',
      description: 'Ces liens sont affichés sous forme de boutons, ils sont donc mieux mis en avant.',
      layout: { messages: { addItem: 'Ajouter un lien' } },
      items: { $ref: '#/$defs/linkItem' },
      default: []
    }
  },
  $defs: {
    linkItem: {
      type: 'object',
      unevaluatedProperties: false,
      default: { type: 'custom' },
      oneOf: [{
        required: ['title'],
        title: 'Catalogue des jeux de données',
        properties: {
          type: { const: 'datasets' },
          title: {
            type: 'string',
            default: 'Jeux de données',
            title: 'Libellé'
          }
        }
      }, {
        required: ['title'],
        title: 'Catalogue des visualisations',
        properties: {
          type: { const: 'applications' },
          title: {
            type: 'string',
            default: 'Visualisations',
            title: 'Libellé'
          }
        }
      }, {
        required: ['title'],
        title: 'Page de contact',
        properties: {
          type: { const: 'contact' },
          title: {
            type: 'string',
            default: 'Contact',
            title: 'Libellé'
          }
        }
      }, {
        title: 'Plan du site',
        properties: {
          type: { const: 'sitemap' }
        }
      }, {
        title: 'Politique de confidentialité',
        properties: {
          type: { const: 'privacy-policy' }
        }
      }, {
        required: ['title'],
        title: 'Page éditée',
        properties: {
          type: { const: 'custom' },
          pageRef: {
            type: 'object',
            required: ['_id', 'title'],
            title: 'Page',
            layout: {
              getItems: {
                url: '/portals-manager/api/pages?select=_id,title',
                itemsResults: 'data.results.map(r => ({_id: r._id, title: r.title}))',
                itemTitle: 'item.title',
                itemKey: 'item._id'
              }
            },
            properties: {
              _id: { type: 'string' },
              title: { type: 'string' }
            }
          },
          title: {
            type: 'string',
            title: 'Libellé'
          }
        }
      }, {
        title: 'Lien externe',
        required: ['title', 'href'],
        properties: {
          type: { const: 'external' },
          title: {
            type: 'string',
            title: 'Libellé'
          },
          href: {
            title: 'URL',
            type: 'string'
          }
        }
      }]
    }
  }
}
