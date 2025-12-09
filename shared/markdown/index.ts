import sanitizeHtml from 'sanitize-html'
import { marked } from 'marked'
import { getSanitizeOpts } from '@data-fair/lib-utils/sanitize-html.js'
import { markedVuetify } from '@data-fair/lib-utils/marked-vuetify.js'

const sanitizeOpts = getSanitizeOpts(sanitizeHtml.defaults)

marked.use(markedVuetify)

export const renderMarkdown = (markdown: string) => sanitizeHtml(marked.parse(markdown) as string, sanitizeOpts)
