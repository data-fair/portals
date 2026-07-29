import { test } from '@playwright/test'
import assert from 'node:assert/strict'
// @ts-ignore generated export
import { validate } from '../../../api/types/page-config/index.ts'

// The page-config validate export is compiled with removeAdditional (see the x-ajv
// comment in the schema): it strips the properties that violate additionalProperties
// from its input. The page editor relies on it to heal stored configs, so these tests
// pin that behavior down.

// Reduced from a real page that made the editor inert: a title element carrying a mb
// property, which the element-title schema never allowed (leftover of an old element
// type switch, then copied around by page duplication).
const brokenConfig = () => ({
  title: 'test',
  elements: [
    {
      uuid: 'a0000001',
      type: 'banner',
      mb: 4,
      fullWidth: true,
      background: { color: 'secondary' },
      children: [
        {
          uuid: 'a0000002',
          type: 'card',
          mb: 0,
          actions: [],
          children: [
            { uuid: 'a0000003', type: 'text', centered: true, mb: 0, content: 'hello' },
            { uuid: 'a0000004', type: 'title', titleSize: 'h5', titleTag: 'h1', content: 'hi', mb: 0 }
          ]
        }
      ]
    }
  ],
  genericMetadata: { slug: 'test' }
})

const healedConfig = () => {
  const config = brokenConfig()
  delete (config.elements[0].children[0].children[1] as any).mb
  return config
}

test.describe('page config validation heals stale properties', () => {
  test('strips the stale property and validates', () => {
    const config = brokenConfig()
    assert.equal(validate(config), true)
    assert.deepEqual(config, healedConfig())
  })

  test('does not touch the properties of the matching oneOf branches', () => {
    // valid properties of the tagged branches are "additional" from the point of view
    // of the non-matching branches, the discriminator option must protect them
    const config = brokenConfig()
    validate(config)
    const card = (config as any).elements[0].children[0]
    assert.equal(card.mb, 0)
    assert.equal(card.children[0].content, 'hello')
    assert.equal(card.children[0].mb, 0)
    assert.equal(card.children[1].titleSize, 'h5')
  })

  test('leaves a valid config identical', () => {
    const config = healedConfig()
    assert.equal(validate(config), true)
    assert.deepEqual(config, healedConfig())
  })

  test('does not heal other error classes', () => {
    const config = healedConfig()
    delete (config.elements[0].children[0].children[1] as any).titleSize
    assert.equal(validate(config), false, 'a missing required property cannot be healed by removals')
  })
})
