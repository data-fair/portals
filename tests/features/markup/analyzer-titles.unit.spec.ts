import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { analyzeSchemas } from '../../../build/markup/schema-analyzer.ts'

function rootSchema () {
  return {
    $defs: {
      element: {
        oneOf: [{ $ref: '#/$defs/titleElement' }]
      },
      titleElement: {
        type: 'object',
        title: 'Title',
        'x-i18n-title': { fr: 'Titre' },
        required: ['type'],
        properties: {
          type: { const: 'title' },
          titleSize: {
            type: 'string',
            title: 'Title size',
            'x-i18n-title': { fr: 'Taille du titre' },
            oneOf: [
              { const: 'h1', title: 'Titre principal' },
              { const: 'h2', title: 'Grand' }
            ]
          },
          content: { type: 'string' }
        }
      }
    }
  }
}

test.describe('analyzer titles', () => {
  test('extracts tag titles from title + x-i18n-title', () => {
    const descriptors = analyzeSchemas(rootSchema())
    const title = descriptors.title
    assert.deepEqual(title.titles, { en: 'Title', fr: 'Titre' })
  })

  test('extracts attribute titles', () => {
    const descriptors = analyzeSchemas(rootSchema())
    const attr = descriptors.title.attributes.find(a => a.name === 'titleSize')
    assert.ok(attr)
    assert.deepEqual(attr!.titles, { en: 'Title size', fr: 'Taille du titre' })
  })

  test('extracts enum-value titles keyed by const-as-string', () => {
    const descriptors = analyzeSchemas(rootSchema())
    const attr = descriptors.title.attributes.find(a => a.name === 'titleSize')
    assert.ok(attr)
    assert.deepEqual(attr!.enumTitles, {
      h1: { en: 'Titre principal' },
      h2: { en: 'Grand' }
    })
  })

  test('omits titles when schema has none', () => {
    const schema = {
      $defs: {
        element: { oneOf: [{ $ref: '#/$defs/plain' }] },
        plain: {
          type: 'object',
          required: ['type'],
          properties: {
            type: { const: 'plain' },
            flag: { type: 'boolean' }
          }
        }
      }
    }
    const descriptors = analyzeSchemas(schema)
    assert.equal(descriptors.plain.titles, undefined)
    const attr = descriptors.plain.attributes.find(a => a.name === 'flag')
    assert.equal(attr?.titles, undefined)
  })
})
