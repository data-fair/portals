import { test, expect } from '../../fixtures/login.ts'
import { axiosAuth, clean } from '../../support/axios.ts'

const orgAdmin = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })

// the preview needs simple-directory's pseudo sessions and the capture service (as page-preview.api.spec.ts)
const pseudoAvailable = await fetch(`http://localhost:${process.env.SD_PORT}/api/auth/pseudo`, { method: 'POST', headers: { 'x-secret-key': 'secret-pseudo-session', 'content-type': 'application/json' }, body: '{}' })
  .then(async res => res.status === 400 && /Missing type or id/.test(await res.text()), () => false)
const captureAvailable = await fetch(`http://localhost:${process.env.CAPTURE_PORT}/api/v1/api-docs.json`).then(res => res.status === 200, () => false)

test.describe('page preview WebMCP tool', () => {
  test.beforeEach(clean)

  test('the page screens offer preview_page, which answers with the report and a screenshot', async ({ page, goToWithAuth }) => {
    test.slow()
    test.skip(!pseudoAvailable, 'simple-directory has no pseudo session secret in this environment')
    test.skip(!captureAvailable, 'capture is not available in this environment')
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'P', menu: { children: [] } } })).data
    const created = (await orgAdmin.post('/api/pages', {
      type: 'generic',
      config: { title: 'Preview tool', elements: [{ type: 'text', content: 'Un texte visible.' }], genericMetadata: { slug: 'preview-tool' } },
      portals: [portal._id]
    })).data

    await goToWithAuth(`/portals-manager/pages/${created._id}`, 'test_admin', { org: 'test_org1' })
    await page.waitForFunction(() => {
      const mc = (navigator as any).modelContext
      return !!mc?.listTools?.().some((t: any) => t.name === 'preview_page')
    }, undefined, { timeout: 30_000 })

    const result: any = await page.evaluate(async () => {
      return await (navigator as any).modelContext.callTool({ name: 'preview_page', arguments: { draft: false } })
    })
    expect(result.isError, JSON.stringify(result.content?.[0])).not.toBe(true)
    expect(result.content[0].type).toBe('text')
    expect(result.content[0].text).toContain('Un texte visible.')
    expect(result.content[1].type).toBe('image')
    expect(result.content[1].mimeType).toMatch(/^image\//)
    expect(result.content[1].data.length).toBeGreaterThan(100)
  })
})
