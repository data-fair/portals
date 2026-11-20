import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { annotateLinks, isPrivatePath, linkRel } from '../../../shared/markdown/link-rel.ts'

test.describe('isPrivatePath', () => {
  test('matches the personal space root and its sub-pages', () => {
    assert.equal(isPrivatePath('/me'), true)
    assert.equal(isPrivatePath('/me/reuses'), true)
    assert.equal(isPrivatePath('/me/reuses?dataset=x'), true)
  })

  test('matches the auth service', () => {
    assert.equal(isPrivatePath('/simple-directory/login?redirect=https://x/'), true)
  })

  test('does not match paths that merely start with the same letters', () => {
    assert.equal(isPrivatePath('/media'), false)
    assert.equal(isPrivatePath('/members/1'), false)
    assert.equal(isPrivatePath('/simple-directory'), false)
  })

  test('handles absolute urls and non-http schemes', () => {
    assert.equal(isPrivatePath('https://data.example.com/me/account'), true)
    assert.equal(isPrivatePath('https://example.com/datasets'), false)
    assert.equal(isPrivatePath('mailto:contact@example.com'), false)
  })

  test('does not throw on an unparseable href', () => {
    assert.equal(isPrivatePath('http://'), false)
  })
})

test.describe('linkRel', () => {
  test('is undefined for a public link opened in the same tab', () => {
    assert.equal(linkRel('/datasets'), undefined)
    assert.equal(linkRel(undefined), undefined)
  })

  test('keeps noopener for a new tab', () => {
    assert.equal(linkRel('https://example.com', true), 'noopener')
  })

  test('adds nofollow for a private link', () => {
    assert.equal(linkRel('/me/reuses'), 'nofollow')
    assert.equal(linkRel('/me/reuses', true), 'noopener nofollow')
  })

  test('does not throw on an unparseable href', () => {
    assert.equal(linkRel('https://[', true), 'noopener')
  })

  test('adds external for another host, a subdomain included', () => {
    assert.equal(linkRel('https://example.com/a', false, 'data.portal.fr'), 'external')
    assert.equal(linkRel('https://www.portal.fr', true, 'data.portal.fr'), 'noopener external')
    assert.equal(linkRel('//example.com', false, 'data.portal.fr'), 'external')
  })

  test('the same host, a relative link or another scheme is not external', () => {
    assert.equal(linkRel('https://data.portal.fr/datasets', false, 'data.portal.fr'), undefined)
    assert.equal(linkRel('/datasets', true, 'data.portal.fr'), 'noopener')
    assert.equal(linkRel('mailto:contact@example.com', false, 'data.portal.fr'), undefined)
  })

  test('is never external without the portal host', () => {
    assert.equal(linkRel('https://example.com'), undefined)
  })
})

test.describe('annotateLinks', () => {
  const annotate = (html: string) => annotateLinks(html, 'data.portal.fr', 'Nouvelle fenêtre')

  test('a raw link gets the link style and its rel', () => {
    assert.equal(
      annotate('<a href="https://example.com" class="foo">ext</a>'),
      '<a href="https://example.com" class="foo simple-link" rel="external">ext</a>'
    )
  })

  test('a new tab link gets the new window title from its text', () => {
    assert.equal(
      annotate('<a href="/x?a=1&amp;b=2" target="_blank" rel="noopener">say "hi" &amp; <b>bold</b></a>'),
      '<a href="/x?a=1&amp;b=2" target="_blank" rel="noopener" class="simple-link" title="say &quot;hi&quot; &amp; bold - Nouvelle fenêtre">say "hi" &amp; <b>bold</b></a>'
    )
  })

  test('an image link takes its title from the alt text', () => {
    assert.match(annotate('<a href="/" target="_blank"><img src="/i.png" alt="Logo" /></a>'), /title="Logo - Nouvelle fenêtre"/)
  })

  test('an existing title is completed once', () => {
    assert.match(annotate('<a href="/" target="_blank" title="Aide">?</a>'), /title="Aide - Nouvelle fenêtre"/)
    assert.match(annotate('<a href="/" target="_blank" title="Aide - nouvelle fenêtre">?</a>'), /title="Aide - nouvelle fenêtre"/)
  })

  test('a link of the markdown renderer only gets what it lacks', () => {
    const link = '<a href="/datasets" class="simple-link">catalogue</a>'
    assert.equal(annotate(link), link)
    assert.equal(annotate('<a href="/me" class="simple-link" rel="sponsored">x</a>'), '<a href="/me" class="simple-link" rel="nofollow">x</a>')
  })

  test('leaves anchors without href and similar tags alone', () => {
    const html = '<p><a name="top"></a><abbr>ab</abbr> &lt;a href="x"&gt;</p>'
    assert.equal(annotate(html), html)
  })
})
