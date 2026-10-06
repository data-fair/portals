// What an assistant editing a portal configuration needs to know beyond the schema: carried
// to the form tools by the root x-agent-guide annotation (json-layout >= 2.11). Field-level
// only — the editor's workflow (drafts, previews) is published by the manager UI itself.
// Extracted from the portals-config skill of @data-fair/lib.
export const agentGuide = {
  en: `Editing a data portal's configuration.

- Colours: in assisted mode (theme.assistedMode) only the main, secondary and accent colours are set (theme.assistedModeColors); every palette (light, dark, high contrast) and the text colours are recomputed from them when the draft is saved, overwriting colours set by hand. For an exact colour elsewhere (background, a text colour), turn assisted mode off first.
- The header takes its own colour (header.color), else the navigation bar's (navBar.color): the main colour only shows there when one of them is « primary ».
- Menu (menu.children): an existing free page is a « Page libre » item, its page picked among the suggestions; a catalog or standard page (home, contact, datasets, events, news, legal notice…) is a « Page standard » item with its type; an external link needs its URL; a submenu groups items. A standard item for a page type the portal has no published page of leads to a 404.
- Social links take an identifier, not a URL (linkedin: koumoul).
- The breadcrumb stays hidden until a position is chosen.
- When the header shows the portal title, it is the main heading of every page.
- Dataset and application cards only show what is set explicitly (summary, thumbnail, action buttons…).
- The contact email is never shown publicly: it receives the contact form's messages.
- Fonts: use a name from the list; an unknown name silently falls back to the browser's font.`,
  fr: `Édition de la configuration d'un portail de données.

- Couleurs : en mode assisté (theme.assistedMode), seules les couleurs principale, secondaire et d'accentuation se règlent (theme.assistedModeColors) ; toutes les palettes (claire, sombre, contraste élevé) et les couleurs de texte en sont recalculées à l'enregistrement du brouillon, ce qui écrase les couleurs posées à la main. Pour une couleur exacte ailleurs (fond, couleur de texte), désactiver d'abord le mode assisté.
- L'entête prend sa propre couleur (header.color), sinon celle de la barre de navigation (navBar.color) : la couleur principale n'y apparaît que si l'une d'elles est « Primaire ».
- Menu (menu.children) : une page libre existante est un élément « Page libre », sa page choisie parmi les suggestions ; une page de catalogue ou standard (accueil, contact, données, événements, actualités, mentions légales…) est un élément « Page standard » avec son type ; un lien externe demande son URL ; un sous-menu regroupe des éléments. Un élément standard vers un type de page que le portail ne publie pas mène à une erreur 404.
- Les réseaux sociaux prennent un identifiant, pas une URL (linkedin : koumoul).
- Le fil d'Ariane reste masqué tant qu'aucune position n'est choisie.
- Quand l'entête affiche le titre du portail, c'est le titre principal de chaque page.
- Les vignettes de jeux de données et de visualisations n'affichent que ce qui est réglé explicitement (résumé, image, boutons d'action…).
- L'adresse de contact n'est jamais affichée publiquement : elle reçoit les messages du formulaire de contact.
- Polices : utiliser un nom de la liste ; un nom inconnu bascule sans erreur sur la police du navigateur.`
}
