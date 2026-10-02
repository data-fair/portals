// What an assistant editing a portal page needs to know beyond the schema: carried to the
// form tools by the root x-agent-guide annotation (json-layout >= 2.11). Field-level only —
// the editor's workflow (drafts, previews) is published by the manager UI itself.
// Extracted from the portals-pages skill of @data-fair/lib.
export const agentGuide = {
  en: `Editing a page of a data portal.

- Write only what the person asked for, in their words: never invent facts about their organisation, services or figures. When they describe a text instead of giving it, keep it short and tell them what you wrote.
- Headings are title blocks, not markdown # in a text block. A title's visual size and its semantic level are set separately; a page has one main heading (level h1), or none when the portal header already shows the portal title.
- A table of contents is built from the title blocks whose anchor is enabled and listed in the table of contents; there is no page-level option.
- Text and alert blocks take markdown, without iframes.
- A data-fair visualisation goes in an application block; an iframe block only shows external sites the portal allows.
- « Liste de jeux de données » shows the latest datasets (3 by default); « Catalogue de données » lists and searches them all.
- Cards need their content and actions lists, even empty; tabs need an alignment.
- Keep Mermaid diagrams narrow (top to bottom, short labels): wide ones are scaled down until unreadable.
- Labels in sentence case.`,
  fr: `Édition d'une page d'un portail de données.

- N'écrire que ce que la personne a demandé, avec ses mots : ne jamais inventer de faits sur son organisation, ses services ou ses chiffres. Quand elle décrit un texte au lieu de le donner, rester bref et lui dire ce qui a été écrit.
- Les titres sont des blocs titre, pas des # markdown dans un bloc texte. La taille visuelle et le niveau sémantique d'un titre se règlent séparément ; une page a un seul titre principal (niveau h1), ou aucun quand l'entête du portail affiche déjà le titre du portail.
- Un sommaire se construit à partir des blocs titre dont l'ancre est activée et inscrite au sommaire ; il n'existe pas d'option au niveau de la page.
- Les blocs texte et alerte acceptent du markdown, sans iframe.
- Une visualisation data-fair va dans un bloc application ; un bloc iframe n'affiche que des sites externes autorisés par le portail.
- « Liste de jeux de données » montre les derniers jeux (3 par défaut) ; « Catalogue de données » les liste et permet de les chercher tous.
- Les cartes demandent leurs listes de contenu et d'actions, même vides ; les onglets demandent un alignement.
- Garder les diagrammes Mermaid étroits (de haut en bas, libellés courts) : un diagramme large est réduit jusqu'à devenir illisible.
- Libellés en casse de phrase.`
}
