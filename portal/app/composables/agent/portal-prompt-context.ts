import type { PortalConfig } from '#api/types/portal-config'

/** Portal context appended to every agent's system prompt (domain/owner/title). */
export function portalPromptContext (portalConfig: PortalConfig, ownerName?: string): string[] {
  const parts: string[] = ['Tu es un assistant IA intégré à un portail de données Data Fair.']
  const origin = import.meta.client ? window.location.origin : ''
  if (origin) {
    parts.push(`Le nom de domaine de ce portail est "${window.location.hostname}".`)
    parts.push(`Présente les liens vers les pages du portail en URL absolue, préfixée par "${origin}", jamais en chemin relatif.`)
  }
  if (ownerName) parts.push(`Ce portail est géré par "${ownerName}".`)
  if (portalConfig.title) parts.push(`Le titre de ce portail est "${portalConfig.title}".`)
  return parts
}

/** Hint shared with the global agent about offering filtered navigation views. */
export const navigateToFilteredViewHint = 'Quand tu filtres ou recherches des données dans un jeu de données, propose à l\'utilisateur des liens vers les vues filtrées : la vue tableau /datasets/{datasetId}/table, et si les données sont géolocalisées la vue carte /datasets/{datasetId}/map. Utilise le champ filterQuery du sous-agent dataset_data comme query string (ses filtres sont déjà préfixés "_c_"), en y ajoutant select=<clés de columns>.'
