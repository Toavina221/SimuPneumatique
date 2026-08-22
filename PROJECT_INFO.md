# PneumaSim — Fiche Technique et Récapitulatif

Ce document contient toutes les informations essentielles pour la gestion, le déploiement et la maintenance de la plateforme **PneumaSim**.

## 1. Informations Générales
- **Nom du Projet** : PneumaSim
- **Propriétaire & Auteur** : Rovamampionina Toavina
- **Contact** : helpscannerapk@gmail.com
- **Type d'Application** : Application Web Statique (React 19 + Tailwind CSS 4)
- **Hébergement Recommandé** : Vercel, Netlify, ou tout serveur de fichiers statiques.

## 2. Clés et Intégrations
| Service | Identifiant / Clé | Statut |
| :--- | :--- | :--- |
| **Google AdSense** | `ca-pub-7281717868974793` | Actif (script & ads.txt inclus) |
| **Google Analytics** | `G-XXXXXXXXXX` | Configuré (à remplacer par votre ID réel) |
| **Google Search Console** | Fichiers de validation inclus | Prêt pour indexation |
| **Langues Supportées** | Anglais (Défaut), Français | Système i18n personnalisé |

## 3. Structure du Code Source
- `/client/src/lib/pneusim/engine.ts` : Moteur de simulation en temps réel.
- `/client/src/lib/pneusim/defs.ts` : Définitions ISO 1219 des 37 composants.
- `/client/src/pages/Workbench.tsx` : Éditeur CAD principal.
- `/client/src/pages/ExercisePage.tsx` : Mode exercice avec validation automatique.
- `/client/src/lib/i18n.ts` : Système de gestion des langues.
- `/public/assets/` : Dossier contenant le logo, le favicon et les images de prévisualisation.

## 4. Instructions de Déploiement (Vercel)
1. Décompressez le fichier `pneumasim.zip`.
2. Poussez le contenu sur un dépôt GitHub privé ou public.
3. Connectez votre compte Vercel au dépôt.
4. Vercel détectera automatiquement la configuration **Vite**.
5. Le fichier `vercel.json` à la racine gérera automatiquement les redirections pour éviter les erreurs 404.

## 5. Maintenance et Évolutions
- **Ajout de composants** : Modifiez `defs.ts` pour ajouter de nouveaux symboles et `engine.ts` pour leur logique.
- **Changement de langue** : Les textes sont centralisés dans `client/src/lib/i18n.ts`.
- **Publicité** : Pour changer les emplacements publicitaires, recherchez les commentaires `AD UNIT` dans le code.

---
*Document technique du projet PneumaSim — 22 août 2026.*


## 6. Final Release Audit

| Élément | Statut vérifié |
| :--- | :--- |
| Icône et favicon | Fichier local valide : `client/public/assets/logo.png`; référencé par `/assets/logo.png`. |
| Images | `hero.png`, `features.png` et `og-preview.png` sont présents et non vides dans `client/public/assets/`. |
| Langues | Anglais par défaut; français disponible via le sélecteur et mémorisé dans le navigateur. |
| Pages et liens | Accueil, éditeur, bibliothèque, exercices, mentions légales et confidentialité sont déclarés dans le routeur. |
| Boutons principaux | Navigation, chargement d'exemples, ajout de composants, simulation, exercices, modales et export sont câblés dans le code. |
| Responsive | Vérifié à 375 px, 768 px et 1280 px; l'éditeur s'empile sur mobile. |
| Indépendance | Aucun runtime, stockage ou analytics de la plateforme de développement ne figure dans le code déployable. |
| Publicité | Script AdSense et `ads.txt` présents avec l'identifiant éditeur `ca-pub-7281717868974793`. |

Le contrôle TypeScript et le build de production passent. La diffusion effective des annonces reste conditionnée par l'approbation du domaine par Google AdSense et par l'activation d'Auto ads ou le remplacement de la valeur vide `data-ad-slot` par un identifiant d'unité publicitaire fourni par Google.
