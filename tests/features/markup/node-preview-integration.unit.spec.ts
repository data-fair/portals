import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { JSDOM } from 'jsdom'
import {
  portalMarkupNodePreviewWidgets,
  toggleNodePreview,
  nodePreviewState
} from '../../../shared/markup/codemirror/node-preview-widgets.ts'

function withDom (fn: () => void) {
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

test.describe('node-preview state field', () => {
  test('starts empty, toggling adds pointer, toggling again removes it', () => {
    withDom(() => {
      const parent = document.body
      const view = new EditorView({
        state: EditorState.create({
          doc: '<title titleSize="h2">Hi</title>',
          extensions: portalMarkupNodePreviewWidgets({ mountPreview: () => () => {} })
        }),
        parent
      })
      try {
        assert.equal(view.state.field(nodePreviewState).size, 0)
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        assert.equal(view.state.field(nodePreviewState).size, 1)
        assert.ok(view.state.field(nodePreviewState).has('/0'))
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        assert.equal(view.state.field(nodePreviewState).size, 0)
      } finally {
        view.destroy()
      }
    })
  })
})
