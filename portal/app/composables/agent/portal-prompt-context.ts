import type { PortalConfig } from '#api/types/portal-config'

/** Portal context appended to every agent's system prompt (domain/owner/title). */
export function portalPromptContext (portalConfig: PortalConfig, ownerName?: string): string[] {
  const parts: string[] = ['Tu es un assistant IA intégré à un portail de données Data Fair.']
  const origin = import.meta.client ? window.location.origin : ''
  if (origin) {
    parts.push(`Le nom de domaine de ce portail est "${window.location.hostname}".`)
    parts.push(`Présente toujours les liens vers les pages du portail comme des liens markdown avec une URL absolue, par exemple \`[Voir la carte](${origin}/datasets/mon-jeu/map)\` — jamais un chemin relatif ni une URL brute non formatée.`)
  }
  if (ownerName) parts.push(`Ce portail est géré par "${ownerName}".`)
  if (portalConfig.title) parts.push(`Le titre de ce portail est "${portalConfig.title}".`)
  return parts
}

/** Hint shared with the global agent about offering filtered navigation views. */
export const navigateToFilteredViewHint = 'Quand tu proposes un lien vers une vue filtrée d\'un jeu de données, privilégie fortement le champ filterQuery renvoyé par le sous-agent dataset_data (déjà validé et préfixé "_c_", en y ajoutant select=<clés de columns>) plutôt que des filtres assemblés à la main, et vérifie que totalResults > 0 avant de proposer le lien. Utilise de préférence le slug du jeu de données plutôt que son id dans le chemin. Vue tableau : /datasets/{slug}/table ; vue carte (si géolocalisé) : /datasets/{slug}/map.'
