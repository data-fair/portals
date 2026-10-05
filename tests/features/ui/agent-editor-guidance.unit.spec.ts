import { test, expect } from '@playwright/test'
// lib-vue-agents is a workspace dependency of ui/, not of the root where tests run
import { EVENT_DETAIL_MAX_CHARS } from '../../../ui/node_modules/@data-fair/lib-vue-agents/host-events.js'
import { editorGuidance, draftState, draftSaveState, formCompletenessState, pagePublicationState, pageDraftValidatedDetail, PAGE_CREATION_GUIDANCE as STEPS, PAGE_CREATION_AFTER, PAGES_LIST_GUIDANCE, pageCreationStep } from '../../../ui/src/utils/agent-editor-guidance.ts'

// Judged simulations showed the assistant, in both editors, inventing an
// « Enregistrer » button or an « Actions ⋮ » menu, never knowing that edits land in
// a draft, and never finding where the portal menu is edited. These texts are what
// the editors now publish to the chat as host state.
test.describe('agent editor guidance', () => {
  test('page editor guidance explains the draft and hands validation to the person', () => {
    const text = Object.values(editorGuidance('page')).join('\n')
    expect(text).toContain('pageConfig_form')
    expect(text).toContain('« Valider le brouillon »')
    expect(text).toContain('wait_for_user_action')
    // the published page, not the draft: never promise it shows the edits
    expect(text).toContain('published page')
    // the menu lives in the portal editor, not in the page form
    expect(text).toContain('« Barre de navigation »')
    expect(text).toContain('portalConfig_form')
    // the menu hint was read as an order: unprompted offers to edit the menu
    expect(text).toContain('only if the person wants this page in the menu')
    // the datasets list block defaults to the 3 latest datasets
    expect(text).toContain('« Catalogue de données »')
  })

  test('portal editor guidance names its sub-agent, the menu and the draft preview', () => {
    const text = Object.values(editorGuidance('portal')).join('\n')
    expect(text).toContain('portalConfig_form')
    expect(text).toContain('« Page libre »')
    // a catalog page (events, datasets, …) is a « Page standard » item with its « Type de page »:
    // an after-fix run looked for an events catalog under « Page libre » and never found it
    expect(text).toContain('« Page standard (Accueil, Contact,...) »')
    expect(text).toContain('« Catalogue d\'événements »')
    expect(text).toContain('« Voir le brouillon »')
    // a run sent the person to the new tab twice; what convinced them was the editor itself
    expect(text).toContain('« Aperçu - Entête & Barre de navigation »')
    // a run placed that preview « en haut à droite »: it is under a tab the person must open
    expect(text).toContain('« Aperçu - Entête & Barre de navigation » under the « Barre de navigation » tab')
    expect(text).toContain('« Valider le brouillon »')
    expect(text).toContain('wait_for_user_action')
    // the portal editor's own links: a run sent the person to the page editor's « Voir sur … »
    expect(text).toContain('« Visiter le portail »')
    // a new menu item is a « Lien non configuré » row whose type is chosen in its drop-down
    expect(text).toContain('« Lien non configuré »')
    // a catalog item without a label showed « Événement » in the menu, not the page's title
    expect(text).toContain('« Libellé »')
  })

  test('the page editor says what its previews show, and that validating does not publish on a portal', () => {
    const text = Object.values(editorGuidance('page')).join('\n')
    // a person asked for a preview with real datasets: the assistant knew nothing of the
    // « Portail de prévisualisation » selector, and the form sub-agent said it did not exist
    expect(text).toContain('« Portail de prévisualisation »')
    expect(text).toContain('no preview of the draft with real data')
    // a haiku run took « Valider le brouillon » for publishing the page on the portal
    expect(text).toContain('does not publish the page on a portal')
  })

  test('the draft-validated event of a page says whether it is on a portal', () => {
    // a haiku run took « Valider le brouillon » for publishing on the portal
    expect(pageDraftValidatedDetail('Agenda', []).note).toContain('published on no portal')
    expect(pageDraftValidatedDetail('Agenda', []).note).toContain('« Publications »')
    expect(pageDraftValidatedDetail('Agenda', ['Portail A'])).toEqual({ page: 'Agenda', publishedOn: 'Portail A' })
    expect(JSON.stringify(pageDraftValidatedDetail('Agenda', [])).length).toBeLessThanOrEqual(EVENT_DETAIL_MAX_CHARS)
  })

  test('a failed draft save is reported until a later save succeeds', () => {
    // a judged run's draft was refused by the API (400): the editor showed a red toast, the
    // assistant said « enregistré » three times and asked the person to copy the error
    expect(draftSaveState(undefined, false)).toBeUndefined()
    expect(draftSaveState('400 - body/draftConfig/elements/1 …', true)).toContain('NOT saved')
    expect(draftSaveState('400 - body/draftConfig/elements/1 …', true)).toContain('400 - body/draftConfig/elements/1')
    expect(draftSaveState(undefined, true)).toContain('saved again')
  })

  test('guiding a form section names the real options and gives every remaining step at once', () => {
    // judged runs guessed drop-down options three times in a row, and confirmed one click per
    // reply until the person ran out of patience with the menu item half configured
    for (const kind of ['page', 'portal'] as const) {
      const guiding = editorGuidance(kind)['editor-guiding']
      expect(guiding, kind).toContain('list the options of a drop-down')
      // three runs told the person a tab was open on the sub-agent's word: it cannot see the screen
      expect(guiding, kind).toContain('cannot see or change which tab is open')
      expect(guiding, kind).toContain('all the remaining steps in one reply')
      expect(guiding.length, kind).toBeLessThanOrEqual(EVENT_DETAIL_MAX_CHARS)
    }
  })

  test('the page editor guidance says where the draft preview is, and lets the person look first', () => {
    // a haiku run sent the person to an « Aperçu (brouillon) » tab « en haut de l'éditeur »
    const previews = editorGuidance('page')['editor-previews']
    expect(previews).toContain('The editor itself has no « Aperçu (brouillon) » tab')
    expect(previews).toContain('before asking them to validate')
    expect(previews.length).toBeLessThanOrEqual(EVENT_DETAIL_MAX_CHARS)
  })

  test('an incomplete form is reported: its change is not saved', () => {
    // adding a menu row leaves the portal form invalid; nothing said the change was not saved,
    // and a run lost it when the person left the editor
    expect(formCompletenessState(true, false)).toBeUndefined()
    // unknown while the form opens: not an incomplete form
    expect(formCompletenessState(null, false)).toBeUndefined()
    expect(formCompletenessState(false, true)).toContain('NOT saved')
    expect(formCompletenessState(false, true)).toContain('lost if the person leaves the editor')
    // a state cannot be withdrawn once published: it must say the form is complete again
    expect(formCompletenessState(true, true)).toContain('complete again')
  })

  test('the menu guidance says a free page must be published on the portal first', () => {
    for (const kind of ['page', 'portal'] as const) {
      expect(Object.values(editorGuidance(kind)).join('\n'), kind).toContain('only offers pages published on')
    }
  })

  test('the page editor says on which portals the page is published', () => {
    expect(pagePublicationState([])).toContain('published on no portal')
    expect(pagePublicationState([])).toContain('« Publications »')
    expect(pagePublicationState(['Portail de l\'agglomération'])).toBe('published on: Portail de l\'agglomération')
  })

  test('both editors ground click-by-click guidance in the form itself', () => {
    // a run guided by guessing the screen for three turns (a card heading to click, a
    // chooser that never appeared) although its sub-agent could describe the form
    for (const kind of ['page', 'portal'] as const) {
      const text = Object.values(editorGuidance(kind)).join('\n')
      expect(text, kind).toContain('never guess')
      expect(text, kind).toContain('describe the current state')
      // a run asked the form sub-agent where « Valider le brouillon » is: it cannot see the panel
      expect(text, kind).toContain('The actions panel is outside the form')
    }
  })

  test('page creation guidance walks the wizard and keeps the menu out of it', () => {
    const PAGE_CREATION_GUIDANCE = STEPS + '\n' + PAGE_CREATION_AFTER
    expect(PAGE_CREATION_GUIDANCE).toContain('« Page libre »')
    expect(PAGE_CREATION_GUIDANCE).toContain('« Créer »')
    // haiku took the page group for the portal menu for four turns
    expect(PAGE_CREATION_GUIDANCE).toContain('not the portal menu')
    // a created page has no draft to validate (its draft equals its config): a run told to
    // validate it first found the button disabled and went adding content instead
    expect(PAGE_CREATION_GUIDANCE).toContain('nothing to validate')
    // but it is published on no portal: the « Page libre » menu picker only offers pages
    // published on that portal, and a run could not find the page it had just created
    expect(PAGE_CREATION_GUIDANCE).toContain('published on no portal')
    expect(PAGE_CREATION_GUIDANCE).toContain('« Publications »')
    // a catalog page is created with content: a run told the person their new events
    // catalog was empty and could not be published
    expect(PAGE_CREATION_GUIDANCE).toContain('catalog pages are created with their content')
    // clicking a card moves on, « Suivant » stays disabled
    expect(PAGE_CREATION_GUIDANCE).toContain('moves to the next step')
    expect(PAGE_CREATION_GUIDANCE).toContain('« Page standard (Accueil, Contact,...) »')
    // catalog pages have their own cards: the guidance used to file them under « Page libre »
    expect(PAGE_CREATION_GUIDANCE).toContain('« Pages de catalogues »')
    expect(PAGE_CREATION_GUIDANCE).toContain('« Catalogue d\'événements »')
    expect(PAGE_CREATION_GUIDANCE).not.toContain('or catalog pages that list')
    // the editor that opens is titled « Édition du brouillon »: a run that announced « no
    // draft » was contradicted by the screen
    expect(PAGE_CREATION_GUIDANCE).toContain('« Édition du brouillon »')
    expect(STEPS.length).toBeLessThanOrEqual(EVENT_DETAIL_MAX_CHARS)
    expect(PAGE_CREATION_AFTER.length).toBeLessThanOrEqual(EVENT_DETAIL_MAX_CHARS)
    expect(pageCreationStep('group')).toContain('« Groupe »')
    expect(pageCreationStep('information')).toContain('« Créer »')
  })

  test('pages list guidance points to the creation wizard', () => {
    // on the pages list the assistant knew nothing of the wizard and invented a « + » button,
    // a portal choice and a publish step in its first reply
    expect(PAGES_LIST_GUIDANCE).toContain('« Créer une nouvelle page »')
    expect(PAGES_LIST_GUIDANCE).toContain('wizard')
    expect(PAGES_LIST_GUIDANCE.length).toBeLessThanOrEqual(EVENT_DETAIL_MAX_CHARS)
  })

  test('every published text fits a host event without truncation', () => {
    for (const kind of ['page', 'portal'] as const) {
      for (const [key, text] of Object.entries(editorGuidance(kind))) {
        expect(text.length, `${kind}/${key}`).toBeLessThanOrEqual(EVENT_DETAIL_MAX_CHARS)
      }
    }
  })

  test('draft state says whether unpublished changes are waiting', () => {
    expect(draftState(true)).toBe('unpublished changes: the person must press « Valider le brouillon » to publish them')
    // « what the editor shows is published » read as « the page is online », next to a
    // page published on no portal
    expect(draftState(false)).toBe('no unpublished changes: the draft equals the saved configuration')
  })
})
