/**
 * What the page and portal editors tell the agent chat, as host state.
 *
 * Without it the assistant only knew the route: judged simulations had it invent an
 * « Enregistrer » button and an « Actions ⋮ » menu, promise previews it could not
 * see, and never find where the portal menu is edited. The hidden context of the
 * « Aide-moi à configurer… » action only reaches it when the person clicks that
 * action, so it is not enough on its own.
 *
 * Several keys rather than one text: a host event detail is capped at 1000
 * characters (EVENT_DETAIL_MAX_CHARS in @data-fair/lib-vue-agents) and a longer one
 * is truncated mid-sentence.
 *
 * Pure on purpose: unit-tested without a browser (tests/features/ui).
 */

export type EditorKind = 'page' | 'portal'

const DRAFT = 'Every change made by the form sub-agent or by the person is saved automatically to a DRAFT; the public portal only shows it once the person presses « Valider le brouillon » in the actions panel on the right of the editor (« Annuler le brouillon » discards the draft). You cannot press it: when the draft is ready, declare wait_for_user_action, its message telling the person to press « Valider le brouillon » on the right; the draft state tells you once it is published.'

const GUIDING = (subAgent: string) => `To guide the person click by click, first have the ${subAgent} sub-agent describe the form (open tab, labels, items) with readOnly: true and name only what it reports: never guess a label, a button or what a click will show. Before naming a choice, have it describe the options of a drop-down and what each one asks for: it can, even those not chosen. Its writes open the tab that holds what they change, and it reports what is now on screen: say where to look from that, never from a guess. To show the person a part of the form, ask it to open the tab rather than telling them where to click. For a section with several fields (a menu item: its type, then its page or page type, its label), give all the remaining steps in one reply, down to « Valider le brouillon », rather than one click per reply. If the person cannot find something after one try, offer to make the change with the sub-agent instead. The actions panel is outside the form: it is described here, not by the sub-agent.`

const GUIDANCE: Record<EditorKind, Record<string, string>> = {
  page: {
    editor: 'Portal page editor. Edit the page (title, description, blocks) with the pageConfig_form sub-agent. ' +
      'In the editor, lists of datasets, events or news are drawn as placeholders (« Dataset 1 », …): the real content only shows on the portal. The « Liste de jeux de données » block shows the 3 latest by default; for all published datasets use « Catalogue de données ». ' +
      'The « Voir sur … » link in the actions panel opens the published page in a new tab, so it does not show unpublished changes. ' +
      'Pages have no topic (thématique). The page title and description show only in the editor\'s fields: not in the draft preview, nor in the breadcrumb until the draft is validated.',
    'editor-drafts': DRAFT,
    'editor-guiding': GUIDING('pageConfig_form'),
    'editor-previews': 'The editor itself has no « Aperçu (brouillon) » tab: the person sees the draft in the editor. That tab is in the page view (the page title in the breadcrumb). Both draw lists of datasets, events or news as placeholders; the « Portail de prévisualisation » selector of the actions panel only picks which portal\'s look these previews take. There is no preview of the draft with real data: real content only shows on the portal once the draft is validated and the page is published there. ' +
      'If the person wants to see the result first, tell them where it shows and wait for their go-ahead before asking them to validate. ' +
      'Validating the draft does not publish the page on a portal: that is the « Publié » switch of the page\'s « Publications » tab (see the publication state).',
    'editor-menu': 'The portal menu is not edited here: it is in the portal editor (« Portails » in the group « Gestion de l\'organisation » of the left column, collapsed: open it, or take the person there with navigate; then the portal, tab « Barre de navigation », card « Éléments du menu de navigation »), with its own portalConfig_form sub-agent. Go there only if the person wants this page in the menu, once the page is published on that portal (see the publication state): the « Page libre » menu item only offers pages published on that portal.'
  },
  portal: {
    editor: 'Portal editor. Edit the portal configuration (theme and colours in « Apparence », menu in « Barre de navigation » > « Éléments du menu de navigation », header, footer, …) with the portalConfig_form sub-agent, not with application tools. ' +
      'To put an existing page in the menu, add a menu item: a free page is a « Page libre » item, picked among the suggestions; a catalog page (« Catalogue de données », « Catalogue d\'événements », « Catalogue d\'actualités », …) or a standard page (contact, legal notice, …) is a « Page standard (Accueil, Contact,...) » item with its « Type de page ». ' +
      'The editor shows changes at once, and the sub-agent\'s writes open the tab that holds them: colours in « Apparence » > « Couleurs », the menu and its preview « Aperçu - Entête & Barre de navigation » in « Barre de navigation ». Tell the person which part of that tab to look at.',
    'editor-drafts': DRAFT,
    'editor-guiding': GUIDING('portalConfig_form'),
    'editor-links': 'Actions panel links of this editor: « Voir le brouillon » opens the whole draft portal in a new tab, « Visiter le portail » the published portal (« Voir sur … » belongs to the page editor). ' +
      'In « Éléments du menu de navigation », « Ajouter un lien » adds a « Lien non configuré » row whose type is chosen in its « Type de lien » drop-down; give a catalog page item a « Libellé » (the page title), or the menu shows a generic one (« Événement »). The page list of a « Page libre » item only offers pages published on this portal: a page missing there must first be published, in the « Publications » tab of the page.'
  }
}

