import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serializeElements } from '../../../shared/markup/serializer.ts'
import { deserializeElements } from '../../../shared/markup/deserializer.ts'

const here = dirname(fileURLToPath(import.meta.url))
const fixturesDir = join(here, 'fixtures')

function collectFixtures (dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...collectFixtures(full))
    } else if (entry.endsWith('.json')) {
      out.push(full)
    }
  }
  return out.sort()
}

test.describe('markup round-trip', () => {
  for (const fixturePath of collectFixtures(fixturesDir)) {
    const name = relative(fixturesDir, fixturePath)
    test(`round-trips ${name}`, () => {
      const json = JSON.parse(readFileSync(fixturePath, 'utf8'))
      const markup = serializeElements(json)
      const result = deserializeElements(markup)
      assert.deepEqual(result.errors, [], `deserialize errors:\n${JSON.stringify(result.errors, null, 2)}\nmarkup:\n${markup}`)
      assert.deepEqual(
        result.elements,
        json,
        `round-trip mismatch for ${name}\nmarkup:\n${markup}`
      )
    })
  }
})
