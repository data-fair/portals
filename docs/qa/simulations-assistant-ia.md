# Simulations de l'assistant IA (portails) — état des lieux QA

État au 02/10/2026, mesuré sur la branche `fix-agents-cases` (pas encore livrée). Images : `agents:main` (a96415c), `data-fair:master` (592c24d). Dépendances : `@data-fair/lib-agents-sim` 0.9.0, `@data-fair/lib-vue-agents` 0.6.1, `@data-fair/lib-vuetify-agents` 0.6.4, `@data-fair/agent-tools-data-fair` 0.6.4, `@koumoul/vjsf` 4.6.1, `@json-layout/core` 2.9.1 (éditeur de page) et 2.10.0 (éditeur de portail).

## En bref

Avant corrections, l'assistant ne réussissait aucune tâche de back-office (0 sur 12), avec Sonnet comme avec Haiku. Les parcours visiteurs du portail réussissaient tous (6 sur 6). Après corrections, la modification d'une page réussit avec les deux modèles (4 sur 4). La configuration du portail et la création d'une page suivie de son ajout au menu échouent encore.

- **Les parcours visiteurs sont solides.** Lien filtré et question sur les données réussissent avec les deux modèles. Une friction reste systématique : le premier message d'un visiteur anonyme échoue (« anonymous action token not yet valid »). Elle relève du service agents.
- **La modification d'une page fonctionne désormais.** Titre, description et blocs sont modifiés, la personne valide le brouillon elle-même et l'assistant le confirme. Avant, aucun run n'aboutissait : personne ne savait que les modifications vont dans un brouillon, ni comment le valider.
- **La configuration du portail reste bloquée.** Les outils de formulaire n'acceptaient que des chemins internes (`/$comp-4/$comp-3/menu`), et le sous-agent tournait en rond plus de 5 minutes. C'est corrigé dans json-layout, mais pas encore publié. Le pont de simulation fausse aussi ce cas : il remplace les gros résultats d'outil par un fichier que le modèle ne peut pas lire.
- **Créer une page puis l'ajouter au menu échoue encore.** Le parcours traverse l'assistant de création, l'éditeur de page puis celui du portail. La dernière correction (ajout au menu d'une page de catalogue) n'a pas encore été mesurée.

## Résultats de la référence

Trois passes avant corrections (deux Sonnet, une Haiku), puis une passe Sonnet et une passe Haiku après. La persona tourne toujours sur Sonnet. Entre parenthèses : le nombre de frictions relevées par le juge.

| Cas | Ce que la personne veut | Sonnet 1 | Sonnet 2 | Haiku | Sonnet après | Haiku après |
| --- | --- | --- | --- | --- | --- | --- |
| `page-parametres` | Changer le titre et la description d'une page, voir le changement, l'enregistrer | ✗ (6) | ✗ (5) | ✗ (5) | ✓ (0) | ✓ (1) |
| `page-contenu` | Ajouter un paragraphe d'introduction et la liste des données en haut d'une page | ✗ (7) | ✗ (6) | ✗ (4) | ✓ (1) | ✓ (1) |
| `portail-configuration` | Passer la couleur principale en vert foncé et mettre une page dans le menu | ✗ (8) | ✗ (8) | ✗ (3) | invalide ×2 (tour > 5 min) | ✗ (8) |
| `page-puis-menu` | Créer une page « Agenda des événements » puis l'ajouter au menu | ✗ (7) | ✗ (6) | ✗ (8) | ✗ (8) | ✗ (7) |
| `portail-lien-filtre` | Un lien vers les équipements de plus de 500 places, puis une question sur la page ouverte | ✓ (4) | ✓ (1) | ✓ (1) | ✓ (1) | ✓ (2) |
| `portail-question-donnees` | Les piscines et les plus grandes, affichées à l'écran | ✓ (1) | ✓ (1) | ✓ (2) | ✓ (1) | ✓ (1) |

Pourquoi les échecs après corrections :

- **`portail-configuration`, Sonnet.** Deux runs invalides : un tour a dépassé 5 minutes, avec 78 à 86 appels du sous-agent qui cherchait des chemins (`/menu`, `/theme/colors/primary`) refusés par les outils. Au second run, la personne a pourtant vu la couleur et l'entrée de menu dans le formulaire, ce qu'aucun run de la référence n'avait obtenu.
- **`portail-configuration`, Haiku.** Le pont de simulation a remplacé la description du formulaire (85 000 caractères) par un fichier illisible pour le modèle. Le sous-agent n'a donc jamais vu les chemins du formulaire. Un vrai défaut est apparu au passage : `setData` ne fusionnait que le premier niveau des objets et a effacé tout le thème du brouillon.
- **`page-puis-menu`, Sonnet.** L'assistant a fait créer une page de catalogue d'événements, puis l'a cherchée dans les entrées de menu « Page libre ». Or une page de catalogue s'ajoute comme « Page standard ». La fin du run est invalide : une pause de 1h47 a fait expirer la session de connexion.
- **`page-puis-menu`, Haiku.** Le modèle a écrit lui-même de faux messages de la personne et de faux événements de l'application, puis a agi en conséquence. Il n'a jamais atteint l'éditeur du portail.

## Ce que la référence a fait corriger

