import type { PortalConfig } from '#api/types/portal-config'

/** Portal context appended to every agent's system prompt (domain/owner/title). */
export function portalPromptContext (portalConfig: PortalConfig, ownerName?: string): string[] {
  const parts: string[] = ['Tu es un assistant IA intégré à un portail de données Data Fair.']
  const domain = import.meta.client ? window.location.hostname : ''
  if (domain) parts.push(`Le nom de domaine de ce portail est "${domain}".`)
  if (ownerName) parts.push(`Ce portail est géré par "${ownerName}".`)
  if (portalConfig.title) parts.push(`Le titre de ce portail est "${portalConfig.title}".`)
  return parts
}

/** Hint shared with the global agent about offering filtered navigation views. */
export const navigateToFilteredViewHint = 'Quand tu effectues une recherche ou un filtrage de données dans un jeu de données, propose systématiquement à l\'utilisateur de naviguer vers une vue filtrée. Le sous-agent dataset_data inclut dans sa section Context un champ filterQuery (query string URL) et un champ columns (colonnes pertinentes). Utilise l\'outil navigate avec la filterQuery comme paramètre query en y ajoutant select=col1,col2,col3 à partir des clés de columns. Propose la vue tableau /datasets/{datasetId}/table, et si les données sont géolocalisées (présence de bbox, geo_distance dans la filterQuery, ou colonnes géographiques dans columns) propose également la vue carte /datasets/{datasetId}/map.'
