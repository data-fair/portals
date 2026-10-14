import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { canSeeAgentChat } from '../../../portal/app/utils/agent-chat.ts'

test.describe('agent chat visibility', () => {
  test('everyone sees the chat when visibleTo is not set', () => {
    assert.equal(canSeeAgentChat(undefined, 'anonymous'), true)
    assert.equal(canSeeAgentChat(undefined, 'admin'), true)
  })

  test('an anonymous visitor sees the chat when visibleTo includes anonymous', () => {
    assert.equal(canSeeAgentChat(['anonymous', 'user'], 'anonymous'), true)
  })

  test('an anonymous visitor does not see the chat when visibleTo excludes anonymous', () => {
    assert.equal(canSeeAgentChat(['admin', 'contrib', 'user'], 'anonymous'), false)
    assert.equal(canSeeAgentChat([], 'admin'), false)
  })
})
