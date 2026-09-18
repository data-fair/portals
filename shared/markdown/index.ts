import sanitizeHtml from 'sanitize-html'
import { marked } from 'marked'
import { getSanitizeOpts } from '@data-fair/lib-utils/sanitize-html.js'
import { markedVuetify } from '@data-fair/lib-utils/marked-vuetify.js'
import { linkRel } from './link-rel.ts'

const baseOpts = getSanitizeOpts(sanitizeHtml.defaults)
const sanitizeOpts: sanitizeHtml.IOptions = {
  ...baseOpts,
  allowedAttributes: { ...baseOpts.allowedAttributes, a: [...sanitizeHtml.defaults.allowedAttributes.a, 'rel'] },
  transformTags: {
    // rel is always ours: nofollow toward private pages, noopener on new tabs
    a: (tagName, attribs) => {
      const rel = linkRel(attribs.href, attribs.target === '_blank')
      const cleaned = { ...attribs }
      delete cleaned.rel
      return { tagName, attribs: rel ? { ...cleaned, rel } : cleaned }
    }
  }
}

marked.use(markedVuetify)

export const renderMarkdown = (markdown: string) => sanitizeHtml(marked.parse(markdown) as string, sanitizeOpts)
