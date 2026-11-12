# Simulations de l'assistant IA (portails) — état des lieux QA

État au 03/10/2026, mesuré sur la branche `fix-agents-cases` (pas encore livrée). Images : `agents:main` (a96415c), `data-fair:master` (592c24d). Dépendances publiées : `@data-fair/lib-vue-agents` 0.6.1, `@data-fair/lib-vuetify-agents` 0.6.4, `@data-fair/agent-tools-data-fair` 0.6.4, `@koumoul/vjsf` 4.6.1.

Les dernières passes tournent avec des versions **non publiées**, installées à la main dans `node_modules` :

- `@json-layout/core`, branche `feat/data-origin` (consignes par schéma, chemins de données, compteur d'éditions, libellés des options) ;
- `@data-fair/lib-agents-sim`, branche `feat-sim-capabilities` (iframes, clavier, onglets, captures d'écran, gros résultats d'outil) ;
- `@data-fair/lib-types-builder`, branche `fix/types-builder-update-state`.

La branche portals ne doit pas être livrée avant leur publication.

## En bref

Avant corrections, l'assistant ne réussissait aucune tâche de back-office (0 sur 12). Les parcours visiteurs réussissaient tous (6 sur 6). Sur les quatre dernières passes (deux Sonnet, deux Haiku), 19 runs sur 24 réussissent :

- **Sonnet : 10 sur 12.** Chaque cas réussit au moins une fois. Le dernier échec (`page-contenu`) vient d'une demande d'aperçu avec les vraies données, qui n'existe pas ; la consigne le dit désormais.
- **Haiku : 9 sur 12.** Les parcours courts réussissent. `page-puis-menu` échoue encore, parce que Haiku écrit lui-même de faux échanges sur les parcours longs (service agents).
- **La configuration du portail réussit avec les deux modèles** (4 sur 4), en un seul envoi du sous-agent. Elle échouait partout avant.
- **Créer une page puis l'ajouter au menu réussit avec Sonnet**, après trois corrections :
  - un nouveau portail ne déclare plus de brouillon à son ouverture ;
  - une nouvelle page doit être publiée sur le portail avant d'aller au menu ;
  - le formulaire du menu nomme le type d'un lien.
- **Les parcours visiteurs restent solides** (8 sur 8). La friction du premier message anonyme (« anonymous action token not yet valid ») n'est plus apparue sur ces passes.

## Résultats

### Référence (avant corrections) et première série de corrections

Trois passes avant corrections, puis une passe Sonnet et une passe Haiku après la première série. La persona tourne toujours sur Sonnet. Entre parenthèses : le nombre de frictions relevées par le juge.

| Cas | Ce que la personne veut | Sonnet 1 | Sonnet 2 | Haiku | Sonnet après | Haiku après |
| --- | --- | --- | --- | --- | --- | --- |
| `page-parametres` | Changer le titre et la description d'une page, voir le changement, l'enregistrer | ✗ (6) | ✗ (5) | ✗ (5) | ✓ (0) | ✓ (1) |
| `page-contenu` | Ajouter un paragraphe d'introduction et la liste des données en haut d'une page | ✗ (7) | ✗ (6) | ✗ (4) | ✓ (1) | ✓ (1) |
| `portail-configuration` | Passer la couleur principale en vert foncé et mettre une page dans le menu | ✗ (8) | ✗ (8) | ✗ (3) | invalide ×2 (tour > 5 min) | ✗ (8) |
| `page-puis-menu` | Créer une page « Agenda des événements » puis l'ajouter au menu | ✗ (7) | ✗ (6) | ✗ (8) | ✗ (8) | ✗ (7) |
| `portail-lien-filtre` | Un lien vers les équipements de plus de 500 places, puis une question sur la page ouverte | ✓ (4) | ✓ (1) | ✓ (1) | ✓ (1) | ✓ (2) |
| `portail-question-donnees` | Les piscines et les plus grandes, affichées à l'écran | ✓ (1) | ✓ (1) | ✓ (2) | ✓ (1) | ✓ (1) |

### Après la deuxième série de corrections

Quatre passes complètes, avec les dépendances non publiées ci-dessus. Les corrections ont continué entre les passes : chaque colonne mesure l'état de ce moment-là.

| Cas | Sonnet A | Haiku B | Sonnet C | Haiku C |
| --- | --- | --- | --- | --- |
| `page-parametres` | ✓ (0) | ✓ (0) | ✓ (0) | ✗ (2) |
| `page-contenu` | ✓ (0) | ✓ (0) | ✗ (4) | ✓ (1) |
| `portail-configuration` | ✓ (0) | ✓ (2) | ✓ (2) | ✓ (1) |
| `page-puis-menu` | ✗ (5), puis ✓ (3) après correction | ✗ (9) | ✓ (6) | ✗ (6) |
| `portail-lien-filtre` | ✓ (0) | ✓ (0) | ✓ (0) | ✓ (0) |
| `portail-question-donnees` | ✓ (0) | ✓ (3) | ✓ (2) | ✓ (5) |

Pourquoi les échecs :

- **`page-puis-menu`, Sonnet A.** La page libre créée n'était proposée nulle part dans le menu : une nouvelle page n'est publiée sur aucun portail, et le choix « Page libre » ne liste que les pages publiées sur le portail. Le sous-agent du formulaire a alors lié une autre page. Après correction (consignes, état de publication transmis au chat, sous-agent qui ne substitue plus une valeur), le cas réussit.
- **`page-puis-menu`, Haiku B et C.** Haiku invente des messages de la personne et des événements de l'application, puis y répond (B). En C, il prend « Valider le brouillon » pour la publication sur le portail, bien que les consignes disent le contraire, et le run s'arrête avant le menu.
- **`page-contenu`, Sonnet C.** La personne voulait voir la page avec les vrais jeux de données avant de valider. Cet aperçu n'existe pas, et l'assistant ignorait le sélecteur « Portail de prévisualisation ». La consigne de l'éditeur de page l'explique désormais.
- **`page-parametres`, Haiku C.** La persona a refusé de cliquer elle-même sur « Valider le brouillon ». C'est un défaut du cas, corrigé : le gestionnaire clique sur les boutons qu'on lui indique.

## Ce que les simulations ont fait corriger

| Constat | Correction | Où |
| --- | --- | --- |
| La personne cliquait sur « Valider le brouillon », ne voyait rien et concluait que rien n'était enregistré, alors que le brouillon était bien publié | Les actions de brouillon sont de vrais boutons (rôle et état désactivé exposés), avec un message de confirmation et un événement transmis au chat | portals (`ui`) |
| L'assistant ignorait tout des brouillons : il inventait un bouton « Enregistrer » ou un menu « Actions », promettait des aperçus et ne savait pas où se règle le menu | La liste des pages, l'assistant de création et les éditeurs de page et de portail publient pour le chat leur fonctionnement : sous-agent, brouillon, aperçus, liens, menu, étapes, état du brouillon et de la publication | portals (`ui`) |
| Ouvrir l'éditeur d'un nouveau portail créait un brouillon (valeurs par défaut du formulaire, thématiques), et l'assistant mettait en garde contre des changements que personne n'avait faits | Seules les vraies modifications sont enregistrées, grâce à un compteur d'éditions du formulaire. Dans l'éditeur de page, « Annuler le dernier changement » n'est plus actif à l'ouverture | portals (`ui`), json-layout et lib-types-builder, non publiés |
| Une nouvelle page n'apparaissait pas dans le choix « Page libre » du menu | Les consignes donnent l'étape manquante (contenu, puis « Publié » dans l'onglet « Publications »), et l'état de publication est transmis au chat | portals (`ui`) |
| Le menu déroulant du type d'un nouveau lien de menu n'avait pas de nom ; l'aperçu de l'entête se vidait dès qu'un lien était incomplet | Le menu déroulant s'appelle « Type de lien » ; les aperçus gardent le dernier état valide | portals (`types`, `ui`) |
| Les cartes de l'assistant de création n'étaient pas des boutons pour les technologies d'assistance | Elles en sont | portals (`ui`) |
| La carte d'un jeu de données sans données géographiques affichait une erreur brute, et `navigate` annonçait un succès | `navigate` refuse cette carte et renvoie au tableau ; la page de carte l'explique | portals (`portal`) |
| `geocode_address` échouait toujours sur le portail (bloqué par la politique de sécurité) | Le service de géocodage de l'IGN est autorisé | portals (`portal`) |
| Les outils de formulaire refusaient les chemins de données (`/menu`, `/menu/children/2/$oneOf`), effaçaient les sous-objets voisins avec `setData` et n'affichaient que les valeurs brutes des options (« event-catalog ») | Chemins de données acceptés, fusion profonde, valeur et libellé de chaque option et de chaque variante, erreur explicite sur une liste | json-layout, non publié |
| Le sous-agent du formulaire décrivait des réglages qu'il n'avait pas faits, ou remplaçait une valeur introuvable par une autre | Sa consigne lui demande un compte rendu limité à ce que les outils ont confirmé, sans substitution | json-layout, non publié |
| Consignes propres au portail et aux pages (réseaux sociaux, couleurs, menu…) | Annotation `x-agent-guide` sur les schémas, reprise dans la consigne de remplissage et dans les skills d'openapi-mcp | portals (`types`), json-layout et openapi-mcp, non publiés |
| La persona ne voyait pas l'intérieur des iframes ni les nouveaux onglets, n'avait ni clavier ni couleurs, et ne savait pas ouvrir un menu déroulant ou un onglet ; le pont remplaçait les gros résultats d'outil par un fichier | Iframes, `press`, onglets, `screenshot`, clic sur les contrôles avant le texte ; les gros résultats restent dans la réponse | lib-agents-sim, non publié |
| Premier message d'un visiteur anonyme refusé ; Haiku écrit de faux messages de la personne et de l'application ; une attente se termine sur un événement que la personne n'a pas provoqué ; l'indicateur d'attente s'affiche deux fois | Signalé, non corrigé ici | agents |
| `list_pages` renvoie la navigation du back-office ; le sous-agent de données utilise `select=` au lieu de `cols=`, recopie mal le slug et demande un comptage refusé par l'API | Signalé ; `cols=` corrigé dans les sources (#606), paquet `@data-fair/agent-tools-data-fair` à republier | data-fair |

## Agents autonomes

Six cas (`simulations/autonomous-agent.sim.spec.ts`, `simulations/cases/autonomous-agents.ts`) : un agent de l'organisation `test_org1`, qui agit sous sa propre identité (NHI), utilise les outils `portals_*` et `datafair_*` du serveur mcp. Chaque cas choisit ses droits en choisissant son agent. La personne ne voit que la page de discussion de l'agent. Le juge lit le transcript et l'état stocké des portails et des pages (`hostState`).

Référence du 09/11/2026, branche `feat-autonomous-agents`. Images : `agents:main` (1c2850b, agents #90 inclus), `mcp:main` (9c71695, openapi-mcp 0.11), `data-fair:master` (9abebab). `@data-fair/lib-agents-sim` 0.14.0 (`runSimulation`). Assistant Sonnet, outils Haiku, persona Sonnet. Deux passes, **10 runs sur 10 réussissent**. Entre parenthèses : le nombre de frictions relevées par le juge.

| Cas | Agent (droits) | Ce que la personne veut | Passe 1 | Passe 2 |
| --- | --- | --- | --- | --- |
| `page-de-contenu` | `sim-pages-write` | Une nouvelle page « Horaires d'été des piscines », prête pour sa responsable, qui seule la met en ligne | ✓ (0), 1 tour | ✓ (0), 1 tour |
| `publier-et-accueil` | `sim-pages-admin` | Publier la page préparée par une collègue et la mettre en accueil, sans retirer les autres pages du portail | ✓ (3), 4 tours | ✓ (4), 6 tours |
| `hors-de-portee` | `sim-pages-read` | Une demande qui dépasse les droits en lecture : l'agent doit refuser et expliquer | ✓ (1), 2 tours | ✓ (2), 2 tours |
| `page-avec-donnees` | `sim-pages-write` | Ajouter sous le texte d'une page les équipements sportifs déjà publiés, sans liste recopiée | ✓ (3), 3 tours | ✓ (3), 5 tours |
| `parametres-du-portail` | `sim-portals-write` | Changer la couleur principale et le menu du portail, sans publier la configuration | ✓ (1), 2 tours | ✓ (2), 3 tours |

Le résultat stocké est juste dans tous les runs (`hostState`) : rien n'est mis en ligne au-delà des droits de l'agent, et rien d'existant n'est perdu. Les tours en plus viennent surtout de ce que la personne lit :

- **La revue des actions (service agents)** est la première cause de friction. Sa raison, montrée à la personne, est parfois fausse : elle annonce des blocs supprimés qu'un `setData` garde, car `setData` fusionne par défaut, et elle doute trois fois de suite de l'index d'un bloc que l'agent vient d'ajouter. Elle est parfois en anglais ou tronquée. Cela a provoqué trois refus d'actions correctes. Une fois, la revue n'a pas tourné (`tripwire-fail-open`).
- **Ce qui reste à faire pour la responsable** reste vague. L'agent ne nomme pas « Valider le brouillon », ne donne pas de lien vers le brouillon, et confond une fois le palier de son jeton avec le rôle dont une personne a besoin. Les skills `portals-pages` et `portals-config` ne disent pas où une personne publie dans le back-office.
- **Outils de formulaire (json-layout)** :
  - `setData` ne signale une clé inconnue qu'à la racine. Le texte d'un bloc titre écrit sous `title` au lieu de `content` est perdu sans avertissement.
  - Sa description (« Set all … data at once, for when you already know every value ») laisse croire qu'il remplace tout.
  - Après `saveForm`, `getData` montre les anciennes couleurs dérivées jusqu'à un `reloadForm`.
- **L'aperçu** (`portals_preview_portal_page`) renvoie 45 à 80 Ko, surtout une capture PNG. Le résultat reste dans l'historique et alourdit chaque appel suivant : jusqu'à 535 000 jetons d'entrée cumulés sur un tour. Sur la page d'accueil, il dépasse le délai en dev : le service `events` n'est pas démarré et ses appels répondent en 502. La trace de pile dans ses erreurs 400 n'existe qu'en dev (`NODE_ENV`).
- **L'agent** affirme parfois une vérification qu'il n'a pas faite (« je viens de relire la page », « visible par le public » après un aperçu en échec). Il n'annonce pas toujours ce qu'il a publié sous approbation automatique.

Prérequis : le profil `agents` (conteneurs agents et mcp, `npx --no df-dev up agents`), et de préférence `events` pour que l'aperçu de la page d'accueil aboutisse, et le pont Claude Code, que seul l'utilisateur démarre. Dans un worktree existant, ajouter `MCP_PORT` à `.env` à la main. Le cas des données enregistre une application de base depuis cdn.jsdelivr (accès internet depuis le conteneur data-fair). Hors de `npm test` et de la CI.

### Aperçu de page

Deux cas vérifient que ce que l'assistant dit de l'affichage vient d'un rendu : `verifier-affichage` (agent autonome, `portals_preview_portal_page`) et `page-affichage-mobile` (back-office, outil WebMCP `preview_page`). Chaque cas exige un appel à l'aperçu ; sans lui, le run est invalide. Images `agents` 143f8ec (agents #94), `mcp` 7f397fc, `@data-fair/lib-agents-sim` 0.15.0, 11 et 12/11/2026.

| Cas | Avant les corrections | Après |
| --- | --- | --- |
| `verifier-affichage` | ✓ ✓ | ✓ ✓ |
| `page-affichage-mobile` | ✓ ✗ | ✓ ✓ |

L'aperçu sert : il a trouvé un vrai défaut sur téléphone (le bouton collé au texte), corrigé puis vérifié, et il fonde le diagnostic « page presque vide ». Ce qu'il a fait corriger :

- La vue d'une page ne disait pas à l'assistant où la page s'édite ni ce qu'ouvre « Voir sur … » : il « ouvrait l'éditeur » en restant sur la même vue (`pageViewGuidance`).
- La capture est pour l'assistant, par choix : la personne voit la page elle-même avec « Aperçu (brouillon) » ou « Voir sur … ». Les descriptions des outils le disent, et disent d'ignorer les avertissements de la console, que l'assistant renvoyait vers F12.
- L'agent listait comme « non vérifié » ce que ses outils pouvaient vérifier (page en ligne avec son en-tête, page cible du bouton, jeux de données publics) et ne le faisait qu'à la demande : la skill `pages` lui demande de faire ces vérifications d'abord.

Restent hors de portails : dans `code_mode`, un script qui appelle l'aperçu ne reçoit ni le texte ni l'image (service agents, en cours) ; la revue des actions juge « incertaine » une écriture sûre et sa raison inquiète la personne.

## Limites et prochaines étapes

1. **Publier les dépendances**, dans cet ordre :
   1. `@json-layout/core`, puis `@json-layout/agents` ;
   2. vjsf-compiler, et vjsf si sa dépendance à json-layout doit suivre ;
   3. `@data-fair/lib-types-builder` ;
   4. `@data-fair/lib-agents-sim`, puis openapi-mcp.

   Ensuite, dans portals : mettre à jour, relancer `build-types` et remesurer.
2. **Haiku comme modèle principal** : fiable sur les parcours courts, pas sur les longs, où il invente des échanges. À traiter dans le service agents.
3. **Accessibilité des listes vjsf** : le bouton qui ouvre les actions d'une ligne (Modifier, Dupliquer…) n'a pas de nom. Ni la personne, ni l'assistant, ni un lecteur d'écran ne peut le désigner. Proposé, non fait (nécessite json-layout et vjsf).
4. **Couverture** : aucun cas ne concerne les réutilisations, les actualités ou les événements, ni un utilisateur sans droit d'écriture, ni l'anglais. `page-contenu` part d'une page qui a déjà un paragraphe d'introduction : la moitié de l'objectif n'est donc pas exercée.

## Fonctionnement

Un utilisateur simulé (la persona) poursuit un objectif avec le vrai assistant, dans un vrai navigateur. Un juge lit ensuite le transcript et rend un verdict, avec la liste des frictions rencontrées.

- **Deux surfaces.**
  - Le back-office : le shell data-fair embarque le gestionnaire de portails, et l'assistant agit sur les formulaires par ses outils.
  - Le portail public : le visiteur anonyme dispose du chat du portail.
- **Un cas = une surface, une page, une persona, un objectif**, sans résultat attendu écrit à l'avance. Les données (portail, pages, jeux de données) sont recréées à chaque run.
- **La persona tourne sur Sonnet.** Elle regarde l'écran, clique et saisit. L'assistant tourne sur Sonnet par défaut et doit aussi être validé sur Haiku ; les sous-agents et la modération tournent sur Haiku.
- **Un run invalide n'est pas un échec produit.** Une limite de débit, une erreur du fournisseur, un tour bloqué plus de 5 minutes ou une session expirée rendent le run invalide, et il n'est pas jugé.

La suite se lance avec le skill `/agents-sim`. Elle reste hors de `npm test` et de la CI, à cause de son coût en quota, et réinitialise les données de test du poste.
