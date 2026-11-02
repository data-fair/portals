import { ref, type Ref } from 'vue'
import { useLeaveGuard } from '@data-fair/lib-vue/leave-guard'

const messages: Record<string, string> = {
  fr: 'Votre dernière modification n\'est pas enregistrée : un champ obligatoire est vide (signalé en rouge). Quitter quand même ?',
  en: 'Your last change is not saved: a required field is empty (shown in red). Leave anyway?'
}

/**
 * An edit that leaves the form incomplete is not saved to the draft, and was lost without a
 * word when the person left the editor. Set by the editor when it skips a save, cleared once a
 * save goes through: a draft already incomplete when opened is not an unsaved edit.
 */
export function useUnsavedEditGuard (locale: Ref<string>) {
  const unsavedEdit = ref(false)
  // a getter: the guard reads its message when the person leaves, in the locale of that moment
  useLeaveGuard(unsavedEdit, { get message () { return messages[locale.value] ?? messages.en } })
  return unsavedEdit
}
