import { test, expect } from '@playwright/test'
// lib-vue-agents is a workspace dependency of ui/, not of the root where tests run
import { EVENT_DETAIL_MAX_CHARS } from '../../../ui/node_modules/@data-fair/lib-vue-agents/host-events.js'
import { editorGuidance, draftState, PAGE_CREATION_GUIDANCE, pageCreationStep } from '../../../ui/src/utils/agent-editor-guidance.ts'

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
    expect(text).toContain('« Valider le brouillon »')
    expect(text).toContain('wait_for_user_action')
  })

  test('page creation guidance walks the wizard and keeps the menu out of it', () => {
    expect(PAGE_CREATION_GUIDANCE).toContain('« Page libre »')
    expect(PAGE_CREATION_GUIDANCE).toContain('« Créer »')
    // haiku took the page group for the portal menu for four turns
    expect(PAGE_CREATION_GUIDANCE).toContain('not the portal menu')
    // a created page starts published (its draft equals its config): a run told to
    // validate it first found the button disabled and went adding content instead
    expect(PAGE_CREATION_GUIDANCE).toContain('already published')
    // clicking a card moves on, « Suivant » stays disabled
    expect(PAGE_CREATION_GUIDANCE).toContain('moves to the next step')
    expect(PAGE_CREATION_GUIDANCE).toContain('« Page standard (Accueil, Contact,...) »')
    expect(PAGE_CREATION_GUIDANCE.length).toBeLessThanOrEqual(EVENT_DETAIL_MAX_CHARS)
    expect(pageCreationStep('group')).toContain('« Groupe »')
    expect(pageCreationStep('information')).toContain('« Créer »')
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
    expect(draftState(false)).toBe('no unpublished changes: what the editor shows is published')
  })
})
