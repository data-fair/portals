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

const GUIDANCE: Record<EditorKind, Record<string, string>> = {
  page: {
    editor: 'Portal page editor. Edit the page (title, description, blocks) with the pageConfig_form sub-agent. ' +
      'In the editor, lists of datasets, events or news are drawn as placeholders (« Dataset 1 », …): the real content only shows on the portal. The « Liste de jeux de données » block shows the 3 latest by default; for all published datasets use « Catalogue de données ». ' +
      'The « Voir sur … » link in the actions panel opens the published page in a new tab, so it does not show unpublished changes. ' +
      'Pages have no topic (thématique).',
    'editor-drafts': DRAFT,
    'editor-menu': 'The portal menu is not edited here: it is in the portal editor (back-office « Portails », then the portal, tab « Barre de navigation », card « Éléments du menu de navigation »), with its own portalConfig_form sub-agent. Go there only if the person wants this page in the menu, once it is published.'
  },
  portal: {
    editor: 'Portal editor. Edit the portal configuration (theme and colours in « Apparence », menu in « Barre de navigation » > « Éléments du menu de navigation », header, footer, …) with the portalConfig_form sub-agent, not with application tools. ' +
      'To put an existing page in the menu, add a menu item of the « Page libre » kind and pick the page among the suggestions; the page must be published first. ' +
      '« Voir le brouillon » in the actions panel opens the draft portal in a new tab: that is where the person sees unpublished changes.',
    'editor-drafts': DRAFT
  }
}

export function editorGuidance (kind: EditorKind): Record<string, string> {
  return GUIDANCE[kind]
}

export function draftState (hasDraftDiff: boolean): string {
  return hasDraftDiff
    ? 'unpublished changes: the person must press « Valider le brouillon » to publish them'
    : 'no unpublished changes: what the editor shows is published'
}

/** The page creation wizard (/pages/new): the person clicks through it, nothing creates a page for them. */
export const PAGE_CREATION_GUIDANCE = 'Page creation wizard. No tool creates a page: the person clicks through the steps and you tell them what to choose. ' +
  'Steps: « Type de page » (« Page libre » for free content, institutional pages, or catalog pages that list datasets, events or news automatically), ' +
  '« Groupe » for a free page (groups only sort pages in this back-office list, not the portal menu; « Aucun groupe » is fine), ' +
  'clicking a card moves to the next step by itself (« Suivant » stays disabled), ' +
  '« Choisir une source » (« Page blanche », a reference template, or « Dupliquer une page existante »), then « Informations » (title, owner) and the « Créer » button. ' +
  'The new page is created already published, with no draft to validate: to show it in the portal menu, go straight to the portal editor.'

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
