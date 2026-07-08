export const usePrefersReducedMotion = () => {
  const reduced = shallowRef(false)
  if (typeof window !== 'undefined') {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = mq.matches
    const onChange = (e: MediaQueryListEvent) => { reduced.value = e.matches }
    mq.addEventListener('change', onChange)
    onScopeDispose(() => mq.removeEventListener('change', onChange), true)
  }
  return reduced
}
