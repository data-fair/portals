import { test } from '../../fixtures/login.ts'
import assert from 'node:assert/strict'
import { createReadStream, readdirSync, statSync } from 'node:fs'
import FormData from 'form-data'
import { axios, axiosAuth, clean } from '../../support/axios.ts'
import { nhiSession } from '../../support/nhi.ts'

const fontsDir = 'api/assets/fonts/montserrat'
const fontFile = `${fontsDir}/${readdirSync(fontsDir).find(f => f.endsWith('.woff2'))}`

test.describe('api docs', () => {
  test.beforeEach(clean)

  test('served anonymously and cacheable, for data-fair to merge', async () => {
    const res = await axios().get('/api/api-docs.json')
    assert.equal(res.status, 200)
    assert.equal(res.data.openapi, '3.1.0')
    assert.equal(res.data.servers[0].url, '/portals-manager/api')
    assert.match(String(res.headers['cache-control']), /max-age=300/)
    assert.match(String(res.headers.vary), /Accept-Language/)
    const scopes = (data: any) => data.components.securitySchemes.oauth2.flows.clientCredentials.scopes
    const en = await axios().get('/api/api-docs.json', { headers: { 'accept-language': 'en' } })
    assert.equal(scopes(en.data)['pages:read'], "Read the account's pages and page groups")
    assert.notEqual(scopes(res.data)['pages:read'], scopes(en.data)['pages:read'])
  })

  test('served to a token of any scope', async () => {
    const { bearerAx } = await nhiSession('pages:read')
    assert.equal((await bearerAx.get('/api/api-docs.json')).status, 200)
  })

  test('the skill bodies are served anonymously as markdown', async () => {
    const doc = (await axios().get('/api/api-docs.json')).data
    const hrefs = doc['x-agent'].skills.map((s: any) => s.href)
    assert.deepEqual(hrefs, ['agents/skills/pages.md', 'agents/skills/config.md'])
    const res = await axios().get('/api/agents/skills/pages.md')
    assert.equal(res.status, 200)
    assert.match(String(res.headers['content-type']), /text\/markdown/)
    assert.match(res.data, /^# /)
    const { bearerAx } = await nhiSession('pages:read')
    assert.equal((await bearerAx.get('/api/agents/skills/config.md')).status, 200)
    for (const file of ['nope.md', 'pages', '..%2Fapi-docs.ts', 'PAGES.md']) {
      assert.equal((await axios().get(`/api/agents/skills/${file}`, { validateStatus: () => true })).status, 404, file)
    }
  })

  test('a font file uploaded without its metadata takes them from the upload, as upload_font_asset sends it', async () => {
    const ax = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })
    const form = new FormData()
    form.append('body', JSON.stringify({ name: 'Test font', subset: 'latin', weightRange: '400 700', style: 'normal' }))
    form.append('font-asset', createReadStream(fontFile), { filename: 'test-font.woff2', contentType: 'font/woff2' })
    const res = await ax.post('/api/font-assets', form)
    assert.deepEqual(res.data.file, { name: 'test-font.woff2', size: statSync(fontFile).size, type: 'font/woff2' })
  })

  test('a multipart body part that is not a JSON object is refused with a 400', async () => {
    const ax = await axiosAuth({ email: 'test_admin@test.com', org: 'test_org1' })
    for (const body of ['null', '1', '[]', '{']) {
      const form = new FormData()
      form.append('body', body)
      form.append('font-asset', createReadStream(fontFile), { filename: 'test-font.woff2', contentType: 'font/woff2' })
      const res = await ax.post('/api/font-assets', form, { validateStatus: () => true })
      assert.equal(res.status, 400, body)
    }
  })
})
