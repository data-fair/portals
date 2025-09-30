import type { Ref } from 'vue'
import { watchIgnorable } from '@vueuse/core'
import { useHotkey } from 'vuetify'
import equal from 'fast-deep-equal'

function useChangesStack<Type> (modelValue: Ref<Type>) {
  let stack: Type[] = []
  const index = ref(-1)
  const size = ref(0)

  const { ignoreUpdates } = watchIgnorable(modelValue, (newValue, oldValue) => {
    if (!newValue) return
    if (equal(newValue, oldValue)) return
    stack = stack.slice(0, index.value + 1).concat([newValue])
    index.value++
    size.value = stack.length
  }, { immediate: true })

  const update = () => {
    ignoreUpdates(() => {
      modelValue.value = stack[index.value]
    })
  }

  const canUndo = computed(() => index.value > 0)

  const undo = () => {
    if (!canUndo.value) return
    index.value--
    update()
  }

  const canRedo = computed(() => index.value + 1 < size.value)

  const redo = () => {
    if (!canRedo.value) return
    index.value++
    update()
  }

  const reset = () => {
    stack = [modelValue.value]
    index.value = 0
    size.value = 1
  }

  const summary = computed(() => {
    return `size=${size.value}, index=${index.value}, canUndo=${canUndo.value}, canRedo=${canRedo.value}`
  })

  useHotkey('cmd+z', () => undo())
  useHotkey('cmd+shift+z', () => redo())

  return { index, size, canUndo, undo, canRedo, redo, reset, summary }
}

export default useChangesStack
