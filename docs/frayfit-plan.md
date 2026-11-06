# FrayFit Implementation Plan

**Goal:** Livrer FrayFit à partir du fork personnel en conservant l'intégralité du contenu et des données.

**Architecture:** React/Vite/Zustand et backend Node existants, avec nouvel accueil et nouvelle identité. Les fichiers et l'API de profil gardent leur format et leur origine.

**Spec:** docs/frayfit-design.md

## Contraintes

Ne pas modifier les médias, les traductions du catalogue, les formats de données ou les identifiants. Ne pas ajouter de dépendance. Aucune migration de compte. Le code source et les crédits restent accessibles sous les licences existantes.

## Tâches

1. [x] Identité et connexion : fichiers publics, titre, manifeste, écran de connexion, informations de version personnelle et tests ciblés. Propriétaire : agent branding. Ne pas modifier App.jsx, main.jsx, views/Home.jsx, le store ou les médias.
2. [x] Nouvel accueil et navigation : FrayFitHome.jsx, FrayFitSidebar.jsx, frayfit.css, App.jsx et main.jsx ; fonctions réelles réutilisées via les interfaces existantes ; tests des états vides, de la reprise de séance et de la navigation. Propriétaire : agent interface. Ne pas modifier les fichiers de la tâche 1.
3. [x] Intégrité du catalogue : inventaire et contrôle des fichiers et des références médias ; valider l'absence de changement de données, de licence ou de médias. Propriétaire : coordinateur.
4. [x] Revue de chaque tâche puis revue globale, tests et build de production. Corriger les régressions importantes avant publication.
5. [x] Publier le code dans la branche personnelle GitHub et les assets de production dans l'instance existante. Conserver backend, domaine et données. Tester depuis le portfolio, sur mobile et ordinateur, sans compte Blitz.

## Risques à vérifier

Comptes vides ; séance déjà en cours ; plusieurs routines le même jour ; exercices personnalisés ; préférences existantes ; traductions ; routes de l'ancienne interface ; contraste clair/sombre ; service worker et caches après déploiement.
