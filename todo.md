# Todo — Enrichissements PneumaSim

## 1. Vérin proportionnel (course variable selon la pression)
- [ ] Type `cyl-prop` dans engine.ts : typeDefs, logique tick (position cible ∝ pression chambre A), symbole ISO, rendu dans SheetCanvas
- [ ] Entrée palette (section Actionneurs) avec icône + data-tooltip-title/doc ISO 1219
- [ ] Test moteur (nœud) + test E2E navigateur : pA pressurisée → piston monte proportionnellement

## 2. Sauvegarde locale favoris (localStorage)
- [ ] Boutons Enregistrer / Charger / Mes favoris dans la barre d'outils Workbench
- [ ] store favorites : liste nom + date + doc JSON, CRUD via Dialog shadcn
- [ ] Chargement d'un favori remplace le schéma courant (loadDoc)
- [ ] Test E2E : enregistrer → recharger page → retrouver → charger

## 3. Mode « exercice »
- [ ] Page/route /exercice avec liste d'exercices (ex : relier capteur au pilotage Y1, ajouter conduite manquante, ajouter vanne)
- [ ] Définition exercice : doc attendu (composants + conduites), indices, critère de validation
- [ ] Validation : comparer composants présents + conductivité P→A, S→Y ; bouton Vérifier + feedback OK/ko
- [ ] 2-3 exercices types (temporisation, bistable incomplet)
- [ ] Test E2E : exercice résolu correctement → validé

## 4. Finalisation
- [ ] Audit visuel / screenshots, checkpoint, livraison
