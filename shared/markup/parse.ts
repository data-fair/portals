/**
 * Syntactic parser for portal markup. Converts raw text into a `ParsedTag`
 * tree with char-offset and line/col tracking. Knows nothing about the tag
 * descriptors or JSON shape — semantic binding happens in `deserializer.ts`
 * and source-map construction in `source-map.ts`.
 *
 * Why hand-rolled instead of the Lezer grammar we already use for CM6
 * highlighting: we need recoverable errors with line/col diagnostics and
 * precise attribute-name / attribute-value ranges that a Lezer walker would
 * still have to rebuild. Consolidating onto a Lezer tree is a tracked
 * follow-up (see docs/architecture/markup-editor.md).
 */
import type { MarkupRange } from './types.ts'

export interface DeserializeError {
  line: number
  col: number
  message: string
}

export interface Parser {
  src: string
  pos: number
  line: number
  col: number
  errors: DeserializeError[]
}

export interface AttrRange {
  name: MarkupRange
  value: MarkupRange
}

export interface ParsedTag {
  name: string
  attrs: Record<string, string>
  selfClosing: boolean
  children: ParsedTag[]
  rawContent?: string
  startLine: number
  startCol: number
  /** Offset of the leading `<`. */
  tagStart: number
  /** Offset one past the `>` that closes the opening tag (or `/>` for self-closing). */
  openTagEnd: number
  /** Offset of the first character after the open tag's `>`. Undefined for self-closing. */
  contentStart?: number
  /** Offset of the `<` that starts the closing tag. Undefined for self-closing. */
  contentEnd?: number
  attrRanges: Record<string, AttrRange>
}

export function makeParser (src: string): Parser {
  return { src, pos: 0, line: 1, col: 1, errors: [] }
}

function advance (p: Parser, n: number): void {
  for (let i = 0; i < n && p.pos < p.src.length; i++) {
    if (p.src[p.pos] === '\n') { p.line++; p.col = 1 } else { p.col++ }
    p.pos++
  }
}

function skipWhitespace (p: Parser): void {
  while (p.pos < p.src.length && /\s/.test(p.src[p.pos])) advance(p, 1)
}

export function reportError (p: Parser, message: string, line = p.line, col = p.col): void {
  p.errors.push({ line, col, message })
}

export function unescapeAttr (value: string): string {
  return value.replace(/&quot;/g, '"').replace(/&amp;/g, '&')
}

export function unescapeContent (value: string): string {
  return value.replace(/&lt;/g, '<').replace(/&amp;/g, '&')
}

function parseIdent (p: Parser): string {
  const start = p.pos
  while (p.pos < p.src.length && /[A-Za-z0-9_.-]/.test(p.src[p.pos])) advance(p, 1)
  return p.src.slice(start, p.pos)
}

function parseAttributes (p: Parser, attrRanges: Record<string, AttrRange>): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (;;) {
    skipWhitespace(p)
    if (p.pos >= p.src.length) return attrs
    const ch = p.src[p.pos]
    if (ch === '>' || ch === '/') return attrs
    const nameLine = p.line
    const nameCol = p.col
    const nameFrom = p.pos
    const name = parseIdent(p)
    const nameTo = p.pos
    if (!name) {
      reportError(p, `unexpected character '${ch}' in attributes`, nameLine, nameCol)
      advance(p, 1)
      continue
    }
    skipWhitespace(p)
    if (p.src[p.pos] !== '=') {
      reportError(p, `expected '=' after attribute '${name}'`, p.line, p.col)
      continue
    }
    advance(p, 1) // =
    skipWhitespace(p)
    if (p.src[p.pos] !== '"') {
      reportError(p, `expected '"' after '=' for attribute '${name}'`, p.line, p.col)
      continue
    }
    advance(p, 1) // opening "
    const valFrom = p.pos
    while (p.pos < p.src.length && p.src[p.pos] !== '"') advance(p, 1)
    const valTo = p.pos
    const rawValue = p.src.slice(valFrom, valTo)
    if (p.src[p.pos] !== '"') {
      reportError(p, `unterminated attribute value for '${name}'`, nameLine, nameCol)
      return attrs
    }
    advance(p, 1) // closing "
    attrs[name] = unescapeAttr(rawValue)
    attrRanges[name] = {
      name: { from: nameFrom, to: nameTo },
      value: { from: valFrom, to: valTo }
    }
  }
}