export function editorGuidance (kind: EditorKind): Record<string, string> {
  return GUIDANCE[kind]
}

export function draftState (hasDraftDiff: boolean): string {
  return hasDraftDiff
    ? 'unpublished changes: the person must press « Valider le brouillon » to publish them'
    : 'no unpublished changes: the draft equals the saved configuration'
}

/**
 * Whether the draft could be saved. Absent until a save fails: a judged run's draft was
 * refused by the API, the editor showed a red toast, and the assistant said « enregistré »
 * three times and asked the person to copy the error.
 */
export function draftSaveState (error: string | undefined, hadFailure: boolean): string | undefined {
  if (error) return `the last change is NOT saved: the draft was refused (${error.slice(0, 300)}). Tell the person, and fix or undo the change with the form sub-agent`
  if (hadFailure) return 'the draft is saved again'
  return undefined
}

/**
 * Whether the form is complete. An incomplete one (a required field empty, as in a menu row
 * just added) is not saved: the draft keeps the last complete state. A judged run lost a
 * half-configured menu item when the person left the editor, and nothing had said so.
 */
export function formCompletenessState (valid: boolean | null, hadIncomplete: boolean): string | undefined {
  // null: v-form has not checked every field yet, as while the form opens
  if (valid === false) return 'the form is incomplete (a required field is empty): its last change is NOT saved, the draft keeps the last complete state, and the change is lost if the person leaves the editor. Have the form sub-agent find and fill the missing field'
  if (hadIncomplete) return 'the form is complete again: its changes are saved to the draft'
  return undefined
}

/** On which portals the open page is published: a new page is on none, and cannot be put in a portal menu yet. */
export function pagePublicationState (portalTitles: string[]): string {
  return portalTitles.length
    ? `published on: ${portalTitles.join(', ')}`
    : 'published on no portal: the person publishes it in the « Publications » tab of the page (its title in the breadcrumb, then the « Publié » switch of the portal); an empty page cannot be published'
}

/**
 * Detail of the draft-validated event of a page. Validating a draft does not publish the page
 * on a portal: a haiku run announced « publiée et active sur le portail » from this event, the
 * guidance saying otherwise being many turns back. The event says it where it matters.
 */
export function pageDraftValidatedDetail (title: string | undefined, portalTitles: string[]): Record<string, string> {
  return portalTitles.length
    ? { page: title ?? '', publishedOn: portalTitles.join(', ') }
    : { page: title ?? '', note: 'validated, but published on no portal: not visible on any portal until the person turns on « Publié » in the « Publications » tab of the page' }
}

/** The pages list (/pages): without it the first reply invented a creation flow. */
export const PAGES_LIST_GUIDANCE = 'Pages list of the portals back-office. No tool creates or edits a page from here: the « Créer une nouvelle page » action in the actions panel on the right opens a creation wizard (its steps are described once it is open); clicking a page opens its editor. The portal menu is not edited with the pages: a page published on a portal goes in its menu from the portal editor (« Portails » in the group « Gestion de l\'organisation » of the left column, collapsed: open it, or take the person there with navigate; then the portal, tab « Barre de navigation »).'

/** The page creation wizard (/pages/new): the person clicks through it, nothing creates a page for them. */
export const PAGE_CREATION_GUIDANCE = 'Page creation wizard. No tool creates a page: the person clicks through the steps and you tell them what to choose; clicking a card moves to the next step by itself (« Suivant » stays disabled). ' +
  'Steps: « Type de page »: « Page libre » for free content built from blocks, « Pages institutionnelles » (contact, legal notice, …) or « Pages de catalogues » (« Catalogue de données », « Catalogue d\'événements », « Catalogue d\'actualités », …, listing their contents automatically); ' +
  '« Groupe », for a free page only (it sorts pages in this back-office list, not the portal menu; « Aucun groupe » is fine); ' +
  '« Choisir une source » (« Page blanche », a reference template or « Dupliquer une page existante »; skipped when a blank page is the only source); then « Informations » (title, owner) and « Créer ».'

/** What follows « Créer », a key of its own: a host event detail is capped at 1000 characters. */
export const PAGE_CREATION_AFTER = 'After « Créer » the page editor opens, titled « Édition du brouillon » because edits always go to a draft first; a new page has nothing to validate until something changes. ' +
  'A new page is published on no portal. The person publishes it in the « Publications » tab of the page (its title in the breadcrumb, then the « Publié » switch of the portal); a blank free page needs content first (an empty page cannot be published), catalog pages are created with their content. ' +
  'Only then can it go in the portal menu, in the portal editor: a free page is a « Page libre » item, a catalog page a « Page standard (Accueil, Contact,...) » item of its type.'

const STEP_NAMES: Record<string, string> = {
  type: '« Type de page »',
  group: '« Groupe »',
  action: '« Choisir une source »',
  source: 'choosing the template or page to copy',
  information: '« Informations », the last step before the « Créer » button'
}

export function pageCreationStep (step: string): string {
  return `current step: ${STEP_NAMES[step] ?? step}`
}
