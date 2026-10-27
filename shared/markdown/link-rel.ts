// Pure helper, so it can be shared by the API (markdown rendering), the portal
// (SSR/client templates) and the manager (preview).

/** Private routes a crawler must not follow: the personal space and the auth service */
export const isPrivatePath = (href: string): boolean => {
  let pathname: string
  try {
    pathname = new URL(href, 'http://localhost').pathname
  } catch {
    return false
  }
  return /^\/me(\/|$)/.test(pathname) || pathname.startsWith('/simple-directory/')
}

/** An http(s) link to another host than the portal's, a subdomain included */
export const isExternalHref = (href: string, host: string): boolean => {
  let url: URL
  try {
    url = new URL(href, 'http://' + host)
  } catch {
    return false
  }
  return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== host
}

/**
 * rel attribute of a link: noopener when it opens a new tab, external when it leaves
 * the portal's host (unknown in the API and the manager), nofollow when it leads to a private page
 */
export const linkRel = (href: string | undefined, target?: boolean, host?: string): string | undefined => {
  const rel: string[] = []
  if (target) rel.push('noopener')
  if (href && host && isExternalHref(href, host)) rel.push('external')
  if (href && isPrivatePath(href)) rel.push('nofollow')
  return rel.length ? rel.join(' ') : undefined
}

const linkText = (inner: string) => inner
  .replace(/<img\b[^>]*\balt="([^"]*)"[^>]*>/g, ' $1 ')
  .replace(/<[^>]*>/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .replaceAll('"', '&quot;')

/**
 * Completes the links of a sanitized html (markdown rendered by the API or by data-fair)
 * with what depends on the page displaying it: the link style on raw <a> tags, rel and
 * the translated "new window" title. Relies on sanitize-html serializing every
 * attribute value in double quotes.
 */
export const annotateLinks = (html: string, host: string | undefined, newWindow: string): string =>
  html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g, (anchor, attrsStr: string, inner: string) => {
    const attrs = new Map([...attrsStr.matchAll(/([^\s=]+)="([^"]*)"/g)].map(m => [m[1]!, m[2]!]))
    const href = attrs.get('href')
    if (href === undefined) return anchor
    const target = attrs.get('target') === '_blank'
    const classes = (attrs.get('class') ?? '').split(' ').filter(Boolean)
    if (!classes.includes('simple-link')) attrs.set('class', [...classes, 'simple-link'].join(' '))
    const rel = linkRel(href, target, host)
    if (rel) attrs.set('rel', rel)
    else attrs.delete('rel')
    if (target) {
      const title = attrs.get('title') || linkText(inner)
      if (!title.toLowerCase().includes(newWindow.toLowerCase())) attrs.set('title', title ? `${title} - ${newWindow}` : newWindow)
    }
    return `<a${[...attrs].map(([name, value]) => ` ${name}="${value}"`).join('')}>${inner}</a>`
  })
