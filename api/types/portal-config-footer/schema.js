export default {
  $id: 'https://github.com/data-fair/portals/portal-config-footer',
  'x-exports': [],
  title: 'Footer',
  type: 'object',
  layout: {
    title: null,
    children: [
      'color',
      'showSocial',
      'showContactInformations',
      'copyright',
      'backgroundImage',
      'backgroundImageLocation',
      'logoPrimaryType',
      'logoPrimary',
      'logoPrimaryLink',
      {
        comp: 'tabs',
        children: [
          { title: 'Liste de logos', children: ['extraLogos'] },
          { title: 'Liens', children: ['linksMode', 'links'] },
          { title: 'Liens importants', children: ['importantLinks'] }
        ]
      }
    ]
  },
  required: ['color', 'showSocial', 'copyright', 'logoPrimaryType', 'extraLogos', 'linksMode', 'links', 'importantLinks'],
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
      layout: {
        comp: 'switch',
        cols: { md: 6 }
      }
    },
    showContactInformations: {
      type: 'boolean',
      title: 'Afficher les informations de contact',
      layout: {
        comp: 'switch',
        cols: { md: 6 }
      }
    },
    logoPrimaryType: {
      type: 'string',
      title: 'Logo principal du pied de page',
      layout: {
        switch: [
          {
            if: 'data === "local" ',
            cols: { md: 6 }
          }
        ]
      },
      default: 'default',
      oneOf: [
        { const: 'default', title: 'Utiliser le logo global' },
        { const: 'header', title: 'Utiliser le logo principal de l\'entête' },
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
        },
        cols: { md: 6 }
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
            description: "Texte affiché au survol du logo, pour l'accessibilité.",
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
    copyright: {
      type: 'string',
      title: 'Affichage du copyright',
      description: 'Vous pouvez afficher le copyright de 2 manières : \n- Afficher un texte du type **©2025 — Koumoul** en bas du pied de page.\n- Afficher le logo de l\'entreprise parmis la liste des logos du pied de page.',
      default: 'text',
      oneOf: [
        {
          const: 'text',
          title: 'Afficher "©2025 — Koumoul" en bas du pied de page',
        },
        {
          const: 'logo',
          title: 'Afficher le logo Koumoul',
        }
      ]
    },
    backgroundImage: {
      type: 'object',
      title: 'Image de fond du pied de page',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1920, label: 'Image de fond' }
          }
        },
        cols: { md: 8 }
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
        }
      }
    },
    backgroundImageLocation: {
      type: 'string',
      title: "Position de l'image de fond",
      default: 'right',
      layout: { cols: { md: 4 } },
      oneOf: [
        { const: 'left', title: 'Gauche' },
        { const: 'center', title: 'Centre' },
        { const: 'right', title: 'Droite' },
        { const: 'repeat', title: 'Répétée' }
      ]
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
      default: [],
    },
    importantLinks: {
      type: 'array',
      title: 'Liens importants',
      description: 'Les liens importants sont affichés sous forme de boutons, ils sont plus visibles que les simples liens.',
      layout: { messages: { addItem: 'Ajouter un lien' } },
      items: { $ref: '#/$defs/linkItem' },
      default: []
    }
  },
  $defs: {
    linkItem: {
      type: 'object',
      unevaluatedProperties: false,
      oneOfLayout: {
        emptyData: true,
      },
      oneOf: [{
        title: 'Page standard',
        required: ['type', 'subtype', 'title'],
        properties: {
          type: {
            const: 'standard'
          },
          subtype: {
            type: 'string',
            title: 'Type de page',
            default: 'home',
            oneOf: [{ const: 'home', title: 'Accueil' },
              { const: 'contact', title: 'Contact' },
              { const: 'privacy-policy', title: 'Politique de confidentialité' },
              { const: 'datasets', title: 'Catalogue de données' },
              { const: 'applications', title: 'Catalogue de visualisation' },
              { const: 'event', title: 'Liste des événements' },
              { const: 'news', title: 'Liste des actualités' },
              { const: 'sitemap', title: 'Plan du site' }
            ],
            layout: { cols: { md: 6 } }
          },
          title: {
            type: 'string',
            title: 'Libellé',
            layout: { cols: { md: 6 } }
          }
        }
      }, {
        title: 'Page d\'événements',
        required: ['type', 'title', 'pageRef'],
        properties: {
          type: { const: 'event' },
          pageRef: {
            type: 'object',
            required: ['slug', 'title'],
            title: 'Page',
            layout: {
              getItems: 'options.context.pages.event',
              cols: { md: 6 }
            },
            properties: {
              slug: { type: 'string' },
              title: { type: 'string' }
            }
          },
          title: {
            type: 'string',
            title: 'Libellé',
            default: 'Événements',
            layout: { cols: { md: 6 } }
          }
        }
      }, {
        title: 'Page d\'actualités',
        required: ['type', 'title', 'pageRef'],
        properties: {
          type: { const: 'news' },
          pageRef: {
            type: 'object',
            required: ['slug', 'title'],
            title: 'Page',
            layout: {
              getItems: 'options.context.pages.news',
              cols: { md: 6 }
            },
            properties: {
              slug: { type: 'string' },
              title: { type: 'string' }
            }
          },
          title: {
            type: 'string',
            title: 'Libellé',
            default: 'Actualités',
            layout: { cols: { md: 6 } }
          }
        }
      }, {
        title: 'Autre page',
        required: ['type', 'title', 'pageRef'],
        properties: {
          type: { const: 'generic' },
          pageRef: {
            type: 'object',
            required: ['slug', 'title'],
            title: 'Page',
            layout: {
              getItems: 'options.context.pages.generic',
              cols: { md: 6 }
            },
            properties: {
              slug: { type: 'string' },
              title: { type: 'string' },
              group: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  title: { type: 'string' },
                  slug: { type: 'string' }
                }
              }
            }
          },
          title: {
            type: 'string',
            title: 'Libellé',
            layout: { cols: { md: 6 } }
          }
        }
      }, {
        title: 'Lien externe',
        required: ['type', 'title', 'href'],
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
