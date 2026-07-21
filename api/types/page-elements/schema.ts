import basics from '../page-element-basics/schema.js'
import navigation from '../page-element-navigation/schema.js'
import layout from '../page-element-layout/schema.js'
import functional from '../page-element-functional/schema.js'
import datasets from '../page-element-datasets/schema.js'
import applications from '../page-element-applications/schema.js'
import reuses from '../page-element-reuses/schema.js'
import events from '../page-element-events/schema.js'
import news from '../page-element-news/schema.js'

const branch = (schema: Record<string, any>, name: string) => {
  const { unevaluatedProperties, ...def } = structuredClone(schema.$defs[name])
  return { ...def, additionalProperties: false }
}

const mdiShapeOutlineIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>shape-outline</title><path d="M11,13.5V21.5H3V13.5H11M9,15.5H5V19.5H9V15.5M12,2L17.5,11H6.5L12,2M12,5.86L10.08,9H13.92L12,5.86M17.5,13C20,13 22,15 22,17.5C22,20 20,22 17.5,22C15,22 13,20 13,17.5C13,15 15,13 17.5,13M17.5,15A2.5,2.5 0 0,0 15,17.5A2.5,2.5 0 0,0 17.5,20A2.5,2.5 0 0,0 20,17.5A2.5,2.5 0 0,0 17.5,15Z" /></svg>'
const mdiViewGridOutline = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>view-grid-outline</title><path d="M3 11H11V3H3M5 5H9V9H5M13 21H21V13H13M15 15H19V19H15M3 21H11V13H3M5 15H9V19H5M13 3V11H21V3M19 9H15V5H19Z" /></svg>'
const mdiPuzzleOutline = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>puzzle-outline</title><path d="M22,13.5C22,15.26 20.7,16.72 19,16.96V20A2,2 0 0,1 17,22H13.2V21.7A2.7,2.7 0 0,0 10.5,19C9,19 7.8,20.21 7.8,21.7V22H4A2,2 0 0,1 2,20V16.2H2.3C3.79,16.2 5,15 5,13.5C5,12 3.79,10.8 2.3,10.8H2V7A2,2 0 0,1 4,5H7.04C7.28,3.3 8.74,2 10.5,2C12.26,2 13.72,3.3 13.96,5H17A2,2 0 0,1 19,7V10.04C20.7,10.28 22,11.74 22,13.5M17,15H18.5A1.5,1.5 0 0,0 20,13.5A1.5,1.5 0 0,0 18.5,12H17V7H12V5.5A1.5,1.5 0 0,0 10.5,4A1.5,1.5 0 0,0 9,5.5V7H4V9.12C5.76,9.8 7,11.5 7,13.5C7,15.5 5.75,17.2 4,17.88V20H6.12C6.8,18.25 8.5,17 10.5,17C12.5,17 14.2,18.25 14.88,20H17V15Z" /></svg>'
const mdiDatabaseOutline = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>database-outline</title><path d="M12 3C7.58 3 4 4.79 4 7V17C4 19.21 7.59 21 12 21S20 19.21 20 17V7C20 4.79 16.42 3 12 3M18 17C18 17.5 15.87 19 12 19S6 17.5 6 17V14.77C7.61 15.55 9.72 16 12 16S16.39 15.55 18 14.77V17M18 12.45C16.7 13.4 14.42 14 12 14C9.58 14 7.3 13.4 6 12.45V9.64C7.47 10.47 9.61 11 12 11C14.39 11 16.53 10.47 18 9.64V12.45M12 9C8.13 9 6 7.5 6 7S8.13 5 12 5C15.87 5 18 6.5 18 7S15.87 9 12 9Z" /></svg>'
const mdiImageMultiple = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>image-multiple</title><path d="M22,16V4A2,2 0 0,0 20,2H8A2,2 0 0,0 6,4V16A2,2 0 0,0 8,18H20A2,2 0 0,0 22,16M11,12L13.03,14.71L16,11L20,16H8M2,6V20A2,2 0 0,0 4,22H18V20H4V6" /></svg>'
const mdiPageNext = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>page-next</title><path d="M20,3H5A2,2 0 0,0 3,5V11H7V9L11,12L7,15V13H3V19A2,2 0 0,0 5,21H20A2,2 0 0,0 22,19V5A2,2 0 0,0 20,3M17,17H13V15H17V17M20,13H13V11H20V13M20,9H13V7H20V9M3,13H0V11H3V13Z" /></svg>'
const mdiNavigationVariant = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>navigation-variant</title><path d="M21 3L3 10.53V11.5L9.84 14.16L12.5 21H13.46L21 3Z" /></svg>'
const mdiCalendar = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>calendar</title><path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" /></svg>'
const mdiNewspaperVariant = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>newspaper-variant</title><path d="M20 3H4C2.89 3 2 3.89 2 5V19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V5C22 3.89 21.11 3 20 3M5 7H10V13H5V7M19 17H5V15H19V17M19 13H12V11H19V13M19 9H12V7H19V9Z" /></svg>'

