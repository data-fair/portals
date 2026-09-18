// Pure helper kept free of Nuxt/Vue runtime deps so it can be unit-tested directly
// and reused by the markdown renderer (shared/markdown).

/** Private routes a crawler must not follow: the personal space and the auth service */
export const isPrivatePath = (href: string): boolean => {
  const { pathname } = new URL(href, 'http://localhost')
  return /^\/me(\/|$)/.test(pathname) || pathname.startsWith('/simple-directory/')
}

/** rel attribute of a link: noopener when it opens a new tab, nofollow when it leads to a private page */
export const linkRel = (href: string | undefined, target?: boolean): string | undefined => {
  const rel: string[] = []
  if (target) rel.push('noopener')
  if (href && isPrivatePath(href)) rel.push('nofollow')
  return rel.length ? rel.join(' ') : undefined
}
