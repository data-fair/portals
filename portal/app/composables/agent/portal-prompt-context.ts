import type { PortalConfig } from '#api/types/portal-config'

/**
 * Portal context appended to every agent's system prompt.
 *
 * `hasCustomBase` tells us whether the caller already prepended a portal-configured
 * base prompt: when it did, that base establishes the assistant's identity, so we
 * skip our own generic identity line to avoid repeating it. When it did not, we
 * provide the canonical identity line ourselves (the downstream agents component
 * only falls back to its default base prompt when the whole prompt is empty, which
 * it never is here — so identity must come from us).
 */
export function portalPromptContext (portalConfig: PortalConfig, ownerName?: string, hasCustomBase = false): string[] {
  const parts: string[] = []
  if (!hasCustomBase) parts.push('Tu es un assistant IA intégré à un portail de données Data Fair.')

  // Single fact line (title / owner / domain) instead of three sentences: shorter
  // and keeps the prompt prefix homogeneous across users for better prompt caching.
  const hostname = import.meta.client ? window.location.hostname : ''
  const descr: string[] = []
  if (portalConfig.title) descr.push(`intitulé « ${portalConfig.title} »`)
  if (ownerName) descr.push(`géré par « ${ownerName} »`)
  if (hostname) descr.push(`accessible sur ${hostname}`)
  if (descr.length) parts.push(`Ce portail est ${descr.join(', ')}.`)

  const origin = import.meta.client ? window.location.origin : ''
  if (origin) {
    parts.push(`Présente toujours les liens vers les pages du portail comme des liens markdown avec une URL absolue, par exemple \`[Voir la carte](${origin}/datasets/mon-jeu/map)\` — jamais un chemin relatif ni une URL brute non formatée.`)
  }
  return parts
}
