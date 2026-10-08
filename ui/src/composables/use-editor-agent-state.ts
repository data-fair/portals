import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useAgentState } from '@data-fair/lib-vue-agents'
import { editorGuidance, draftState, draftSaveState, formCompletenessState, type EditorKind } from '~/utils/agent-editor-guidance'

/**
 * Publish to the agent chat what an editor is and whether its draft is published.
 * Host state, not a hidden prompt: it reaches every request, whether or not the
 * person used the « Aide-moi à configurer… » action. See utils/agent-editor-guidance.ts.
 */
export function useEditorAgentState (kind: EditorKind, hasDraftDiff: MaybeRefOrGetter<boolean>, saveError?: MaybeRefOrGetter<string | undefined>, formValid?: MaybeRefOrGetter<boolean | null>) {
  for (const [key, text] of Object.entries(editorGuidance(kind))) useAgentState(key, text)
  useAgentState('draft', () => draftState(toValue(hasDraftDiff)))
  // a draft save the API refused: the form still looks fine, only a toast said otherwise
  const hadFailure = ref(false)
  watch(() => toValue(saveError), (error) => { if (error) hadFailure.value = true })
  useAgentState('draft-save', () => draftSaveState(toValue(saveError), hadFailure.value))
  // an incomplete form is not saved at all, and nothing else on screen says so to the chat
  if (formValid !== undefined) {
    const hadIncomplete = ref(false)
    watch(() => toValue(formValid), (valid) => { if (valid === false) hadIncomplete.value = true })
    useAgentState('form', () => formCompletenessState(toValue(formValid), hadIncomplete.value))
  }
}
