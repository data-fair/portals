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
