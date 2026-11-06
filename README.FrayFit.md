# FrayFit

FrayFit, version personnelle de Franck Raymond, basée sur OpenGym par Duarte Santos.

Cette version dérivée non commerciale conserve l’intégralité du catalogue OpenGym, des fiches, des variantes, des traductions et des animations, ainsi que les comptes, programmes, séances et historiques existants. Elle personnalise l’identité et l’accueil. Elle ne revendique aucun droit exclusif sur les contributions ou contenus d’origine.

Le code source correspondant est disponible sur la [branche personnelle FrayFit](https://github.com/franck18/openGym/tree/codex/frayfit-personal). Le code et ses modifications restent soumis à la [licence AGPL du projet](LICENSE). Consulter également [OpenGym d’origine](https://gitlab.com/DuarteSantos8/opengym) et les [mentions tierces complètes](NOTICE.md), conservées sans modification.

Les images et animations d’exercice © Aliaksandr Makatserchyk, Gym visual, gymvisual.com sont sous licence distincte et ne sont pas couvertes par l’AGPL. Cette version personnelle non commerciale conserve les médias 180 × 180 px inchangés avec leurs mentions, conformément à NOTICE.md. Une utilisation commerciale ou autre réutilisation nécessite une licence appropriée de Gym visual. Ces médias ne doivent pas alimenter des outils d’IA.

La page publique `frontend/public/frayfit-credits.html` expose les crédits et liens vers les sources depuis la connexion et la navigation FrayFit. L’icône SVG FrayFit est un nouveau dessin géométrique écrit en code, indépendant des médias d’exercice. Les icônes PNG historiques sont conservées comme compatibilité d’installation.

Les clés de stockage, identifiants, formats de profil, API et origine du serveur ne changent pas. Le français est la langue initiale d’une nouvelle installation ; les choix déjà enregistrés sont conservés. Le déploiement doit garder le même backend et le même dossier de données.

Validation ciblée de l’identité et des parcours de connexion : depuis `frontend`, exécuter `npm test -- src/views/Login.frayfit.test.jsx src/views/Login.password.test.jsx src/views/Login.device-link.test.jsx src/views/Login.lost-access.test.jsx src/lib/frayfit-metadata.test.js`. Voir aussi `docs/frayfit-design.md` et `docs/frayfit-plan.md`.
