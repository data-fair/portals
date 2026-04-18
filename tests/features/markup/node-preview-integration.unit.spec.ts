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
