// data-fair is the least stable dependency of a portal and its ssr calls are capped by a
// short timeout (cf plugins/01-local-fetch.ts). A block that could not get its content must
// say so instead of rendering an empty list, and the page is then served as a 503.
// A timeout or an unreachable service produces an error without status code.
export function isContentUnavailable (error: unknown) {
  if (!error) return false
  const statusCode = (error as { statusCode?: number }).statusCode
  return !statusCode || statusCode >= 500
}
