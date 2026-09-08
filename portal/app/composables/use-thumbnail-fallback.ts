import { computed, onMounted, ref, watch, type Ref } from 'vue'

// Sources that failed once in this tab. A capture data-fair cannot generate is tried
// twice server-side with a 4s pause, then answers Cache-Control: no-cache, so without
// this every card and every refresh pays that wait again. Only ever written from a DOM
// error handler, so it stays empty on the server and leaks nothing between SSR requests.
const failedUrls = new Set<string>()

/**
 * Walks `candidates` in order, moving on as soon as the browser reports the current
 * one failed. `background-image` emits no error event, so the left location has to
 * feed this from a hidden `<img>` probe.
 */
export function useThumbnailFallback (candidates: Ref<string[]>) {
  const index = ref(0)

  const nextUsable = (from: number) => {
    let i = from
    while (i < candidates.value.length && failedUrls.has(candidates.value[i]!)) i++
    return i
  }

  // compare the content: the computed feeding this rebuilds a new array on every
  // re-evaluation, so watching the reference would restart the cascade — and retry the
  // source that just failed — on any unrelated dependency change
  watch(() => candidates.value.join('\n'), () => { index.value = nextUsable(0) })

  // applied after hydration only, so the first client render matches the server html
  onMounted(() => { index.value = nextUsable(0) })

  const currentThumbnailUrl = computed(() => candidates.value[index.value])

  const onThumbnailError = () => {
    const failed = candidates.value[index.value]
    if (!failed) return
    failedUrls.add(failed)
    index.value = nextUsable(index.value + 1)
  }

  return { currentThumbnailUrl, onThumbnailError }
}
