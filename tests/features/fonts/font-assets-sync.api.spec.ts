import { test, expect } from '../../fixtures/login.ts'
import { createReadStream } from 'node:fs'
import FormData from 'form-data'
import axios from 'axios'
import 'dotenv/config'
import { axiosAuth, clean } from '../../support/axios.ts'

const orgAdmin = await axiosAuth({ email: 'test_portals_admin@test.com', org: 'test_portals_org1' })

const baseHost = `${process.env.DEV_HOST}:${process.env.NGINX_PORT}`
const themeCss = async (portalId: string) => {
  const hashes = (await axios.get(`http://${portalId}.portals.${baseHost}/simple-directory/api/sites/_hashes`)).data
  return (await axios.get(`http://${portalId}.portals.${baseHost}/simple-directory/api/sites/${hashes.themeCss}/_theme.css`)).data as string
}

const uploadFont = async (name: string) => {
  const form = new FormData()
  form.append('body', JSON.stringify({ name, subset: 'latin', weightRange: '400 700', style: 'normal' }))
  form.append('font-asset', createReadStream('tests/resources/logo.png'), 'custom.woff2')
  return (await orgAdmin.post('/api/font-assets', form)).data
}

// simple-directory caches its sites for 2s
const expectThemeCss = (portalId: string) => expect.poll(() => themeCss(portalId), { timeout: 5000 })

test.describe('font assets sync', () => {
  test.beforeEach(clean)

  test('a change of a font asset is synced to the theme of the portals that use it', async () => {
    const font = await uploadFont('Test Custom Font')
    const portal = (await orgAdmin.post('/api/portals', { config: { title: 'Font portal', bodyFontFamily: 'Test Custom Font', menu: { children: [] } } })).data
    await expectThemeCss(portal._id).toContain(`font-assets/${font._id}/`)

    const other = await uploadFont('Test Custom Font')
    await expectThemeCss(portal._id).toContain(`font-assets/${other._id}/`)

    await orgAdmin.patch(`/api/font-assets/${font._id}`, { subset: 'latin-ext' })
    await expectThemeCss(portal._id).toContain('/* latin-ext */')

    await orgAdmin.delete(`/api/font-assets/${font._id}`)
    await orgAdmin.delete(`/api/font-assets/${other._id}`)
    await expectThemeCss(portal._id).not.toContain('font-assets/')
  })
})