function readRawContent (p: Parser, closingTag: string): string {
  const start = p.pos
  const needle = `</${closingTag}>`
  const idx = p.src.indexOf(needle, p.pos)
  if (idx === -1) {
    reportError(p, `missing closing tag </${closingTag}>`)
    advance(p, p.src.length - p.pos)
    return p.src.slice(start)
  }
  advance(p, idx - p.pos)
  return p.src.slice(start, idx)
}

function parseTag (p: Parser, allowRawContentFor?: Set<string>): ParsedTag | null {
  const startLine = p.line
  const startCol = p.col
  const tagStart = p.pos
  if (p.src[p.pos] !== '<') {
    reportError(p, 'expected \'<\'', startLine, startCol)
    advance(p, 1)
    return null
  }
  advance(p, 1)
  if (p.src[p.pos] === '/') {
    reportError(p, 'unexpected closing tag', startLine, startCol)
    while (p.pos < p.src.length && p.src[p.pos] !== '>') advance(p, 1)
    if (p.src[p.pos] === '>') advance(p, 1)
    return null
  }
  const name = parseIdent(p)
  if (!name) {
    reportError(p, 'expected tag name after \'<\'', startLine, startCol)
    return null
  }
  const attrRanges: Record<string, AttrRange> = {}
  const attrs = parseAttributes(p, attrRanges)
  skipWhitespace(p)
  if (p.src[p.pos] === '/') {
    advance(p, 1)
    if (p.src[p.pos] !== '>') {
      reportError(p, `expected '>' after '/' in <${name}>`, p.line, p.col)
    } else {
      advance(p, 1)
    }
    const openTagEnd = p.pos
    return { name, attrs, selfClosing: true, children: [], startLine, startCol, tagStart, openTagEnd, attrRanges }
  }
  if (p.src[p.pos] !== '>') {
    reportError(p, `expected '>' to close opening tag <${name}>`, p.line, p.col)
    const openTagEnd = p.pos
    return { name, attrs, selfClosing: true, children: [], startLine, startCol, tagStart, openTagEnd, attrRanges }
  }
  advance(p, 1) // >
  const openTagEnd = p.pos

  const tag: ParsedTag = { name, attrs, selfClosing: false, children: [], startLine, startCol, tagStart, openTagEnd, attrRanges }

  if (allowRawContentFor && allowRawContentFor.has(name)) {
    const contentStart = p.pos
    tag.rawContent = readRawContent(p, name)
    tag.contentStart = contentStart
    tag.contentEnd = p.pos
    if (p.src.startsWith(`</${name}>`, p.pos)) advance(p, `</${name}>`.length)
    return tag
  }

  const contentStart = p.pos
  for (;;) {
    skipWhitespace(p)
    if (p.pos >= p.src.length) {
      reportError(p, `missing closing tag </${name}>`, startLine, startCol)
      tag.contentStart = contentStart
      tag.contentEnd = p.pos
      break
    }
    if (p.src.startsWith(`</${name}>`, p.pos)) {
      tag.contentStart = contentStart
      tag.contentEnd = p.pos
      advance(p, `</${name}>`.length)
      break
    }
    if (p.src[p.pos] !== '<') {
      reportError(p, `unexpected text content in <${name}>`, p.line, p.col)
      while (p.pos < p.src.length && p.src[p.pos] !== '<') advance(p, 1)
      continue
    }
    const child = parseTag(p, allowRawContentFor)
    if (child) tag.children.push(child)
  }
  return tag
}

/**
 * Parse all top-level tags, skipping whitespace and recovering from stray
 * text. Mutates `parser.errors` as syntax errors are encountered. Returns
 * whatever tags could be fully parsed.
 */
export function parseRootTags (parser: Parser, allowRawContentFor: Set<string>): ParsedTag[] {
  const roots: ParsedTag[] = []
  for (;;) {
    skipWhitespace(parser)
    if (parser.pos >= parser.src.length) break
    if (parser.src[parser.pos] !== '<') {
      reportError(parser, `unexpected character '${parser.src[parser.pos]}' at top level`, parser.line, parser.col)
      while (parser.pos < parser.src.length && parser.src[parser.pos] !== '<') advance(parser, 1)
      continue
    }
    const tag = parseTag(parser, allowRawContentFor)
    if (tag) roots.push(tag)
  }
  return roots
}
