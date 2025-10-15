import sanitizeHtml from 'sanitize-html'
import type { IOptions as SanitizeOptions } from 'sanitize-html'
import { marked, type MarkedOptions } from 'marked'

const sanitizeOpts: SanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['title', 'alt', 'src', 'srcset', 'height', 'width', 'sizes', 'loading']
  }
}

const sanitize = (html: string) => sanitizeHtml(html, sanitizeOpts)

const markedOpts: MarkedOptions = {
  // TODO: provide a renderer to apply vuetify classes
  // OR maybe use SASS extend so that we can adjust things more easily
  // https://sass-lang.com/documentation/at-rules/extend/
}

const parse = (markdown: string) => marked.parse(markdown, markedOpts) as string

export const renderMarkdown = (markdown: string) => sanitize(parse(markdown))
