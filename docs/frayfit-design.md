# FrayFit : version personnelle complète

## Objectif

Franck Raymond demande FrayFit, avec toute la bibliothèque, les fiches et les animations d'OpenGym, les programmes et le suivi des séances. Le choix de l'ensemble des médias impose une version dérivée non commerciale, avec conservation des licences, crédits et fichiers 180 px inchangés. Les personnalisations FrayFit sont nouvelles, sans prétendre transférer les droits des contenus tiers.

## Exigences

- Conserver toute la base actuelle à la révision 549360eeae798619167f18d0dad1c2779fab3543 : catalogue, variantes, traductions, animations, identifiants et programmes de départ.
- Conserver le moteur de séance, les séries/répétitions/charges/repos, les comptes et passkeys, les historiques et leur synchronisation.
- Nouvelle identité FrayFit, en français par défaut pour une nouvelle installation ; les préférences existantes ne sont pas réinitialisées.
- Accueil original avec prochaine séance, semaine, programmes et progression réelle. Ne pas inventer de performances ou ajouter de données dans les comptes.
- Palette : blanc #ffffff, surfaces #f5f7fb, encre #172338, cobalt #285de5 ; interface système sans empattement. Navigation latérale sur ordinateur, navigation compacte existante sur téléphone. Conserver les thèmes et les préférences d'accessibilité.
- Les vues détaillées existantes restent accessibles. Tous les boutons du nouvel accueil doivent ouvrir une fonction réelle.
- Une page de crédits et les liens vers le code source doivent rester disponibles. Ne modifier ni les médias ni leurs mentions. Ne transmettre aucun média d'exercice à un outil d'IA.
- Déploiement à la même adresse et avec le même backend et le même dossier de données pour conserver les profils et les passkeys.

## Validation

Tests du nouvel accueil et de la nouvelle identité, contrôles du catalogue et des médias, tests des parcours de bibliothèque, programme, séance et connexion. Vérifier mobile/ordinateur et les thèmes. Vérifier une animation par métadonnées de lecture, sans capture de son contenu. Sauvegarder les ressources de la version publiée et déployer les seuls nouveaux assets puis index/manifest/service worker. Vérifier l'application publique et garder un retour arrière.