/**
 * Single source of truth for the element types: each one is declared once with the
 * schema it comes from, its $defs key and its labels, inside its display group.
 * The oneOf branches and the oneOfItems keys are both derived from it, so the keys
 * always match the branch indices and a type can be inserted in its group freely.
 */
const groups = [
  {
    title: 'Basic elements',
    'x-i18n-title': { fr: 'Éléments de base' },
    icon: mdiShapeOutlineIcon,
    items: [
      { from: basics, def: 'element-title', title: 'Title', 'x-i18n-title': { fr: 'Titre' } },
      { from: basics, def: 'element-text', title: 'Text', 'x-i18n-title': { fr: 'Texte' } },
      { from: basics, def: 'element-alert', title: 'Accented text', 'x-i18n-title': { fr: 'Texte accentué' } },
      { from: basics, def: 'element-image', title: 'Image', 'x-i18n-title': { fr: 'Image' } },
      { from: basics, def: 'element-iframe', title: 'IFrame', 'x-i18n-title': { fr: 'IFrame' } },
      { from: basics, def: 'element-icon', title: 'Icon', 'x-i18n-title': { fr: 'Icône' } }
    ]
  },
  {
    title: 'Navigation elements',
    'x-i18n-title': { fr: 'Éléments de navigation' },
    icon: mdiNavigationVariant,
    items: [
      { from: navigation, def: 'element-button', title: 'Navigation button', 'x-i18n-title': { fr: 'Bouton de navigation' } },
      { from: navigation, def: 'element-menu', title: 'Navigation menu', 'x-i18n-title': { fr: 'Menu de navigation' } },
      { from: navigation, def: 'element-breadcrumbs', title: 'Breadcrumbs', 'x-i18n-title': { fr: 'Fil d\'Ariane' } }
    ]
  },
  {
    title: 'Layout & structure',
    'x-i18n-title': { fr: 'Mise en page & structure' },
    icon: mdiViewGridOutline,
    items: [
      { from: layout, def: 'element-divider', title: 'Divider', 'x-i18n-title': { fr: 'Séparateur horizontal' } },
      { from: layout, def: 'element-banner', title: 'Colored background section', 'x-i18n-title': { fr: 'Section sur fond coloré' } },
      { from: layout, def: 'element-card', title: 'Card', 'x-i18n-title': { fr: 'Boite' } },
      { from: layout, def: 'element-two-columns', title: 'Two columns', 'x-i18n-title': { fr: 'Deux colonnes' } },
      { from: layout, def: 'element-responsive-grid', title: 'Responsive Grid', 'x-i18n-title': { fr: 'Grille responsive' } },
      { from: layout, def: 'element-tabs', title: 'Tabs', 'x-i18n-title': { fr: 'Onglets' } },
      { from: layout, def: 'element-expansion-panels', title: 'Expansion panels', 'x-i18n-title': { fr: 'Accordéons' } }
    ]
  },
  {
    title: 'Functional blocks',
    'x-i18n-title': { fr: 'Blocs fonctionnels' },
    icon: mdiPuzzleOutline,
    items: [
      { from: functional, def: 'element-search', title: 'Search', 'x-i18n-title': { fr: 'Barre de recherche' } },
      { from: functional, def: 'element-topics', title: 'Topics list', 'x-i18n-title': { fr: 'Liste de thématiques' } },
      { from: functional, def: 'element-metrics', title: 'Key metrics (deprecated)', 'x-i18n-title': { fr: 'Chiffres clés (déprécié)' } },
      { from: functional, def: 'element-contact', title: 'Contact form', 'x-i18n-title': { fr: 'Formulaire de contact' } },
      { from: functional, def: 'element-custom-agent', title: 'Custom AI assistant (beta)', 'x-i18n-title': { fr: 'Assistant IA personnalisé (bêta)' } }
    ]
  },
  {
    title: 'Datasets',
    'x-i18n-title': { fr: 'Jeux de données' },
    icon: mdiDatabaseOutline,
    items: [
      { from: datasets, def: 'element-datasets-catalog', title: 'Datasets catalog', 'x-i18n-title': { fr: 'Catalogue de données' } },
      { from: datasets, def: 'element-datasets-list', title: 'Datasets list', 'x-i18n-title': { fr: 'Liste de jeux de données' } },
      { from: datasets, def: 'element-dataset-card', title: 'Dataset card', 'x-i18n-title': { fr: "Vignette d'un jeu de données" } },
      { from: datasets, def: 'element-dataset-table', title: 'Dataset table', 'x-i18n-title': { fr: "Tableau d'un jeu de données" } },
      { from: datasets, def: 'element-dataset-form', title: 'Dataset form', 'x-i18n-title': { fr: "Formulaire d'un jeu de données" } },
      { from: datasets, def: 'element-dataset-download', title: 'Dataset download', 'x-i18n-title': { fr: "Téléchargement d'un jeu de données" } }
    ]
  },
  {
    title: 'Applications',
    'x-i18n-title': { fr: 'Visualisations' },
    icon: mdiImageMultiple,
    items: [
      { from: applications, def: 'element-applications-catalog', title: 'Applications catalog', 'x-i18n-title': { fr: 'Catalogue de visualisations' } },
      { from: applications, def: 'element-applications-list', title: 'Applications list', 'x-i18n-title': { fr: 'Liste de visualisations' } },
      { from: applications, def: 'element-application', title: 'Application', 'x-i18n-title': { fr: 'Visualisation' } }
    ]
  },
  {
    title: 'Reuses',
    'x-i18n-title': { fr: 'Réutilisations' },
    icon: mdiPageNext,
    items: [
      { from: reuses, def: 'element-reuses-catalog', title: 'Reuses catalog', 'x-i18n-title': { fr: 'Catalogue de réutilisations' } },
      { from: reuses, def: 'element-reuses-list', title: 'Reuses list', 'x-i18n-title': { fr: 'Liste de réutilisations' } },
      { from: reuses, def: 'element-reuse-card', title: 'Reuse card', 'x-i18n-title': { fr: 'Vignette de réutilisation' } }
    ]
  },
  {
    title: 'Events',
    'x-i18n-title': { fr: 'Événements' },
    icon: mdiCalendar,
    items: [
      { from: events, def: 'element-event-catalog', title: 'Events catalog', 'x-i18n-title': { fr: "Catalogue d'événements" } },
      { from: events, def: 'element-event-list', title: 'Events list', 'x-i18n-title': { fr: "Liste d'événements" } },
      { from: events, def: 'element-event-card', title: 'Event card', 'x-i18n-title': { fr: "Vignette d'événement" } }
    ]
  },
  {
    title: 'News',
    'x-i18n-title': { fr: 'Actualité' },
    icon: mdiNewspaperVariant,
    items: [
      { from: news, def: 'element-news-catalog', title: 'News catalog', 'x-i18n-title': { fr: "Catalogue d'actualités" } },
      { from: news, def: 'element-news-list', title: 'News list', 'x-i18n-title': { fr: "Liste d'actualités" } },
      { from: news, def: 'element-news-card', title: 'News card', 'x-i18n-title': { fr: "Vignette d'actualité" } }
    ]
  }
]

