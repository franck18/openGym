# SDD ledger — plan: docs/frayfit-plan.md

Base : 549360eeae798619167f18d0dad1c2779fab3543. Branche : codex/frayfit-personal. Checkout neuf et isolé dans frayfit/.

| Tâches | Interface partagée | Analyse |
|---|---|---|
| 1 | Login/public et identité | Tests et fichiers concordent. Aucun changement d'authentification. |
| 2 | Store et navigation existants | Les interfaces sont lues et appelées, sans modification du format. |
| 1 + 2 | Identité visible FrayFit | Fichiers détenus séparément ; pas d'écriture concurrente dans App/main ou Login/public. |
| 3 + 1/2 | Catalogue/médias | Aucun changement autorisé dans catalogue/ ou les fichiers générés. |
| 4 + 1/2/3 | Tests et build | La revue porte sur les données conservées et les parcours réels. |
| 5 + 1/2 | Assets statiques | Backend et origine maintenus ; pas de reconstruction de l'hébergement ni de changement d'accès. |

Ruling : conserver la même origine de l'application et les clés de stockage existantes pour préserver les profils et les passkeys. Le nom visible devient FrayFit ; le nom d'hôte peut rester opengym pendant cette personnalisation.

Ruling : la totalité du contenu demandé est conservée dans un fork non commercial ; les contenus tiers ne deviennent pas exclusifs à Franck. Les modifications FrayFit et le code correspondant sont fournis sous la licence du projet.


## Validation avant publication

- Revue indépendante des tâches 1 et 2 : aucun problème critique ou important restant. Corrections du français initial, du choix de la dernière séance le même jour et des séries unilatérales.
- 19 suites ciblées : 369 tests réussis, puis 7 tests de connexion/CSP réussis après la dernière annotation de langue. Build de production réussi et hash CSP vérifié sur le HTML réellement construit.
- Catalogue : 6 554 fiches, 5 632 exercices principaux, 922 alias ; 13 108 médias, dimensions ≤ 180 × 180. Aucun diff Git dans le catalogue, les données générées, les licences, l’API, le store ou l’ancien accueil.
- Navigateur : ordinateur clair/sombre, mobile 391 × 844 sans débordement horizontal, profil invité local, programme corps entier, démarrage, série validée, minuteur, vidéo en lecture readyState=4/180×180 sans capture de média, fin/sauvegarde, rechargement persistant, recherche française (102 résultats pour développé couché).
- La suite exhaustive initiale a été interrompue pour contention des workers ; les tests nginx/sh ne sont pas exécutables nativement dans ce shell Windows. Les suites ciblées ont ensuite été exécutées avec deux workers et passent.
- Les icônes PNG historiques restent en repli d’installation ; SVG FrayFit prioritaire. Les écrans historiques gardent leurs traductions et préférences.
- Captures de l’interface : ../evidence/frayfit/. Aucune capture d’animation n’a été envoyée à un outil IA.
