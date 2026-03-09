export default {
  $id: 'https://github.com/data-fair/portals/page-element-functional',
  'x-exports': [],
  $defs: {
    'element-search': {
      type: 'object',
      title: 'SearchElement',
      'x-i18n-title': {
        en: 'Search',
        fr: 'Barre de recherche'
      },
      required: ['type'],
      properties: {
        type: { const: 'search' },
        uuid: { type: 'string', layout: 'none' },
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
        label: {
          type: 'string',
          title: 'Texte du label',
          description: 'Texte personnalisé pour le label du champ de recherche. Si non renseigné, un texte par défaut sera utilisé.'
        },
        hideLabel: {
          type: 'boolean',
          title: 'Masquer le label au focus',
          description: "Le label sera masqué lorsque l'utilisateur clique dans le champ de recherche",
          layout: 'switch'
        },
        border: {
          type: 'boolean',
          title: 'Bordure',
          description: 'Afficher une bordure autour de la barre de recherche',
          layout: 'switch'
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
        uuid: { type: 'string', layout: 'none' },
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
          title: 'Rediriger vers le catalogue',
          description: 'Si activé, cliquer sur une thématique redirigera vers le catalogue source des thématiques (Jeux de données ou Visualisations) avec le filtre de thématique. Sinon, les thématiques agiront en tant que filtres sur la page actuelle.',
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
        variant: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/variant',
          layout: { if: 'parent.data?.redirectPage' }
        },
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
        type: { const: 'contact' },
        uuid: { type: 'string', layout: 'none' },
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
  }
}
