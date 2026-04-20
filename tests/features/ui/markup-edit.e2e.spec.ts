import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const user1 = await axiosAuth('test_admin@test.com')

test.describe('markup edit mode', () => {
  test.beforeEach(clean)

  test('renders the CodeMirror markup editor with serialized elements when toggled on', async ({ page, goToWithAuth, context }) => {
    page.on('pageerror', (err) => console.log('[page error]', err.message))
    page.on('console', (msg) => { if (msg.type() === 'error') console.log('[console error]', msg.text()) })
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Markup Editor Portal', menu: { children: [] } }
    })).data

    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'Markup Editor Page',
        elements: [
          { type: 'title', titleSize: 'h2', content: 'hello' },
          { type: 'image', uuid: 'abcdef01' }
        ],
        genericMetadata: { slug: 'markup-editor-test' }
      },
      portals: [portal._id],
      owner: portal.owner
    })).data

    // Enable the markup-mode feature flag BEFORE the page loads — the
    // component reads localStorage at setup time, so setting it after
    // navigation is too late unless we reload.
    await context.addInitScript(() => {
      try { window.localStorage.setItem('df-markup-edit', '1') } catch { /* ignore */ }
    })

    await goToWithAuth(
      `/portals-manager/pages/${createdPage._id}/edit-config`,
      'test_admin'
    )

    // VJSF finishes rendering → the Form/Markup toggle is visible.
    await expect(page.getByRole('button', { name: 'Balisage' })).toBeVisible({ timeout: 10000 })

    // Switch to markup mode. The form disappears and CodeMirror mounts.
    await page.getByRole('button', { name: 'Balisage' }).click()
    await expect(page.locator('.markup-editor .cm-content')).toBeVisible({ timeout: 5000 })

    // The editor text must contain the serialized elements.
    const editorText = await page.locator('.markup-editor .cm-content').textContent()
    expect(editorText).toContain('<title')
    expect(editorText).toContain('<image')
    expect(editorText).toContain('hello')
  })

  test('shows an image-upload widget inline inside a bare <image /> tag', async ({ page, goToWithAuth, context }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Bare Image Portal', menu: { children: [] } }
    })).data

    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'Bare Image Page',
        elements: [
          { type: 'title', titleSize: 'h2', content: 'title' },
          { type: 'image', uuid: 'abcdef01' }
        ],
        genericMetadata: { slug: 'bare-image' }
      },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await context.addInitScript(() => {
      try { window.localStorage.setItem('df-markup-edit', '1') } catch { /* ignore */ }
    })

    await goToWithAuth(
      `/portals-manager/pages/${createdPage._id}/edit-config`,
      'test_admin'
    )

    await expect(page.getByRole('button', { name: 'Balisage' })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Balisage' }).click()
    await expect(page.locator('.markup-editor .cm-content')).toBeVisible({ timeout: 5000 })

    // The image widget for the active (non-banner) `image` group should mount.
    // The wideImage group is hidden by layout.if so its widget must stay
    // invisible. The widget host <span> is emitted by the CM6 plugin in either
    // case — what we assert is that ONE visible v-file-input exists inside a
    // markup-image-upload-widget span.
    await page.waitForTimeout(1000)
    const diagnostics = await page.evaluate(() => {
      const visible = Array.from(document.querySelectorAll('.markup-image-upload-widget'))
        .map((el) => ({ group: el.getAttribute('data-markup-group') }))
      const hidden = Array.from(document.querySelectorAll('.markup-image-widget-hidden'))
        .map((el) => ({
          group: el.getAttribute('data-markup-group'),
          reason: el.getAttribute('data-markup-hidden'),
          target: el.getAttribute('data-markup-target-path'),
          root: el.getAttribute('data-markup-root-path')
        }))
      return { visible, hidden }
    })
    console.log('[e2e diagnostics]', JSON.stringify(diagnostics, null, 2))
    const visibleFileInputs = page.locator('.markup-image-upload-widget:has(.v-file-input)')
    await expect(visibleFileInputs).toHaveCount(1, { timeout: 5000 })
  })

  test('wipes the widget and re-displays <image image._id="…"/> text after uploading a file', async ({ page, goToWithAuth, context }) => {
    // Keeps the file-upload path honest: after the widget writes through the
    // StatefulLayout, the CM6 text should update with the new attribute set,
    // and the decoration should now replace the attrs (not be a point
    // insertion). We stub the /images POST so the test does not rely on a
    // real image-service round-trip.
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Upload Widget Portal', menu: { children: [] } }
    })).data

    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'Upload Widget Page',
        elements: [
          { type: 'image', uuid: 'abcdef01' }
        ],
        genericMetadata: { slug: 'upload-widget' }
      },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await context.addInitScript(() => {
      try { window.localStorage.setItem('df-markup-edit', '1') } catch { /* ignore */ }
    })

    // Stub image upload: the real endpoint would persist the file, return a
    // saved Image record, and later be served back via /images/:_id/data.
    // For this test we only care that the widget round-trips an image ref
    // through the StatefulLayout → CM6 text sync.
    await context.route(/\/portals-manager\/api\/images(\?|$)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ _id: 'img-stub', name: 'stub.png', mimeType: 'image/png' })
      })
    })

    await goToWithAuth(
      `/portals-manager/pages/${createdPage._id}/edit-config`,
      'test_admin'
    )

    await expect(page.getByRole('button', { name: 'Balisage' })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Balisage' }).click()
    await expect(page.locator('.markup-editor .cm-content')).toBeVisible({ timeout: 5000 })

    // Before upload: exactly one visible widget (bare-tag case).
    await expect(page.locator('.markup-image-upload-widget:has(.v-file-input)')).toHaveCount(1, { timeout: 5000 })

    // Pick a fake PNG and let the upload complete. The widget should close
    // the loading state and the CM6 text should now carry `image._id="..."`.
    const fileInput = page.locator('.markup-image-upload-widget input[type="file"]').first()
    await fileInput.setInputFiles({
      name: 'stub.png',
      mimeType: 'image/png',
      buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    })

    await expect(async () => {
      // Widget hides name/mimeType in the rendered view. Read the underlying
      // doc via the EditorView so we can assert the full attribute triple is
      // still present in the source and round-trips correctly.
      const docText = await page.evaluate(() => {
        const content = document.querySelector('.markup-editor .cm-content') as any
        const tile = content?.cmTile ?? (document.querySelector('.markup-editor .cm-editor') as any)?.cmTile
        return tile?.root?.view?.state?.doc?.toString?.() ?? ''
      })
      expect(docText).toContain('image._id="img-stub"')
      expect(docText).toContain('image.name="stub.png"')
      expect(docText).toContain('image.mimeType="image/png"')

      // And verify the widget/hide decorations apply: the rendered view
      // replaces the `_id` attribute with the upload widget and hides
      // `name`/`mimeType` entirely, so none of the three attribute literals
      // should appear in the rendered text.
      const renderedText = await page.locator('.markup-editor .cm-content').textContent() ?? ''
      expect(renderedText).not.toContain('image._id="img-stub"')
      expect(renderedText).not.toContain('image.name="stub.png"')
      expect(renderedText).not.toContain('image.mimeType="image/png"')
    }).toPass({ timeout: 10000 })
  })

  test('toggles a node preview on and off via the gutter marker', async ({ page, goToWithAuth, context }) => {
    const portal = (await user1.post('/api/portals', {
      config: { title: 'Preview Toggle Portal', menu: { children: [] } }
    })).data

    const createdPage = (await user1.post('/api/pages', {
      type: 'generic',
      config: {
        title: 'Preview Toggle Page',
        elements: [
          { type: 'title', titleSize: 'h2', content: 'Preview Hello' }
        ],
        genericMetadata: { slug: 'preview-toggle' }
      },
      portals: [portal._id],
      owner: portal.owner
    })).data

    await context.addInitScript(() => {
      try { window.localStorage.setItem('df-markup-edit', '1') } catch { /* ignore */ }
    })

    await goToWithAuth(
      `/portals-manager/pages/${createdPage._id}/edit-config`,
      'test_admin'
    )

    await expect(page.getByRole('button', { name: 'Balisage' })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Balisage' }).click()
    await expect(page.locator('.markup-editor .cm-content')).toBeVisible({ timeout: 5000 })

    // Toggle preview on for the first element (`/0`).
    const toggleBtn = page.locator('.cm-gutter-node-preview-btn[data-markup-preview-pointer="/0"]')
    await expect(toggleBtn).toBeVisible({ timeout: 5000 })
    await toggleBtn.click()

    // Preview widget should appear and render the title text.
    const widget = page.locator('.markup-preview-widget-frame')
    await expect(widget).toBeVisible({ timeout: 5000 })
    await expect(widget).toContainText('Preview Hello')

    // Toggle off — widget must disappear.
    await toggleBtn.click()
    await expect(widget).toHaveCount(0, { timeout: 5000 })
  })
})
