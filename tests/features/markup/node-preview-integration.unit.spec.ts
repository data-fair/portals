import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import {
  portalMarkupNodePreviewWidgets,
  toggleNodePreview,
  nodePreviewState
} from '../../../shared/markup/codemirror/node-preview-widgets.ts'
import { withDom } from './helpers/with-dom.ts'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'

interface MountCall { container: HTMLElement, elementPointer: string, unmount: () => void }

function countPreviewWidgets (view: EditorView): number {
  return view.dom.querySelectorAll('.markup-node-preview-widget').length
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

test.describe('node-preview widget plugin', () => {
  test('mounts a preview widget when the pointer is toggled on, unmounts on toggle off', () => {
    withDom(() => {
      const mounts: MountCall[] = []
      const unmounts: string[] = []
      const view = new EditorView({
        state: EditorState.create({
          doc: '<title titleSize="h2">Hi</title>',
          extensions: portalMarkupNodePreviewWidgets({
            mountPreview: (container, { elementPointer }) => {
              const unmount = () => { unmounts.push(elementPointer) }
              mounts.push({ container, elementPointer, unmount })
              return unmount
            }
          })
        }),
        parent: document.body
      })
      try {
        assert.equal(countPreviewWidgets(view), 0)
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        assert.equal(mounts.length, 1)
        assert.equal(mounts[0].elementPointer, '/0')
        assert.equal(countPreviewWidgets(view), 1)
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        assert.equal(unmounts.length, 1)
        assert.equal(countPreviewWidgets(view), 0)
      } finally {
        view.destroy()
      }
    })
  })

  test('preserves the mounted widget when an unrelated edit shifts the element offset', () => {
    withDom(() => {
      let mountCount = 0
      let unmountCount = 0
      const view = new EditorView({
        state: EditorState.create({
          doc: '<title titleSize="h2">Hi</title>',
          extensions: portalMarkupNodePreviewWidgets({
            mountPreview: () => { mountCount++; return () => { unmountCount++ } }
          })
        }),
        parent: document.body
      })
      try {
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        assert.equal(mountCount, 1)
        // Prepend whitespace, shifting every offset — the widget should
        // relocate via `eq()` matching without re-mounting.
        view.dispatch({ changes: { from: 0, insert: '\n' } })
        assert.equal(mountCount, 1, 'mount must not be called again')
        assert.equal(unmountCount, 0, 'unmount must not fire')
      } finally {
        view.destroy()
      }
    })
  })

  test('unmounts the widget when the toggled element is removed from the document', () => {
    withDom(() => {
      let unmountCount = 0
      const view = new EditorView({
        state: EditorState.create({
          doc: '<title titleSize="h2">Hi</title>',
          extensions: portalMarkupNodePreviewWidgets({
            mountPreview: () => () => { unmountCount++ }
          })
        }),
        parent: document.body
      })
      try {
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        assert.equal(countPreviewWidgets(view), 1)
        // Delete the entire element text.
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: '' } })
        assert.equal(unmountCount, 1)
        assert.equal(countPreviewWidgets(view), 0)
      } finally {
        view.destroy()
      }
    })
  })

  test('keeps existing widgets visible during a transient parse failure', () => {
    withDom(() => {
      let unmountCount = 0
      const view = new EditorView({
        state: EditorState.create({
          doc: '<title titleSize="h2">Hi</title>',
          extensions: portalMarkupNodePreviewWidgets({
            mountPreview: () => () => { unmountCount++ }
          })
        }),
        parent: document.body
      })
      try {
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        assert.equal(countPreviewWidgets(view), 1)
        // Break parsing briefly by smashing the tag name/attrs into a
        // garbage sequence that the deserializer can't recover from. The
        // change is narrow so the widget's original offset survives
        // CM6's tile-cache mapping, letting us assert no remount.
        // (The deserializer is tolerant: only clearly non-tag starts like
        // this yield an empty byElementPointer map.)
        view.dispatch({
          changes: { from: 1, to: 21, insert: '!!!!!' }
        })
        // Sanity: deserializer now reports errors / no element pointers.
        const sm = deserializeElements(view.state.doc.toString()).sourceMap
        assert.equal(sm.byElementPointer.size, 0)
        // The widget must still be in the DOM and must not have unmounted.
        assert.equal(countPreviewWidgets(view), 1)
        assert.equal(unmountCount, 0)
      } finally {
        view.destroy()
      }
    })
  })
})

test.describe('node-preview gutter', () => {
  test('renders one gutter marker per element open-tag line', () => {
    withDom(() => {
      const view = new EditorView({
        state: EditorState.create({
          doc: [
            '<title titleSize="h2">A</title>',
            '<text>B</text>',
            '<divider />'
          ].join('\n'),
          extensions: portalMarkupNodePreviewWidgets({ mountPreview: () => () => {} })
        }),
        parent: document.body
      })
      try {
        const markers = view.dom.querySelectorAll('.cm-gutter-node-preview button')
        assert.equal(markers.length, 3)
      } finally {
        view.destroy()
      }
    })
  })

  test('clicking a gutter marker dispatches toggleNodePreview for that pointer', () => {
    withDom(() => {
      const view = new EditorView({
        state: EditorState.create({
          doc: '<title titleSize="h2">A</title>\n<text>B</text>',
          extensions: portalMarkupNodePreviewWidgets({ mountPreview: () => () => {} })
        }),
        parent: document.body
      })
      try {
        const markers = Array.from(
          view.dom.querySelectorAll('.cm-gutter-node-preview button')
        ) as HTMLButtonElement[]
        assert.equal(markers.length, 2)
        assert.equal(markers[0].getAttribute('data-markup-preview-pointer'), '/0')
        assert.equal(markers[1].getAttribute('data-markup-preview-pointer'), '/1')
        markers[1].dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true }))
        const toggled = view.state.field(nodePreviewState)
        assert.ok(toggled.has('/1'))
        assert.ok(!toggled.has('/0'))
      } finally {
        view.destroy()
      }
    })
  })

  test('marker reflects the toggled-on state via a CSS class', () => {
    withDom(() => {
      const view = new EditorView({
        state: EditorState.create({
          doc: '<title titleSize="h2">A</title>',
          extensions: portalMarkupNodePreviewWidgets({ mountPreview: () => () => {} })
        }),
        parent: document.body
      })
      try {
        const before = view.dom.querySelector('.cm-gutter-node-preview button')!
        assert.ok(!before.classList.contains('cm-gutter-node-preview-on'))
        view.dispatch({ effects: toggleNodePreview.of({ elementPointer: '/0' }) })
        const after = view.dom.querySelector('.cm-gutter-node-preview button')!
        assert.ok(after.classList.contains('cm-gutter-node-preview-on'))
      } finally {
        view.destroy()
      }
    })
  })
})
