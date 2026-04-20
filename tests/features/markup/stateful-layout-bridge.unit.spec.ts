/**
 * Integration-flavored unit tests that build a real StatefulLayout from the
 * compiled page-config schema and run the full markup-mode pipeline
 * end-to-end in Node. This exists so that bugs in how the StateNode tree,
 * the deserializer's source map, and the bridge helpers interact — like
 * "error visually anchored to the wrong tag" or "widget lookup misses its
 * node" — can be reproduced without a browser.
 *
 * We pass no `context.mode`, so the `/elements` `layout.switch` falls through
 * to its default (no slot) case — the elements array materializes normally,
 * which is what these tests need in order to walk per-element StateNodes.
 * In the real app edit-config.vue sets `context.mode = 'page-editor'` which
 * activates the slot delegation; WebMCP sets `mode = 'webmcp'`, also default.
 */
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
// @ts-ignore — generated, no .d.ts
import { StatefulLayout } from '@json-layout/core/state'
// @ts-ignore — generated, no .d.ts
import { compiledLayout } from '../../../api/types/page-config/.type/compiled-layout-fr.js'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'
import {
  collectErrorsByDataPath,
  findNodeByDataPath,
  toCmDiagnostic
} from '../../../shared/markup/codemirror/bridge.ts'

/**
 * Build a StatefulLayout rooted on the element sub-skeleton-tree — exactly
 * what markup-element-form-widget.vue does at runtime. This is the right
 * shape for verifying per-element StateNode materialization because the
 * outer page-config's default listEditMode renders list items in summary
 * mode (children unmaterialized); the inline form bypasses that by rooting
 * on the element directly.
 */
function buildElement (element: any) {
  const cl = compiledLayout as any
  const elementTreeKey = `${cl.mainTree}/properties/elements/items`
  return new StatefulLayout(
    cl,
    cl.skeletonTrees[elementTreeKey],
    {
      width: 600,
      updateOn: 'input',
      onData: () => {},
      context: { mode: 'markup-inline' }
    },
    element
  )
}

function errorsOnElement (sl: any) {
  return collectErrorsByDataPath(sl.stateTree.root)
}

test.describe('markup × StatefulLayout integration', () => {
  test('bare <image /> produces no error on the image element itself', () => {
    const sl = buildElement({ type: 'image' })
    const errors = errorsOnElement(sl)
    // The image element's `image` property is optional at the schema level
    // and its layout.if makes it visible but missing — we expect json-layout
    // NOT to flag it as an error. This is the behavior we rely on to
    // justify dropping the [0, 1] diagnostic fallback: there's simply
    // nothing to anchor.
    assert.equal(errors.length, 0, `expected no errors, got ${JSON.stringify(errors)}`)
  })

  test('image StateNode exists at /image even with no data', () => {
    const sl = buildElement({ type: 'image' })
    // The markup-image-widget component looks the node up via this path
    // (relative to the per-element root). If this ever returns null, the
    // inline widget would render nothing even though the plugin emitted a
    // decoration.
    const node = findNodeByDataPath<any>(sl.stateTree.root, '/image')
    assert.ok(node, 'expected /image to exist in the StateNode tree')
    assert.equal(node!.data, undefined)
  })

  test('layout.comp signals which image-upload group is active', () => {
    // Empirical fact: json-layout keeps the StateNode for every schema
    // property (image AND wideImage) regardless of layout.if. The active
    // branch has layout.comp === 'slot' with a populated slots.component;
    // the inactive branch has layout.comp === 'none'. The Vue widget uses
    // this signal to render only the visible one.
    const slNoBanner = buildElement({ type: 'image' })
    const imgNoBanner = findNodeByDataPath<any>(slNoBanner.stateTree.root, '/image')
    const wideNoBanner = findNodeByDataPath<any>(slNoBanner.stateTree.root, '/wideImage')
    assert.ok(imgNoBanner, 'image node exists regardless of visibility')
    assert.ok(wideNoBanner, 'wideImage node exists regardless of visibility')
    assert.equal((imgNoBanner as any).layout?.comp, 'slot', 'image active when banner unset')
    assert.equal((wideNoBanner as any).layout?.comp, 'none', 'wideImage inactive when banner unset')

    const slBanner = buildElement({ type: 'image', banner: true })
    const imgBanner = findNodeByDataPath<any>(slBanner.stateTree.root, '/image')
    const wideBanner = findNodeByDataPath<any>(slBanner.stateTree.root, '/wideImage')
    assert.equal((imgBanner as any).layout?.comp, 'none', 'image inactive when banner=true')
    assert.equal((wideBanner as any).layout?.comp, 'slot', 'wideImage active when banner=true')
  })

  test('per-element errors anchor inside the correct element tag', () => {
    // Synthetic error at /elements/1/titleSize, mapped through the markup
    // source map. This tests the bridge + source-map pipeline, not AJV
    // itself — AJV behavior for cross-schema $refs is exercised by the
    // round-trip tests and the e2e suite. Keeping it synthetic avoids
    // coupling this assertion to the precise set of errors AJV emits.
    const src = '<title>one</title>\n<title titleSize="zz">two</title>'
    const { sourceMap } = deserializeElements(src)

    const d = toCmDiagnostic(
      { path: '/elements/1/titleSize', message: 'enum error' },
      sourceMap,
      '/elements',
      src.length
    )
    assert.ok(d, 'expected a resolved diagnostic for /elements/1/titleSize')
    const secondTitleStart = src.indexOf('<title titleSize=')
    assert.ok(
      d!.from >= secondTitleStart,
      `diagnostic anchored to offset ${d!.from} ("${src.slice(d!.from, d!.to)}") — expected ≥ ${secondTitleStart} (start of second <title>)`
    )
  })

  test('root-level errors no longer anchor to [0, 1]', () => {
    // Build a StatefulLayout with something that would surface as a
    // root-level error (empty elements when required, etc). If this test
    // needs a different trigger to produce a root error, update it — the
    // assertion is that an error with relative pointer '/' yields no
    // diagnostic rather than anchoring spuriously at the doc start.
    const src = '<title>a</title>\n<image />'
    const { sourceMap } = deserializeElements(src)
    // Synthesize the case: an error whose path matches the prefix exactly.
    const d = toCmDiagnostic(
      { path: '/elements', message: 'some root-level error' },
      sourceMap,
      '/elements',
      src.length
    )
    assert.equal(d, null, 'root-level errors must no longer anchor to [0, 1]')
  })
})