const oneOf = groups.flatMap(group => group.items.map(item => branch(item.from, item.def)))
const oneOfItems = groups.flatMap((group, groupIndex) => {
  const offset = groups.slice(0, groupIndex).reduce((total, previous) => total + previous.items.length, 0)
  return [
    { header: true, title: group.title, 'x-i18n-title': group['x-i18n-title'], icon: group.icon },
    ...group.items.map((item, itemIndex) => ({ key: offset + itemIndex, title: item.title, 'x-i18n-title': item['x-i18n-title'] }))
  ]
})

export default {
  $id: 'https://github.com/data-fair/portals/page-elements',
  'x-exports': ['types', 'vjsf'],
  'x-jstt': { additionalProperties: false },
  'x-vjsf': {
    pluginsImports: ['@koumoul/vjsf-markdown'],
    xI18n: true,
    // the oneOf of $defs/element is a large discriminated union, validating it against
    // every branch costs seconds when the page editor builds its state tree
    ajvOptions: { discriminator: true }
  },
  'x-vjsf-locales': ['en', 'fr'],
  title: 'Page elements',
  type: 'array',
  layout: {
    title: '',
    clipboardKey: 'elements',
    listEditMode: 'dialog',
    listActions: ['add', 'edit', 'delete', 'sort', 'duplicate', 'insertAfter', 'copy', 'paste'],
    itemCopy: "{...item, uuid: crypto.randomUUID().split('-')[0]}"
  },
  items: {
    $ref: '#/$defs/element'
  },
  $defs: {
    element: {
      title: 'Page element',
      type: 'object',
      layout: {
        switch: [
          { if: 'summary', slots: { component: 'page-preview-element' } }
        ],
        getDefaultData: "{ uuid: crypto.randomUUID().split('-')[0], type: 'text' }"
      },
      oneOfLayout: {
        label: 'Type of element',
        'x-i18n-label': {
          fr: "Type d'élément"
        },
        autocomplete: true,
        oneOfItems
      },
      discriminator: { propertyName: 'type' },
      oneOf
    }
  }
}
