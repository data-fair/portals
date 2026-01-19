# 📘 Analyse du Workflow : Réutilisations Utilisateurs (Branche Archivé)

Ce document documente l'exploration technique d'un workflow de réutilisations basé sur un système de Brouillon Global et explique pourquoi ce modèle a été invalidé au profit d'un modèle par Soumission/Copie.

## ⚙️ 1. Fonctionnement de cette version (POC)

Le modèle exploré tentait d'unifier l'édition utilisateur et l'administration via un système de gestion d'état complexe.

### Gestion des Identités

**`Owner` (Propriétaire) :** L'organisation propriétaire du portail. Elle détient les droits finaux.

**`Submitter` (Soumissionnaire) :** L'utilisateur (objet `User`) ayant créé la ressource depuis son espace personnel.

_**Note :** Le champ `Submitter` reste masqué sur les portails publics._

## Cycle de vie : Brouillon & Validation

**Édition isolée :** Toute modification (utilisateur ou admin) s'effectue sur un brouillon (`draft`).

**Demande de validation :** L'utilisateur déclenche un flag `requestedValidationDraft` pour signaler que le contenu est prêt.

**Action Admin :** L'administrateur examine le brouillon et, s'il le valide, écrase la version officielle par le contenu du brouillon.

**Multi-portails :** La réutilisation est une entité unique dont la visibilité est activée au cas par cas sur différents portails via le champ `requestedPortals`.

## ❌ 2. Pourquoi ce modèle est invalidé

L'expérimentation a soulevé trois problématiques majeures, dont une technique bloquante.

### 🚩 Problème majeur : La propriété des images (Bloquant)

Le système actuel de gestion des fichiers lie l'image à la personne qui l'upload.

Le conflit : Si un utilisateur soumet une réutilisation avec une image, il reste l'unique propriétaire de l'image. L'organisation (`Owner`) n'a pas les droits nécessaires pour gérer ou redistribuer ce fichier média.

Conséquence : Résoudre ce point nécessiterait une refonte profonde du moteur de gestion des médias pour transférer ou partager la propriété des fichiers lors de la validation.

### ⚠️ Problème secondaire : Risque de collision d'édition

En utilisant un brouillon unique partagé entre l'utilisateur et l'administrateur :

Un administrateur pourrait valider par erreur des modifications intermédiaires effectuées par l'utilisateur sans les avoir relues.

Le manque de "verrous" sur le brouillon rend la cohabitation entre édition "backoffice" et "espace personnel" dangereuse pour l'intégrité des données.

### 📢 Problème annexe : Désynchronisation Multi-Portails

Le concept de "Brouillon unique" est incompatible avec une diffusion sur plusieurs portails ayant des cycles de validation différents.

Mettre à jour le brouillon pour le Portail B entraîne mécaniquement une mise à jour (potentiellement indésirable) du contenu déjà en ligne sur le Portail A.

## 🎯 3. Nouvelle Orientation : Le Modèle "Bouteille à la mer"

Suite à cette analyse, la version finale s'orientera vers un fonctionnement plus robuste et simple, inspiré de la V1 de Portails :

**Propriété Initiale :** L'utilisateur est initialement le `Owner` de sa réutilisation dans son espace personnel.

**Mécanisme de Soumission :** Lorsqu'il demande une publication sur un portail, la réutilisation est copiée dans l'organisation propriétaire du portail.

**Transfert de contrôle :** Une fois soumise, l'utilisateur ne peut plus modifier ni supprimer la copie reçue par l'organisation. Il "lance une bouteille à la mer".

**Suivi :** L'utilisateur conserve une vue en lecture seule pour suivre l'état de sa soumission (en attente, validée, rejetée).

**Modération :** Toute demande ultérieure de modification ou suppression doit passer par un formulaire de contact ou l'administrateur du portail.

---

Note : Cette branche est conservée à titre de trace historique des développements effectués. Les notifications n'ont pas été implémentées dans cette version.
