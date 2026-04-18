import { JSDOM } from 'jsdom'

/**
 * Installs a fresh JSDOM on globalThis for the duration of `fn`, restores
 * previous globals in a finally block. Each call creates a new JSDOM —
 * patches on `dom.window` are discarded with it, so only globals need to be
 * saved/restored.
 */
export function withDom (fn: () => void): void {
  const dom = new JSDOM('<!doctype html><html><body></body></html>')
  const globalAny = globalThis as any
  const prev = {
    window: globalAny.window,
    document: globalAny.document,
    HTMLElement: globalAny.HTMLElement,
    Node: globalAny.Node,
    MutationObserver: globalAny.MutationObserver,
    getComputedStyle: globalAny.getComputedStyle,
    requestAnimationFrame: globalAny.requestAnimationFrame,
    cancelAnimationFrame: globalAny.cancelAnimationFrame
  }
  globalAny.window = dom.window
  globalAny.document = dom.window.document
  globalAny.HTMLElement = dom.window.HTMLElement
  globalAny.Node = dom.window.Node
  globalAny.MutationObserver = dom.window.MutationObserver
  globalAny.getComputedStyle = dom.window.getComputedStyle
  globalAny.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0)
  globalAny.cancelAnimationFrame = clearTimeout
  // Patch window's methods too since EditorView accesses them via this.win
  dom.window.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0) as any
  dom.window.cancelAnimationFrame = clearTimeout as any
  try {
    fn()
  } finally {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete globalAny[k]
      else globalAny[k] = v
    }
  }
}
