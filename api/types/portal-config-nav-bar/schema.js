export default {
  $id: 'https://github.com/data-fair/portals/portal-config-nav-bar',
  'x-exports': [],
  title: 'NavBar',
  type: 'object',
  layout: { title: null },
  properties: {
    logoType: {
      type: 'string',
      title: 'Logo principal',
      layout: {
        switch: [{
          if: 'parent.data?.logoType === "local"',
          cols: { md: 6 }
        }]
      },
      default: 'default',
      oneOf: [
        { const: 'default', title: 'Utiliser le logo principal' },
        { const: 'local', title: 'Charger une image' },
        { const: 'hidden', title: 'Ne pas afficher de logo' }
      ]
    },
    logo: {
      type: 'object',
      title: 'Logo principal',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        if: 'parent.data?.logoType === "local"',
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
    logoMobile: {
      type: 'object',
      title: 'Logo principal - Alternative mobile',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        if: 'parent.data?.logoType !== "hidden"',
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Logo principal - Alternative mobile' }
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
    logoLink: {
      type: 'string',
      title: 'Lien au clic sur le logo principal',
      description: "Lien vers lequel l'utilisateur sera redirigé en cliquant sur le logo. Par défaut, il sera redirigé vers la page d'accueil.",
      layout: {
        if: 'parent.data?.logoType !== "hidden"',
        props: { clearable: true },
        cols: { md: 6 }
      }
    },
    color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-background' },
    loginColor: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-background',
      title: 'Couleur du bouton de connexion',
      description: 'Laisser vide pour utiliser la couleur de la barre de navigation.',
      layout: { cols: { md: 4 } }
    },
    sliderColor: {
      $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-background',
      title: "Couleur de l'indicateur de l'élément actif",
      description: 'Laisser vide pour utiliser la couleur par défaut.',
      layout: { cols: { md: 4 } }
    },
    align: {
      type: 'string',
      title: 'Position des onglets',
      layout: { cols: { md: 4 } },
      default: 'center',
      oneOf: [
        { const: 'left', title: 'Aligner à gauche' },
        { const: 'center', title: 'Centrer' },
      ]
    },
    tabsStyle: {
      type: 'array',
      title: 'Style des titres des onglets',
      items: {
        type: 'string',
        oneOf: [
          { const: 'uppercaseTitle', title: 'Afficher en majuscules' },
          { const: 'boldTitle', title: 'Afficher en gras' },
          { const: 'largerFont', title: 'Police plus grande' },
        ]
      },
      layout: { cols: { md: 4 } }
    },
    transparent: {
      type: 'boolean',
      title: 'Appliquer un effet de transparence',
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      }
    },
    keepOnScroll: {
      type: 'boolean',
      title: 'Garder la barre de navigation affichée au scroll',
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      }
    },
    fluid: {
      type: 'boolean',
      title: 'Afficher la barre de navigation en pleine largeur',
      layout: {
        comp: 'switch',
        cols: { md: 4 }
      },
      default: true
    }
  }
}
