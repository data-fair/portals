import { toValue, type MaybeRefOrGetter } from 'vue'
import { useAgentState } from '@data-fair/lib-vue-agents'
import { editorGuidance, draftState, type EditorKind } from '~/utils/agent-editor-guidance'

/**
 * Publish to the agent chat what an editor is and whether its draft is published.
 * Host state, not a hidden prompt: it reaches every request, whether or not the
 * person used the « Aide-moi à configurer… » action. See utils/agent-editor-guidance.ts.
 */
export function useEditorAgentState (kind: EditorKind, hasDraftDiff: MaybeRefOrGetter<boolean>) {
  for (const [key, text] of Object.entries(editorGuidance(kind))) useAgentState(key, text)
  useAgentState('draft', () => draftState(toValue(hasDraftDiff)))
}
