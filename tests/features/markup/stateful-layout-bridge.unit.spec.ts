/**
 * Integration-flavored unit tests that build a real StatefulLayout from the
 * compiled page-config-simple schema and run the full markup-mode pipeline
 * end-to-end in Node. This exists so that bugs in how the StateNode tree,
 * the deserializer's source map, and the bridge helpers interact — like
 * "error visually anchored to the wrong tag" or "widget lookup misses its
 * node" — can be reproduced without a browser.
 *
 * The page-config-simple schema re-uses the page-elements $defs, so element
 * semantics (which nodes exist, where ajv errors land) match the real
 * editor. What differs is only the outer page-config wrapper.
 */
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
// @ts-ignore — generated, no .d.ts
import { StatefulLayout } from '@json-layout/core/state'
// @ts-ignore — generated, no .d.ts
import { compiledLayout } from '../../../api/types/page-config-simple/.type/compiled-layout-fr.js'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'
import {
  collectErrorsByDataPath,
  findNodeByDataPath,
  toCmDiagnostic
} from '../../../shared/markup/codemirror/bridge.ts'

function buildLayout (elements: any[]) {
  const cl = compiledLayout as any
  return new StatefulLayout(
    cl,
    cl.skeletonTrees[cl.mainTree],
    { width: 600, updateOn: 'input', onData: () => {} },
    {
      // Minimum viable page-config payload: title is required, so set one to
      // keep the focus on element-level behavior.
      title: 'Test',
      elements
    }
  )
}

function errorsUnderElements (sl: any) {
  // Scope to just the elements subtree so we don't pick up errors on the
  // outer page-config (which aren't relevant to markup-mode rendering).
  const elementsNode = findNodeByDataPath<any>(sl.stateTree.root, '/elements')
  return collectErrorsByDataPath(elementsNode)
}

test.describe('markup × StatefulLayout integration', () => {
  test('bare <image /> produces no error on the image element itself', () => {
    const sl = buildLayout([
      { type: 'title', titleSize: 'h2', content: 'title' },
      { type: 'image', uuid: 'abc123' }
    ])
    const errors = errorsUnderElements(sl)
    // The image element's `image` property is optional at the schema level
    // and its layout.if makes it visible but missing — we expect json-layout
    // NOT to flag it as an error. This is the behavior we rely on to
    // justify dropping the [0, 1] diagnostic fallback: there's simply
    // nothing to anchor.
    assert.equal(errors.length, 0, `expected no errors, got ${JSON.stringify(errors)}`)
  })

  test('image StateNode exists at /elements/1/image even with no data', () => {
    const sl = buildLayout([
      { type: 'title', titleSize: 'h2', content: 'title' },
      { type: 'image', uuid: 'abc123' }
    ])
    // The markup-image-widget component looks the node up via this path.
    // If this ever returns null, the inline widget would render nothing
    // even though the plugin emitted a decoration.
    const node = findNodeByDataPath<any>(sl.stateTree.root, '/elements/1/image')
    assert.ok(node, 'expected /elements/1/image to exist in the StateNode tree')
    assert.equal(node!.data, undefined)
  })

  test('layout.comp signals which image-upload group is active', () => {
    // Empirical fact: json-layout keeps the StateNode for every schema
    // property (image AND wideImage) regardless of layout.if. The active
    // branch has layout.comp === 'slot' with a populated slots.component;
    // the inactive branch has layout.comp === 'none'. The Vue widget uses
    // this signal to render only the visible one.
    const slNoBanner = buildLayout([{ type: 'image', uuid: 'abc' }])
    const imgNoBanner = findNodeByDataPath<any>(slNoBanner.stateTree.root, '/elements/0/image')
    const wideNoBanner = findNodeByDataPath<any>(slNoBanner.stateTree.root, '/elements/0/wideImage')
    assert.ok(imgNoBanner, 'image node exists regardless of visibility')
    assert.ok(wideNoBanner, 'wideImage node exists regardless of visibility')
    assert.equal((imgNoBanner as any).layout?.comp, 'slot', 'image active when banner unset')
    assert.equal((wideNoBanner as any).layout?.comp, 'none', 'wideImage inactive when banner unset')

    const slBanner = buildLayout([{ type: 'image', uuid: 'abc', banner: true }])
    const imgBanner = findNodeByDataPath<any>(slBanner.stateTree.root, '/elements/0/image')
    const wideBanner = findNodeByDataPath<any>(slBanner.stateTree.root, '/elements/0/wideImage')
    assert.equal((imgBanner as any).layout?.comp, 'none', 'image inactive when banner=true')
    assert.equal((wideBanner as any).layout?.comp, 'slot', 'wideImage active when banner=true')
  })

  test('errors from a malformed element route to the right element tag', () => {
    // titleSize must be one of h1..h6. "zz" is invalid ⇒ ajv enum error.
    const sl = buildLayout([
      { type: 'title', content: 'one' },
      { type: 'title', titleSize: 'zz' as any, content: 'two' }
    ])
    const errors = errorsUnderElements(sl)
    assert.ok(errors.length > 0, 'expected at least one error')

    // The second title at /elements/1 should be the one flagged. Map the
    // error through the full markup pipeline and assert anchoring.
    const src = '<title>one</title>\n<title titleSize="zz">two</title>'
    const { sourceMap } = deserializeElements(src)
    const diagnostics = errors
      .map(e => toCmDiagnostic(e, sourceMap, '/elements', src.length))
      .filter((d): d is NonNullable<typeof d> => d !== null)

    assert.ok(diagnostics.length > 0, 'expected at least one resolved diagnostic')
    for (const d of diagnostics) {
      // All resolved diagnostics must anchor somewhere inside the second
      // <title> element — never inside the first.
      const secondTitleStart = src.indexOf('<title titleSize=')
      assert.ok(
        d.from >= secondTitleStart,
        `diagnostic anchored to offset ${d.from} ("${src.slice(d.from, d.to)}") — expected ≥ ${secondTitleStart} (start of second <title>)`
      )
    }
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