| Constat | Correction | Où |
| --- | --- | --- |
| La personne cliquait sur « Valider le brouillon », ne voyait rien et concluait que rien n'était enregistré, alors que le brouillon était bien publié | Les actions de brouillon sont de vrais boutons (rôle et état désactivé exposés), avec un message de confirmation et un événement transmis au chat | portals (`ui`) |
| L'assistant ignorait tout des brouillons : il inventait un bouton « Enregistrer » ou un menu « Actions », promettait des aperçus et ne savait pas où se règle le menu | Les éditeurs de page et de portail et l'assistant de création publient pour le chat leur fonctionnement : sous-agent, brouillon, liens d'aperçu, emplacement du menu, étapes, état du brouillon | portals (`ui`) |
| Les outils de l'éditeur de portail lisaient des entrées de menu absentes du formulaire affiché | vjsf 4.6.1 et json-layout 2.9.1/2.10.0 (activation d'une variante par son index) | portals (dépendances) |
| Le bouton « Demander à l'assistant » était libellé en anglais dans les éditeurs | Libellé traduit | portals (`ui`) |
| Sur le portail, l'assistant donnait un lien au lieu d'afficher la page, et décrivait l'écran de mémoire | Le prompt du portail lui demande de naviguer lui-même et de lire la page avant de la décrire | portals (`portal`) |
| `pageFilters_get` répondait « aucun filtre » sur un tableau filtré par son URL | Les filtres portés par l'URL sont signalés | portals (`portal`) |
| Une page de catalogue ne trouvait pas sa place dans le menu | Les consignes distinguent « Page libre » (page libre) et « Page standard » (pages de catalogue) | portals (`ui`), non mesuré |
| Les outils de formulaire refusaient les chemins de données (`/menu`) sur un formulaire à onglets | Ces chemins sont acceptés, et l'erreur indique où commence le formulaire | json-layout, non publié |
| `setData` effaçait les sous-objets voisins (tout le thème) | Les objets sont fusionnés à toutes les profondeurs | json-layout, non publié |
| Premier message d'un visiteur anonyme refusé (« anonymous action token not yet valid ») | Signalé, non corrigé ici | agents |
| Haiku écrit de faux messages de la personne et recopie le format des événements de l'application | Signalé, non corrigé ici | agents |
| Sur les pages et portails, le back-office propose les outils d'application ; `list_pages` renvoie la navigation du back-office ; `navigate` accepte des routes inexistantes | Signalé, non corrigé ici | data-fair |
| Les liens de tableau utilisent `select=` au lieu de `cols=` | Corrigé dans les sources de data-fair (#606), paquet `@data-fair/agent-tools-data-fair` à republier | data-fair |
| La persona ne voit pas l'intérieur des iframes ni les nouveaux onglets, et n'a pas de clavier ; le pont remplace les gros résultats d'outil par un fichier | Des vues dédiées ajoutées côté portals pour les iframes ; le reste est signalé | lib-agents-sim |

## Limites et prochaines étapes

1. **Publier json-layout**, puis mettre à jour portals. La branche json-layout a été validée en local, en remplaçant le code dans `node_modules`. `portail-configuration` y réussit avec Sonnet, pour la première fois. Avec Haiku, la tâche est faite au premier tour, mais le run échoue ensuite pour trois raisons :
   - `navigate` du shell data-fair accepte une route inexistante ;
   - la persona ne perçoit pas les couleurs ;
   - Haiku renie son propre résultat sous la pression.

   Avec la description du formulaire réduite de 83 à 55 Ko, le pont de simulation n'a plus renvoyé de fichier illisible.
2. **Remesurer `page-puis-menu`** avec la consigne sur les pages de catalogue. Le run doit aussi pouvoir se reconnecter si la session expire.
3. **Premier message des visiteurs anonymes** : la correction relève du service agents. Tant qu'elle n'est pas faite, chaque visiteur pressé perd sa première question.
4. **Haiku comme modèle principal** : il écrit lui-même de faux échanges sur les parcours longs. Il réussit les parcours courts mais n'est pas fiable sur les longs.
5. **Consignes par type d'objet** : extraire des skills `portals-config` et `portals-pages` de `@data-fair/lib` ce qui sert à l'assistant intégré, et prévoir de l'injecter dans la consigne de remplissage de json-layout.
6. **Couverture** : aucun cas ne concerne les réutilisations, les actualités ou les événements, ni un utilisateur sans droit d'écriture, ni l'anglais.

## Fonctionnement

Un utilisateur simulé (la persona) poursuit un objectif avec le vrai assistant, dans un vrai navigateur. Un juge lit ensuite le transcript et rend un verdict, avec la liste des frictions rencontrées.

- **Deux surfaces.**
  - Le back-office : le shell data-fair embarque le gestionnaire de portails, et l'assistant agit sur les formulaires par ses outils.
  - Le portail public : le visiteur anonyme dispose du chat du portail.
- **Un cas = une surface, une page, une persona, un objectif**, sans résultat attendu écrit à l'avance. Les données (portail, pages, jeux de données) sont recréées à chaque run.
- **La persona tourne sur Sonnet.** Elle regarde l'écran, clique et saisit. L'assistant tourne sur Sonnet par défaut et doit aussi être validé sur Haiku ; les sous-agents et la modération tournent sur Haiku.
- **Un run invalide n'est pas un échec produit.** Une limite de débit, une erreur du fournisseur, un tour bloqué plus de 5 minutes ou une session expirée rendent le run invalide, et il n'est pas jugé.

La suite se lance avec le skill `/agents-sim`. Elle reste hors de `npm test` et de la CI, à cause de son coût en quota, et réinitialise les données de test du poste.
