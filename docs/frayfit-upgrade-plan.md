# FrayFit : programmes et régularité

Objectif demandé : remplacer Sport par FrayFit dans tous les menus du portfolio et améliorer concrètement l’application après recherche GitHub.

Pistes étudiées : wger (routines/progression), Workout.cool (choix des exercices/programmes), Ryot (statistiques). Option retenue : enrichir les points d’entrée FrayFit avec des composants originaux sur le moteur existant. Une migration de moteur ajouterait une conversion de comptes et une seconde base ; un simple relooking ne rendrait pas les parcours plus utiles.

1. Portfolio : renommer uniquement les libellés Sport/Training vers FrayFit, conserver liens et portrait, adapter génération/validation et publier avec sauvegarde et bail SHA256.
2. Studio des programmes : filtre de fréquence, adaptation au matériel existant, aperçu détaillé des séances avant ajout, confirmation des jours déjà occupés, réutilisation du catalogue/moteur starter existant.
3. Élan sur 28 jours : nombre réel de séances, séries et durée ; comparaison aux 28 jours précédents ; calendrier de 12 semaines ouvrant les journées réelles ; aucune donnée fictive, aucune promesse médicale ni score arbitraire.
4. Présence FrayFit sur mobile et accent bleu de navigation, raccourcis réels pour programmes/bibliothèque/historique. Préserver les préférences explicites, l’API et tous les médias.
5. Tests, revue indépendante, ordinateur/mobile, publication et contrôle public.

Architecture : composants/programmes et élan séparés, calculs purs testés dans lib/, FrayFitHome comme composition. Pas de nouvelle dépendance, pas de modification du catalogue, des licences, du format des profils ou des routines existantes.

Design : prolongement du concept FrayFit déjà livré : cobalt #285de5, panneaux ardoise/clair, même typographie système et icônes. Éléments nouveaux justifiés par les nouveaux parcours ; aucune photo ni image sportive à générer ou à traiter. Pas de nouveau concept global pour ces composants dans le système existant.

Répartition : agent menu possède uniquement le portfolio hors frayfit/ ; agent programme possède FrayFitPrograms.jsx, frayfit-programs.css et tests/helpers dédiés ; coordinateur possède Home, CSS principal, élan/helper/tests et intégration. Revue avant publication. Publication déjà autorisée par la demande et la session précédente.
