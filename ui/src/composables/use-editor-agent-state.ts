import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useAgentState } from '@data-fair/lib-vue-agents'
import { editorGuidance, draftState, draftSaveState, type EditorKind } from '~/utils/agent-editor-guidance'

/**
 * Publish to the agent chat what an editor is and whether its draft is published.
 * Host state, not a hidden prompt: it reaches every request, whether or not the
 * person used the « Aide-moi à configurer… » action. See utils/agent-editor-guidance.ts.
 */
export function useEditorAgentState (kind: EditorKind, hasDraftDiff: MaybeRefOrGetter<boolean>, saveError?: MaybeRefOrGetter<string | undefined>) {
  for (const [key, text] of Object.entries(editorGuidance(kind))) useAgentState(key, text)
  useAgentState('draft', () => draftState(toValue(hasDraftDiff)))
  // a draft save the API refused: the form still looks fine, only a toast said otherwise
  const hadFailure = ref(false)
  watch(() => toValue(saveError), (error) => { if (error) hadFailure.value = true })
  useAgentState('draft-save', () => draftSaveState(toValue(saveError), hadFailure.value))
}
