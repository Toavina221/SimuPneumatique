# PneumaSim — Brainstorm de design

Le prototype fourni par l'utilisateur est un éditeur/simulateur de circuits pneumatiques (palette de composants, SVG, simulation temps réel, cartouche ISO, export). La consigne du prototype impose déjà une esthétique sombre « atelier industriel / CAO ». Je dois choisir un langage visuel qui respecte cette identité tout en l'élevant en version « plateforme SaaS moderne » (page d'accueil + éditeur).

## Trois approches stylistiques

1. **« Plan d'atelier » (Blueprint Craft)** — Esthétique de plan technique ISO : fond ardoise profond, grille visible, cartouche, monospace, accents orange pression / ambre signal. Émotion : précision d'ingénieur, fiabilité industrielle. *Probabilité : 0.06*
2. **« Néon Cyber-Pneumatique »** — Fond noir, néons cyan/magenta, effets de glow intenses, ambiance sci-fi. Émotion : futuriste, laboratoire. *Probabilité : 0.03*
3. **« Papeterie lumineuse » (Light Drafting Table)** — Fond clair crème/papier millimétré, encre bleu architecte, tampons rouges, esthétique dessin technique vintage. Émotion : élégance d'école d'ingénieurs. *Probabilité : 0.02*

## Approche retenue : « Plan d'atelier » (Blueprint Craft)

- **Design Movement** : Industrial Technical Drawing / normes ISO 1219 (schémas pneumatiques) croisé avec un SaaS de CAO moderne (type Autodesk/Onshape).
- **Core Principles** :
  1. Fidélité aux conventions de schéma pneumatique : air sous pression = orange, repos = gris acier, signal = ambre pointillé.
  2. Précision millimétrée : grille, accrochage, cartouche de plan ISO, repères alphanumériques.
  3. Densité contrôlée : interface compacte de type CAO (barre d'outils, palette arborescente) mais hiérarchie claire.
  4. Feedback immédiat : chaque état (sélection, pression, signal) a une réponse visuelle en <150 ms.
- **Color Philosophy** : Ardoise profonde (#0d1219–#141c27) pour évoquer la table à dessin lumineuse ; l'orange `--pressurized: #ff6a3d` est la couleur signature de la marque (l'énergie de l'air comprimé) ; l'ambre `--signal-on: #ffd23f` pour les signaux de pilotage ; bleu acier `--accent: #4aa8ff` pour l'interface.
- **Layout Paradigm** : Écran complet en grille CAO asymétrique — toolbar top compacte, palette arborescente à gauche (220 px), feuille de plan centrée avec pan/zoom, cartouche en bas de feuille, modales de propriétés. Page d'accueil séparée (marketing) avec hero asymétrique et sections de démonstration.
- **Signature Elements** :
  1. Le « point de puissance » : pastille orange pulsante dans le brand (état simulation).
  2. La grille de plan visible + cartouche ISO éditables en bas à droite de la feuille.
  3. Les conduites à segments orthogonaux qui s'illuminent en orange quand l'air circule.
- **Interaction Philosophy** : Tout est direct-manipulation — drag depuis palette, clic-port pour tracer, molette pour zoom, glisser pour déplacer. Raccourcis clavier (Del, R, Esc). Aucune interaction cachée.
- **Animation** : Transitions de couleur de conduites ≤150 ms ; piston qui se déplace linéairement ; hover des boutons avec border-color accent ; pastille de simulation pulse quand la simulation tourne ; modales 200 ms ease-out. Pas d'animations décoratives superflues.
- **Typography System** : Display/labels en **Space Grotesk** (technique, géométrique), données monospacées en **JetBrains Mono** (repères, cotes, statuts), texte courant system-ui. Hiérarchie : brand 14px mono bold, labels 11px uppercase letterspaced, corps 12.5–13px.
- **Brand Essence** : PneumaSim — l'atelier virtuel de pneumatique pour étudiants, techniciens et ingénieurs ; rapide, rigoureux, sans installation. Adjectifs : rigoureux, réactif, pédagogique.
- **Brand Voice** : Directe et technique, zéro jargon marketing. Ex. : « Montez votre circuit. Mettez l'air. Observez. » / « Simulez 5/2 bistable en 30 secondes chrono. »
- **Wordmark & Logo** : Logotype « PNEUMASIM » en monospace bold lettres espacées, précédé d'un symbole : pastille/pistolet d'air comprimé — cercle avec spire et point de pression. Favicon : pastille orange sur fond ardoise.
- **Signature Brand Color** : Orange pression `#ff6a3d`.

## Style Decisions
- La page d'accueil suit la même palette ardoise pour une continuité marque → éditeur.
- Le rendu SVG interne de l'éditeur conserve les variables CSS exactes du prototype (fidélité du moteur de simulation).
- **Couleur** : `#ff6a3d` (orange pression) est LA couleur de marque : actions principales, pression active, point de puissance, chiffres clés. `#4aa8ff` (bleu acier) reste réservé au chrome d'interface, aux ports et aux états secondaires.
- **Iconographie** : toutes les icônes visibles doivent être des pictogrammes linéaires de style CAO (lucide-react), jamais d'emoji ou pictos grand public.
- **Landing** : chaque section marketing intègre au moins un artefact de dessin technique — grille, cartouche, repère alphanumérique, cote, conduite orthogonale ou légende d'état.
- **Surfaces CAO** : filets fins (1px), coins plus utilitaires (radius plus petits), étiquettes mono — l'ensemble doit sentir la feuille technique, pas le SaaS sombre générique.
- **Logo/wordmark :** PNEUMASIM apparaît comme un logotype mono bold à lettres espacées, accompagné d'une pastille orange pression (cercle plein) clairement lisible comme « point de puissance », jamais comme un simple libellé texte.
- **Landing :** chaque section marketing est composée comme une planche technique ISO, avec au moins deux signaux visibles parmi : cartouche, repère alphanumérique (ex. B-02), cote, légende d'état, conduite orthogonale ou grille de plan.
- **Typographie :** hiérarchie issue du vocabulaire d'ingénierie — repères, codes, états, mesures — plutôt que de simples cartes avec icônes.
- **Chrome éditeur :** densité CAO compacte à filets fins ; l'orange #ff6a3d reste strictement réservé à la simulation active, aux actions primaires et à la pression ; le bleu acier reste réservé aux états secondaires.
- **Imagerie :** le visuel premium est traité comme une planche annotée (cotes, repères, légende technique, statuts pression/signal), pas comme une image décorative.
