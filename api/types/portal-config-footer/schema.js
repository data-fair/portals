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
          { title: 'Liens', children: ['linksMode', 'links'] },
          { title: 'Liens importants', children: ['importantLinks'] },
          { title: 'Liste de logos', children: ['extraLogos'] }
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
            props: { width: 2560, label: 'Chargez une image de fond' }
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
        },
        mobileAlt: {
          type: 'boolean'
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
    extraLogos: {
      type: 'array',
      title: 'Extra logos',
      layout: {
        title: '',
        messages: { addItem: 'Ajouter un logo' }
      },
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
      title: 'Links',
      layout: {
        title: '',
        // eslint-disable-next-line no-template-curly-in-string
        itemTitle: 'item.type === "standard" ? (item.subtype === "home" ? "Page d\'accueil" : item.subtype === "contact" ? "Page de contact" : item.subtype === "privacy-policy" ? "Page de politique de confidentialité" : item.subtype === "datasets" ? "Catalogue de données" : item.subtype === "applications" ? "Catalogue de visualisation" : item.subtype === "event" ? "Liste des évènements" : item.subtype === "news" ? "Liste des actualités" : item.subtype === "sitemap" ? "Plan du site" : "Page standard") + (item.title ? ` - Libellé : ${item.title}` : "") : item.type === "event" ? `Événement${item.pageRef?.title ? " - " + item.pageRef.title : ""}${item.title ? " - Libellé : " + item.title : ""}` : item.type === "news" ? `Actualité${item.pageRef?.title ? " - " + item.pageRef.title : ""}${item.title ? " - Libellé : " + item.title : ""}` : item.type === "generic" ? `Page éditée${item.pageRef?.title ? " - " + item.pageRef.title : ""}${item.title ? " - Libellé : " + item.title : ""}` : item.type === "external" ? `Lien externe - Libellé : ${item.title} - URL : ${item.href}` : item.type === "submenu" ? `Sous-menu - Libellé : ${item.title}` : "Lien non configuré"',
        messages: { addItem: 'Ajouter un lien' }
      },
      items: { $ref: '#/$defs/linkItem' },
      default: [],
    },
    importantLinks: {
      type: 'array',
      title: 'Important Links',
      description: 'Les liens importants sont affichés sous forme de boutons, ils sont plus visibles que les simples liens.',
      layout: {
        title: '',
        // eslint-disable-next-line no-template-curly-in-string
        itemTitle: 'item.type === "standard" ? (item.subtype === "home" ? "Page d\'accueil" : item.subtype === "contact" ? "Page de contact" : item.subtype === "privacy-policy" ? "Page de politique de confidentialité" : item.subtype === "datasets" ? "Catalogue de données" : item.subtype === "applications" ? "Catalogue de visualisation" : item.subtype === "event" ? "Liste des évènements" : item.subtype === "news" ? "Liste des actualités" : item.subtype === "sitemap" ? "Plan du site" : "Page standard") + (item.title ? ` - Libellé : ${item.title}` : "") : item.type === "event" ? `Événement${item.pageRef?.title ? " - " + item.pageRef.title : ""}${item.title ? " - Libellé : " + item.title : ""}` : item.type === "news" ? `Actualité${item.pageRef?.title ? " - " + item.pageRef.title : ""}${item.title ? " - Libellé : " + item.title : ""}` : item.type === "generic" ? `Page éditée${item.pageRef?.title ? " - " + item.pageRef.title : ""}${item.title ? " - Libellé : " + item.title : ""}` : item.type === "external" ? `Lien externe - Libellé : ${item.title} - URL : ${item.href}` : item.type === "submenu" ? `Sous-menu - Libellé : ${item.title}` : "Lien non configuré"',
        messages: { addItem: 'Ajouter un lien' }
      },
      items: { $ref: '#/$defs/linkItem' },
      default: []
    }
  },
  $defs: {
    linkItem: {
      type: 'object',
      unevaluatedProperties: false,
      oneOfLayout: { emptyData: true },
      discriminator: { propertyName: 'type' },
      // layout: { switch: [{ if: 'summary', slots: { component: 'link-item-summary' } }] },
      layout: { switch: [{ if: 'summary', children: [] }] },
      oneOf: [
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/standardPage' },
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/eventPage' },
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/newsPage' },
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/genericPage' },
        { $ref: 'https://github.com/data-fair/portals/portal-config-links#/$defs/externalLink' }
      ]
    }
  }
}
