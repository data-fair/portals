import { inheritedStyleLayout } from '../common-defs/schema.ts'

export default {
  $id: 'https://github.com/data-fair/portals/page-element-functional',
  'x-exports': [],
  $defs: {
    'element-custom-agent': {
      type: 'object',
      title: 'CustomAgentElement',
      'x-i18n-title': {
        en: 'Custom AI assistant (beta)',
        fr: 'Assistant IA personnalisé (bêta)'
      },
      required: ['type'],
      properties: {
        type: { const: 'custom-agent' },
        uuid: { type: 'string', layout: 'none' },
        title: {
          title: 'Assistant title',
          'x-i18n-title': { fr: "Titre de l'assistant" },
          type: 'string'
        },
        systemPrompt: {
          title: 'Instructions (prompt)',
          description: 'Describe the role of this assistant and the topic it helps with.',
          'x-i18n-description': { fr: 'Décrivez le rôle de cet assistant et le sujet sur lequel il aide.' },
          type: 'string',
          layout: 'textarea'
        },
        focusDatasets: {
          title: 'Focus datasets',
          'x-i18n-title': { fr: 'Jeux de données prioritaires' },
          description: 'The assistant focuses its exploration on these datasets (without being strictly limited to them).',
          'x-i18n-description': { fr: "L'assistant concentre ses explorations sur ces jeux de données (sans s'y limiter strictement)." },
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id'],
            properties: {
              id: { type: 'string' },
              title: { type: 'string' }
            }
          },
          layout: {
            getItems: {
              url: '/data-fair/api/v1/datasets?mine=true&raw=true&select=id,title&size=20&sort=updatedAt:-1',
              qSearchParam: 'q',
              itemsResults: 'data.results',
              itemTitle: 'item.title + " (" + item.id + ")"',
              itemKey: 'item.id'
            }
          }
        },
        visibleTo: {
          type: 'array',
          title: 'Visible to',
          'x-i18n-title': { fr: 'Visible pour' },
          default: ['admin', 'contrib', 'user', 'external', 'anonymous'],
          items: {
            type: 'string',
            oneOf: [
              { const: 'admin', title: 'Organization administrators', 'x-i18n-title': { fr: "Administrateurs de l'organisation" } },
              { const: 'contrib', title: 'Organization contributors', 'x-i18n-title': { fr: "Contributeurs de l'organisation" } },
              { const: 'user', title: 'Other organization members', 'x-i18n-title': { fr: "Autres membres de l'organisation" } },
              { const: 'external', title: 'Authenticated external users', 'x-i18n-title': { fr: 'Utilisateurs externes authentifiés' } },
              { const: 'anonymous', title: 'Anonymous visitors', 'x-i18n-title': { fr: 'Visiteurs anonymes' } }
            ]
          }
        },
        height: {
          title: 'Height (px)',
          'x-i18n-title': { fr: 'Hauteur (px)' },
          type: 'integer',
          minimum: 200,
          default: 500
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' }
      }
    },
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
          title: 'Button position',
          'x-i18n-title': { fr: 'Position du bouton' },
          description: 'Sets the position of the search button relative to the input field',
          'x-i18n-description': { fr: 'Définit la position du bouton de recherche par rapport à la barre de saisie' },
          default: 'included',
          oneOf: [
            { const: 'included', title: 'Included', 'x-i18n-title': { fr: 'Inclus' } },
            { const: 'attached', title: 'Attached', 'x-i18n-title': { fr: 'Collé' } },
            { const: 'spaced', title: 'Spaced', 'x-i18n-title': { fr: 'Espacé' } }
          ]
        },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          title: 'Button elevation',
          'x-i18n-title': { fr: 'Élévation du bouton' },
          layout: { if: 'parent.data?.btnPosition === "spaced"' }
        },
        label: {
          type: 'string',
          title: 'Label text',
          'x-i18n-title': { fr: 'Texte du label' },
          description: 'Custom text for the label of the search field. If empty, a default text is used.',
          'x-i18n-description': { fr: 'Texte personnalisé pour le label du champ de recherche. Si non renseigné, un texte par défaut sera utilisé.' }
        },
        hideLabel: {
          type: 'boolean',
          title: 'Hide the label on focus',
          'x-i18n-title': { fr: 'Masquer le label au focus' },
          description: 'The label is hidden when the user clicks in the search field',
          'x-i18n-description': { fr: "Le label sera masqué lorsque l'utilisateur clique dans le champ de recherche" },
          layout: 'switch'
        },
        border: {
          type: 'boolean',
          title: 'Border',
          'x-i18n-title': { fr: 'Bordure' },
          description: 'Show a border around the search bar',
          'x-i18n-description': { fr: 'Afficher une bordure autour de la barre de recherche' },
          layout: 'switch'
        },
        fullWidth: {
          type: 'boolean',
          title: 'Full width',
          'x-i18n-title': { fr: 'Pleine largeur' },
          description: 'The search field extends to the full width of its parent container.',
          'x-i18n-description': { fr: "Le champ de recherche s'étendra sur toute la largeur de son conteneur parent." },
          layout: 'switch'
        },
        redirectPage: {
          type: 'boolean',
          title: 'Redirect to the datasets page',
          'x-i18n-title': { fr: 'Rediriger vers la page de jeux de données' },
          description: 'If enabled, the search redirects to the datasets page. Otherwise, the search applies to the current page.',
          'x-i18n-description': { fr: "Si activé, la recherche redirigera vers la page des jeux de données Sinon, la recherche s'appliquera sur la page actuelle." },
          layout: 'switch'
        },
        centered: {
          type: 'boolean',
          title: 'Center the search field',
          'x-i18n-title': { fr: 'Centrer le champ de recherche' },
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
          type: 'array',
          title: 'Topics sources',
          'x-i18n-title': { fr: 'Sources des thématiques' },
          description: 'Select one or more sources. When several sources are selected, the topics are merged (the counts are added up) and the redirection to the catalog is disabled.',
          'x-i18n-description': { fr: 'Sélectionnez une ou plusieurs sources. Lorsque plusieurs sources sont sélectionnées, les thématiques sont fusionnées (les compteurs sont additionnés) et la redirection vers le catalogue est désactivée.' },
          default: ['datasets'],
          minItems: 1,
          uniqueItems: true,
          items: {
            type: 'string',
            oneOf: [
              { const: 'datasets', title: 'Datasets', 'x-i18n-title': { fr: 'Jeux de données' } },
              { const: 'applications', title: 'Applications', 'x-i18n-title': { fr: 'Visualisations' } }
            ]
          }
        },
        redirectPage: {
          type: 'boolean',
          title: 'Redirect to the catalog',
          'x-i18n-title': { fr: 'Rediriger vers le catalogue' },
          description: 'If enabled, clicking a topic redirects to the source catalog of the topics (Datasets or Applications) with the topic filter. Otherwise, the topics act as filters on the current page.',
          'x-i18n-description': { fr: 'Si activé, cliquer sur une thématique redirigera vers le catalogue source des thématiques (Jeux de données ou Visualisations) avec le filtre de thématique. Sinon, les thématiques agiront en tant que filtres sur la page actuelle.' },
          layout: {
            comp: 'switch',
            // Hidden when several sources are selected: we can only redirect to a single catalog.
            if: '!Array.isArray(parent.data?.mode) || parent.data?.mode.length <= 1'
          }
        },
        centered: {
          type: 'boolean',
          title: 'Center the topics',
          'x-i18n-title': { fr: 'Centrer les thématiques' }
        },
        color: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics' },
        elevation: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation', layout: { ...inheritedStyleLayout } },
        density: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/density', layout: { ...inheritedStyleLayout } },
        rounded: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded', layout: { ...inheritedStyleLayout } },
        hover: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/hoverConfigTopics',
          layout: { comp: 'card' }
        },
        variant: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/variant',
          layout: { if: 'parent.data?.redirectPage && (!Array.isArray(parent.data?.mode) || parent.data?.mode.length <= 1)' }
        },
        showIcon: {
          type: 'boolean',
          title: 'Show the icon',
          'x-i18n-title': { fr: "Afficher l'icône" },
          layout: 'switch',
          default: true
        },
        iconColor: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/color-topics',
          title: 'Icon color',
          'x-i18n-title': { fr: "Couleur de l'icône" },
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
      layout: { if: 'context.adminMode' },
      required: ['type', 'metrics'],
      properties: {
        type: {
          const: 'metrics'
        },
        uuid: { type: 'string', layout: 'none' },
        metrics: {
          type: 'array',
          title: 'Metrics to display',
          'x-i18n-title': { fr: 'Chiffres à afficher' },
          description: 'Select the key metrics to display.',
          'x-i18n-description': { fr: 'Sélectionnez les chiffres clés à afficher.' },
          default: ['datasets', 'records', 'applications'],
          items: {
            type: 'string',
            oneOf: [
              { const: 'datasets', title: 'Datasets', 'x-i18n-title': { fr: 'Jeux de données' } },
              { const: 'records', title: 'Records', 'x-i18n-title': { fr: 'Enregistrements' } },
              { const: 'applications', title: 'Applications', 'x-i18n-title': { fr: 'Visualisations' } }
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
          title: 'Full width',
          'x-i18n-title': { fr: 'Pleine largeur' },
          description: 'The boxes expand to fill the row.',
          'x-i18n-description': { fr: "Les boîtes s'étendront pour remplir la ligne." },
          layout: 'switch'
        },
        border: {
          type: 'boolean',
          title: 'Border',
          'x-i18n-title': { fr: 'Bordure' },
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
              title: 'Show the subject field',
              'x-i18n-title': { fr: 'Afficher le champ sujet' },
              layout: {
                comp: 'switch',
                cols: { xs: 6 }
              },
              default: true
            },
            requiredSubject: {
              type: 'boolean',
              title: 'Required subject',
              'x-i18n-title': { fr: 'Sujet obligatoire' },
              layout: {
                if: 'parent.data?.enableSubject',
                comp: 'switch',
                cols: { xs: 6 }
              },
              default: true
            },
            enableMessage: {
              type: 'boolean',
              title: 'Show the message field',
              'x-i18n-title': { fr: 'Afficher le champ message' },
              layout: {
                comp: 'switch',
                cols: { xs: 6 }
              },
              default: true
            },
            requiredMessage: {
              type: 'boolean',
              title: 'Required message',
              'x-i18n-title': { fr: 'Message obligatoire' },
              layout: {
                if: 'parent.data?.enableMessage',
                comp: 'switch',
                cols: { xs: 6 }
              },
              default: true
            },
            messageMinLength: {
              type: 'integer',
              title: 'Min. characters',
              'x-i18n-title': { fr: 'Min. caractères' },
              description: 'Minimum length of the message. Use -1 to disable the limit.',
              'x-i18n-description': { fr: 'Longueur minimale du message. Utilisez -1 pour désactiver la limite.' },
              minimum: -1,
              default: 50,
              layout: {
                if: 'parent.data?.enableMessage',
                cols: { xs: 6 }
              }
            },
            messageMaxLength: {
              type: 'integer',
              title: 'Max. characters',
              'x-i18n-title': { fr: 'Max. caractères' },
              description: 'Maximum length of the message. Use -1 to disable the limit.',
              'x-i18n-description': { fr: 'Longueur maximale du message. Utilisez -1 pour désactiver la limite.' },
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
          title: 'Additional fields',
          'x-i18n-title': { fr: 'Champs additionnels' },
          description: 'Add extra fields to the contact form. They are placed between the email field and the subject field',
          'x-i18n-description': { fr: 'Ajoutez des champs supplémentaires au formulaire de contact. Ils seront positionnés entre le champ email et le champ sujet' },
          layout: {
            messages: {
              addItem: 'Add a field',
              'x-i18n-addItem': { fr: 'Ajouter un champ' }
            },
            listEditMode: 'inline'
          },
          items: {
            type: 'object',
            default: { type: 'text' },
            oneOf: [
              {
                title: 'Text field',
                'x-i18n-title': { fr: 'Champ de texte' },
                description: 'Lets the user enter a free value (text, name, etc.).',
                'x-i18n-description': { fr: "Permet à l'utilisateur de saisir une valeur libre (texte, nom, etc.)." },
                required: ['type'],
                properties: {
                  type: { const: 'text' },
                  key: {
                    type: 'string',
                    title: 'Key in the template',
                    'x-i18n-title': { fr: 'Clé dans le template' },
                    description: 'Identifier used in the templates (e.g. department_name).',
                    'x-i18n-description': { fr: 'Identifiant utilisé dans les templates (ex: department_name).' },
                    pattern: '^[a-z]+(?:_[a-z]+)*$',
                    errorMessage: 'Use only lowercase letters separated by _',
                    'x-i18n-errorMessage': { fr: 'Utilisez uniquement des minuscules séparés par des _' }
                  },
                  label: {
                    type: 'string',
                    title: 'Field label',
                    'x-i18n-title': { fr: 'Libellé du champ' }
                  },
                  required: {
                    type: 'boolean',
                    title: 'Required field',
                    'x-i18n-title': { fr: 'Champ obligatoire' },
                    layout: 'switch'
                  }
                }
              },
              {
                title: 'Custom dropdown list',
                'x-i18n-title': { fr: 'Liste déroulante personnalisée' },
                description: 'Lets the user choose from a list of values that you define.',
                'x-i18n-description': { fr: "Propose à l'utilisateur de choisir parmi une liste de valeurs que vous définissez." },
                required: ['type'],
                properties: {
                  type: { const: 'select' },
                  key: {
                    type: 'string',
                    title: 'Key in the template',
                    'x-i18n-title': { fr: 'Clé dans le template' },
                    description: 'Identifier used in the templates (e.g. department_name).',
                    'x-i18n-description': { fr: 'Identifiant utilisé dans les templates (ex: department_name).' },
                    pattern: '^[a-z]+(?:_[a-z]+)*$',
                    errorMessage: 'Use only lowercase letters separated by _',
                    'x-i18n-errorMessage': { fr: 'Utilisez uniquement des minuscules séparés par des _' }
                  },
                  label: {
                    type: 'string',
                    title: 'Field label',
                    'x-i18n-title': { fr: 'Libellé du champ' }
                  },
                  options: {
                    type: 'array',
                    title: 'Available options',
                    'x-i18n-title': { fr: 'Options disponibles' },
                    description: 'List of the values offered in the dropdown menu.',
                    'x-i18n-description': { fr: 'Liste des valeurs proposées dans le menu déroulant.' },
                    items: {
                      type: 'string',
                      title: 'Option'
                    }
                  },
                  required: {
                    type: 'boolean',
                    title: 'Required field',
                    'x-i18n-title': { fr: 'Champ obligatoire' },
                    layout: 'switch'
                  },
                  multiple: {
                    type: 'boolean',
                    title: 'Multiple choice allowed',
                    'x-i18n-title': { fr: 'Choix multiple autorisé' },
                    description: 'If enabled, the values are separated by commas in the email',
                    'x-i18n-description': { fr: "Si activé, les valeurs seront séparées par des virgules dans l'email" },
                    layout: 'switch'
                  }
                }
              },
              {
                title: 'Datasets dropdown list',
                'x-i18n-title': { fr: 'Liste déroulante de jeux de données' },
                description: 'Lets the user select a dataset published on your portal.',
                'x-i18n-description': { fr: "Permet à l'utilisateur de sélectionner un jeu de données publié sur votre portail." },
                required: ['type'],
                properties: {
                  type: { const: 'dataset' },
                  key: {
                    type: 'string',
                    title: 'Key in the template',
                    'x-i18n-title': { fr: 'Clé dans le template' },
                    description: 'Identifier used in the templates (e.g. department_name).',
                    'x-i18n-description': { fr: 'Identifiant utilisé dans les templates (ex: department_name).' },
                    pattern: '^[a-z]+(?:_[a-z]+)*$',
                    errorMessage: 'Use only lowercase letters separated by _',
                    'x-i18n-errorMessage': { fr: 'Utilisez uniquement des minuscules séparés par des _' }
                  },
                  label: {
                    type: 'string',
                    title: 'Field label',
                    'x-i18n-title': { fr: 'Libellé du champ' }
                  },
                  required: {
                    type: 'boolean',
                    title: 'Required field',
                    'x-i18n-title': { fr: 'Champ obligatoire' },
                    layout: 'switch'
                  }
                }
              },
              {
                title: 'Applications dropdown list',
                'x-i18n-title': { fr: 'Liste déroulante de visualisations' },
                description: 'Lets the user choose an application published on your portal.',
                'x-i18n-description': { fr: "Permet à l'utilisateur de choisir une visualisation publiée sur votre portail." },
                required: ['type'],
                properties: {
                  type: { const: 'application' },
                  key: {
                    type: 'string',
                    title: 'Key in the template',
                    'x-i18n-title': { fr: 'Clé dans le template' },
                    description: 'Identifier used in the templates (e.g. department_name).',
                    'x-i18n-description': { fr: 'Identifiant utilisé dans les templates (ex: department_name).' },
                    pattern: '^[a-z]+(?:_[a-z]+)*$',
                    errorMessage: 'Use only lowercase letters separated by _',
                    'x-i18n-errorMessage': { fr: 'Utilisez uniquement des minuscules séparés par des _' }
                  },
                  label: {
                    type: 'string',
                    title: 'Field label',
                    'x-i18n-title': { fr: 'Libellé du champ' }
                  },
                  required: {
                    type: 'boolean',
                    title: 'Required field',
                    'x-i18n-title': { fr: 'Champ obligatoire' },
                    layout: 'switch'
                  }
                }
              }
            ]
          }
        },
        subjectTemplate: {
          type: 'string',
          title: 'Email subject format',
          'x-i18n-title': { fr: "Format de l'objet de l'email" },
          description: "Customize the format of the subject of the emails received. You can insert the values entered by the user using tags between curly braces:\n* **{subject}**: The text entered in the default \"Subject\" field.\n* **{message}**: The text entered in the default \"Message\" field.\n* **{from}**: The sender's email address.\n* **{portalName}**: The portal name.\n* **{portalDomain}**: The portal domain.\n* **{your_key}**: For additional fields, use the **Key in the template** you defined (e.g. if the key is *department*, use **{department}**).\n\nLeave empty to use the default format: **{subject}**",
          'x-i18n-description': {
            fr: "Personnalisez le format de l'objet des emails reçus. Vous pouvez insérer les valeurs saisies par l'utilisateur en utilisant des balises entre accolades :\n* **{subject}** : Le texte saisi dans le champ \"Sujet\" par défaut.\n* **{message}** : Le texte saisi dans le champ \"Message\" par défaut.\n* **{from}** : L'adresse email de l'expéditeur.\n* **{portalName}** : Le nom du portail.\n* **{portalDomain}** : Le domaine du portail.\n* **{votre_cle}** : Pour les champs additionnels, utilisez la **Clé dans le template** que vous avez définie (ex: si la clé est *departement*, utilisez **{departement}**).\n\nLaissez vide pour utiliser le format par défaut : **{subject}**"
          },
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
          title: 'Email body format',
          'x-i18n-title': { fr: "Format du corps de l'email" },
          description: "Customize the format of the body of the emails received. The content is interpreted as **Markdown** and rendered as HTML in the email. You can insert the values entered by the user using tags between curly braces:\n* **{subject}**: The text entered in the default \"Subject\" field.\n* **{message}**: The text entered in the default \"Message\" field.\n* **{from}**: The sender's email address.\n* **{portalName}**: The portal name.\n* **{portalDomain}**: The portal domain.\n* **{your_key}**: For additional fields, use the **Key in the template** you defined (e.g. if the key is *department*, use **{department}**).\n\nLeave empty to use the default format.",
          'x-i18n-description': {
            fr: "Personnalisez le format du corps des emails reçus. Le contenu est interprété en **Markdown** et sera rendu en HTML dans l'email. Vous pouvez insérer les valeurs saisies par l'utilisateur en utilisant des balises entre accolades :\n* **{subject}** : Le texte saisi dans le champ \"Sujet\" par défaut.\n* **{message}** : Le texte saisi dans le champ \"Message\" par défaut.\n* **{from}** : L'adresse email de l'expéditeur.\n* **{portalName}** : Le nom du portail.\n* **{portalDomain}** : Le domaine du portail.\n* **{votre_cle}** : Pour les champs additionnels, utilisez la **Clé dans le template** que vous avez définie (ex: si la clé est *departement*, utilisez **{departement}**).\n\nLaissez vide pour utiliser le format par défaut."
          },
          layout: 'markdown',
        },
        bodyTemplate_html: { $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rendered-html' },
        elevation: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/elevation',
          layout: { ...inheritedStyleLayout }
        },
        rounded: {
          $ref: 'https://github.com/data-fair/portals/common-defs#/$defs/rounded',
          layout: { ...inheritedStyleLayout }
        },
        showInfo: {
          type: 'boolean',
          layout: 'switch',
          title: 'Show the contact information',
          'x-i18n-title': { fr: 'Afficher les informations de contact' }
        },
        showSocial: {
          type: 'boolean',
          layout: 'switch',
          title: 'Show the social network links',
          'x-i18n-title': { fr: 'Afficher les liens de réseaux sociaux' },
          description: 'No link is shown until a social network is set in the portal configuration ("Contact › Social networks").',
          'x-i18n-description': { fr: "Aucun lien n'est affiché tant qu'aucun réseau social n'est renseigné dans la configuration du portail (« Contact › Réseaux sociaux »)." }
        },
        mb: { $ref: 'https://github.com/data-fair/portals/page-elements-defs#/$defs/margin-bottom' },
        sendButton: {
          title: 'Contact send button',
          'x-i18n-title': { fr: "Bouton d'envoi", en: 'Send button' },
          layout: { comp: 'card' },
          properties: {
            usePortalConfig: {
              type: 'boolean',
              title: 'Use the portal configuration',
              'x-i18n-title': { fr: 'Utiliser la configuration du portail' },
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
