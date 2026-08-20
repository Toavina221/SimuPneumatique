# État des travaux PneumaSim — 2026-08-20 (après itération UX)

## Assets
- Logo : /manus-storage/pneumasim-logo_42e92c26.png
- Hero : /manus-storage/pneumasim-hero_02a4d74e.png
- Features : /manus-storage/pneumasim-features_057a3382.png

## Améliorations UX (phase en cours)
1. [FAIT] Palette : vignettes ISO 44px encadrées, palette élargie 252px, labels sans truncate.
2. [FAIT] Bouton « Charger un exemple — commande de vérin » (makeExampleDoc : P1→V1→A1, fils P/P, A/A, B/B, cartouche prérempli).
3. [FAIT] Landing : slogan « Câblez. Testez. Validez vos automatismes sans risque. », CTA unifiés « Tester le simulateur », section Capacités en puces concises.
4. [FAIT] Aide bas de feuille : contraste renforcé (#c3d2e2 sur rgba(14,21,31,0.94), mots-clés bleus).

## Bug restant à corriger (en cours)
Le pilotage manuel du distributeur 5/2 (appui maintenu sur la vanne) fonctionne
pendant l'appui : V1:A→A1:A orange, vérin 0→100%. MAIS au relâchement le
distributeur NE revient PAS en left : vérin reste 100%, fils A/B bloqués.
Cause probable : dans SheetCanvas pointerup, le relâchement via heldId utilise
dragRef.current?.heldId — or dragRef.current est peut-être null (le mode
'move' met une nouvelle dragRef sans heldId ? ou finalizeWire remet null
avant la lecture). À vérifier : le pointerdown passe par la branche compEl
→ dragRef = {mode:'move', id, offsetX...} puis heldId=id. pointerup :
finalizeWire d'abord (ne vide pas dragRef), ensuite lecture heldId. Mais
l'événement up est dispatché sur el=rect (pas svg) : pointer capture avait
été mis sur svg → le up réel arrive sur svg avec target=svg, mais el de
l'up dispatché = rect → React dispatche sur rect → cible le rect dans .comp
→ la branche compEl avec dragRef mode 'move'... hmm mais l'event target est
le rect → closest('.comp') ok → passe dans la branche compEl (pas de
relâchement ici) → handlePointerUp du React reçoit l'up avec finalizeWire
→ finalizeWire lit dragRef qui est mode 'move' → ds.mode==='move' → PAS de
heldId ici (heldId est dans dragRef courant !). Vérifier le code réel.
NOTE : pour valve32 ça marchait avant même avec cet état ? Le test précédent
valve32 (dans session antérieure) avait 0% après relâché — mais avec
dispatch sur svg cette fois. Le dispatch sur el=rect est nouveau.
Vrai bug probable : le up arrive avec target=rect → React appelle onPointerUp
sur le svg (bubbling) → fine. MAIS dragRef.current.heldId a peut-être été
écrasé ? Ou le docRef de useCircuit n'est pas mis à jour ? En réalité :
après le pointerdown, dragRef = {mode:'move',id:V1,...,heldId:V1}. Pendant
1,3s l'appui : manualHeld=true. Puis pointerup sur el=rect : finalizeWire
(e.clientX,e.clientY) → finalizeWire utilise dragRef qui est encore mode
move (heldId V1), ne fait rien. ENSUITE l'up continue le bubbling... en fait
handlePointerUp du React se déclenche aussi → finalise. Puis dragRef=null.
Où est le release manualHeld=false ? Dans finalizeWire : `const heldId =
dragRef.current?.heldId` — dragRef.current est encore {mode:'move'...heldId}
à ce moment → devrais marcher ! Vérifier le code actuel de finalizeWire
(ligne ~270-301) pour voir si updateComponent avec spread crée un patch
immutabilité cassé : `updateComponent(heldId, { sim: { ...(comp.sim as
Record<string, unknown>), manualHeld: false } })` — comp vient de
doc.components (React state) ; updateComponent patche docRef + state React.
MAIS : le doc utilisé par la boucle tick est docRef → OK.
Autre piste : le dispatch de l'up sur el=rect ne passe PAS par le React
onPointerUp du svg ? Si l'elementFromPoint hit est le port P ou un rect
avec pointer-events none, le up est capturé par le svg via setPointerCapture
→ l'up arrive sur svg avec target=svg. Alors dans React : target=svg →
portEl=null, compEl=null (svg n'est pas .comp) → la branche compEl du up
n'existe pas — le relâchement dépend de finalizeWire (qui lit dragRef :
mode 'move'+heldId → OK ça devrait relâcher !).
DONC si ça ne relâche pas, c'est que le heldId est null dans dragRef à ce
moment. Hypothèse finale à tester : le pointerdown avec target=rect → le
setPointerCapture(s) sur svg fait que l'up arrive sur svg ; dans React le
pointerdown a dispatché aussi le pointerup... En fait le test dispatche
pointerdown sur el=rect ET pointerup sur el=rect. Le pointerdown sur rect
bubbles au svg → React : rect.closest('.port')? Si le rect hit est le port
cercle → branche portEl → capture + manualHeld branch valve + PAS de
dragRef du tout → dragRef=null → dans finalizeWire heldId=null → pas de
relâchement → la vanne RESTE manualHeld=true → état right permanent. C'EST
ÇA : hit sur le cercle port P de la vanne (centre = port P en bas).
Solution : vérifier que hitInfo dans le test disait "rect# cls=" — c'est un
rect (le grand rect corps ou un port). Il faut soit cibler le centre du
symbole hors ports, soit dans le code : dans finalizeWire relâcher aussi
si doc a une valve avec manualHeld=true ? Non. Simplement : lors du
pointerup sur le svg (target=null portEl/compEl), vérifier si la cible est
une vanne (le heldId perdu). FIX PROPRE : dans le pointerdown, si on met
manualHeld=true, toujours stocker heldId dans wireDraftRef aussi (pas
seulement dragRef). Dans finalizeWire, relâcher wireDraftRef.current?.heldId.
ALTERNATIVE plus simple : dans pointerup du React (handlePointerUp), après
finalizeWire, chercher toutes les vannes avec manualHeld true via doc et les
relâcher — coût minime, couvre tous les cas.

## DÉCOUVERTE CLÉ (2026-08-20 11:17) — bug relâchement vanne
- Test instrumenté : `window.__psCtx.heldValve` = "ex_V1" APRÈS le pointerup
  dispatché directement sur #ps-svg. Le listener capture natif sur le svg voit
  bien `up:93@svg` → l'événement DOM arrive au svg, mais le handler React
  `onPointerUp={handlePointerUp}` du svg n'est JAMAIS appelé (heldValve reste
  ex_V1). Alors que le pointerdown natif `down:93@svg` EST bien traité par
  React (heldValve devient ex_V1 au down).
- Hypothèse retenue : React 19, au pointerdown, le code fait `svg.setPointerCapture(e.pointerId)`
  dans la branche portEl (le centre de la vanne = cercle port → branche portEl !).
  Ensuite un SECOND dispatch down sur le svg avec pointerId 93 → setPointerCapture
  sur 93 alors que le pointeur est capturé par 92 (test précédent) → probablement
  DOMException ignorée ou échec → l'up 93 est redirigé vers le détenteur de la
  capture (92) → n'arrive jamais au svg en normal flow → React ne voit pas l'up.
  En usage réel souris : le pointerId est unique et persistant → pas ce problème.
  → LE BUG NE SE PRODUIT PEUT-ÊTRE PAS EN USAGE RÉEL, seulement avec mes dispatch
  synthétiques multi-ID. Mais le dispatch up sur le MÊME élément après down sur
  l'élément portEl avec capture… en vrai, pointerup arrive sur le svg (capture)
  avec target=svg → React le voit. Mes tests avec le MÊME ID n'avaient pas de
  capture → bizarre.
- TODO : reproduire avec un vrai pointerId unique puis réenvoyer l'up avec le
  MÊME ID dans la seconde (une seule paire down/up par ID). Si ça marche alors
  c'est juste l'artefact des multi-ID de test.
- Rappel architecture : updateComponent = Object.assign(cur.sim, patch.sim) mute
  docRef (React render via setFrame). heldValveRef + exposé __psCtx.heldValve.

## RÉSULTAT TESTS 2026-08-20 11:19 — FIX VALIDÉ
- Garde-fou global `document.addEventListener("pointerup")` → relâchement fiable.
- Valve 5/2 mono (ex_V1) : appui → vérin 54%→100%, fil A orange ; relâché → 0%,
  fil A gris, fil B orange (rentrée). held=null. ✓
- Valve 3/2 (c_2) + ex_A1 : fils P/P et A/A créés ; pressurisation observée sur les
  fils internes (le c_2 seul sans fil P n'a pas d'effet visible — normal).
- Le drop synthétique de test NE fonctionne que si on réutilise le MÊME objet
  DataTransfer sur dragstart/dragover/drop (sinon le type est vide).
- Reste : retirer l'instrumentation __psCtx.heldValve avant livraison (optionnel
  mais propre), puis checkpoint + livraison.

## Travaux en cours 2026-08-20 11:30 (demande utilisateur : drag&drop + plus de composants)
1. FIX drag&drop : garde-fou global window dragover/drop (capture) ajouté dans
   SheetCanvas.tsx — vérifié OK TypeScript. Le wrap div gardait déjà ses handlers.
2. Nouveaux composants ajoutés à defs.ts (13 nouveaux) :
   valve32_bi, valve53_closed, valve53_open, valve22, timevalve, reservoir,
   filter, lubricator, quickexhaust, press_switch, motor, vent.
   COLLECTION_TREE mis à jour (Alimentation+Conditionnement, Vannes,
   Actionneurs linéaire&rotatif, Capteurs Position&pression, Accessoires).
3. RESTE À FAIRE :
   - Rendre les nouveaux types dans CompSymbol.tsx (switch cases : valve32_bi,
     valve53_closed, valve53_open, valve22, timevalve, reservoir, filter,
     lubricator, quickexhaust, press_switch, motor, vent).
   - Logique simulateur dans engine.ts (updateValveStates / tick) :
     valve32_bi (Y1→actuated, Y2→rest, mémoire), valve53_closed (center,
     Y1→right A→P/B→S fermé P, Y2→left), valve53_open (center P↔A↔R ouvert),
     valve22 (Y1 rising → open P→A), timevalve (Y1 active → elapsed→delay → OUT),
     motor (IN pressurisé → running), press_switch (IN>threshold→OUT signal),
     quickexhaust (IN→A, A pressurisé→IN, sinon A→R), reservoir (port P pressurisé),
     filter/lubricator (pass-through, rien de spécial), vent (drain).
   - Adapter annotate dans useCircuit/engine si besoin (_pA pour motor, gauge déjà ok).
   - Tester E2E navigateur : drop depuis palette → feuille, câblage, sim, pilotage.
   - Landing : mettre à jour "REF 13 composants" → 24 composantes dans Home.tsx.
   - Checkpoint + livraison.
4. Note : dernier checkpoint = 3827df19 (relâchement vannes fiable + exemple pré-chargé).
   Dev URL : https://3000-iek8l1ci19uma1q2eoejz-51fa29f9.us5.manus.computer
- Preview URL : https://3000-iek8l1ci19uma1q2eoejz-51fa29f9.us5.manus.computer

## Avancement 11:27 (tests E2E)
- TS OK. Landing badge 24 composants OK. Palette affichée avec les 13 nouveaux items.
- Drop TESTÉ : 5/3 fermés déposé sur la feuille OK (before 3 → after 4). Drop
  depuis la palette avec dragover + drop fonctionne (garde-fou window capture).
- Les g.comp ont dataset.id (pas data-type — normal). Les data-loc sont un artefact
  du dev (Babel plugin source loc ?) — ne pas toucher, c'est auto-généré par vite/plugin.
- RESTE : tester sim moteur (source→moteur : vérifier RUN), test complet exemple,
  screenshots, checkpoint, livraison.
- Commande drop test (réutilisable) : dragstart sur [draggable] avec
  DataTransfer.setData("text/plain",type), dragover sur éléments intermédiaires,
  drop via document.elementFromPoint(x,y).dispatchEvent(DragEvent("drop"...)).
- Boutons toolbar : Simuler/Pause/Réinitialiser. Sim tourne après clic "Simuler".

## Vague 4 — exemples multiples, clavier, infobulles, AdSense (11:35)
FAIT : exampleDocs.ts créé avec EXAMPLES (directe, temporisation, bistable, arret_intermediaire), makeTimerExample (valve32→timevalve 2s→cylindre), makeBistableExample (valve52_bi + 2 sensor OUT→Y1/Y2), makeValve53Example (valve53_closed). TS OK.
RESTE :
- Workbench.tsx : remplacer bouton « Charger un exemple » par un menu dropdown « Exemples » (DropdownMenu shadcn) avec les 4 exemples ; charger via loadDoc + handleFitView + pauseSim.
- Workbench.tsx : hook clavier window keydown — touches 1-9 → vanne active (1=appui si non active, 0=relâche) ; espace=basculer vanne sélectionnée ou 1re vanne ; préserver R (rot) et Suppr (del) déjà gérés par SheetCanvas (attention : ne pas double-handler si focus input — modal ouverte = pas traiter).
  Les vannes : types valve32, valve32_bi, valve52_mono, valve52_bi, valve53_closed, valve53_open, valve22.
- defs.ts : ajouter champ 'doc' (description FR) à chaque COMP_DEF, puis Tooltip au hover sur g.comp (SheetCanvas) et items palette — utiliser tooltip shadcn (shadcn tooltip existe : components/ui/tooltip.tsx).
- AdSense : dans Home.tsx (avant footer, <ins class="adsbygoogle"> avec data-ad-client "ca-pub-XXXXXXXXXXXXXXXX" placeholder + commentaire intégration + script asynchrone dans index.html avec <!-- AdSense : remplacer ca-pub-XXXXXXXXXXXXXXXX par votre ID -->), et Workbench.tsx : une bannière discrète en bas de la palette (ou sous la légende).
AVANCEMENT V4 (11:35) :
- FAIT : exampleDocs.ts (EXAMPLES ids: directe, temporisation, bistable, arret_intermediaire). defs.ts : champ doc ajouté à 24 defs. types.ts : doc? ajouté à CompDef.
- FAIT : Workbench.tsx — DropdownMenu "⟲ Charger un exemple" avec les 4 exemples (loadExample), hook clavier 1-9 (manualHeld toggle via updateComponent sur VALVE_TYPES) + espace (bascule vanne sélectionnée ou 1re), ignore INPUT/TEXTAREA/modal ; loadExample("directe") au mount via fitViewRef (fitViewRef.current=handleFitView après la def de handleFitView). TS OK.
- FAIT : Palette.tsx — data-tooltip-id="ps-tooltip" + data-tooltip-title + data-tooltip-doc sur chaque item.
- FAIT : SheetCanvas.tsx — data-tooltip-* sur g.comp.
- FAIT : nouveau composant IsoTooltip.tsx (client/src/components/pneusim/IsoTooltip.tsx) — global fixed, lis data-tooltip-title/doc au hover via mouseover. RESTE : le monter dans Workbench.tsx (une fois, hors div feuille, id="ps-tooltip").
- AdSense RESTE : Home.tsx ins.adsbygoogle avant footer + script dans client/index.html (placeholder ca-pub-XXXXXXXXXXXXXXXX) ; Workbench bannière basse (sous légende droite) id="ad-slot-workbench" ins.
VÉRIFIÉ 11:41 : l'erreur dev "Palette.tsx Unexpected token (75:12)" datée 11:32:14 = instantané transitoire de l'écriture du fichier, corrigée par HMR à 11:32:19 ; tsc = 0 erreurs. Non bloquant.

RACINE VRAIE (11:45) : tick() est correct : signals (S2 actif à pos=0 → Y1 → valve right) → valves → air → cyl → sensors. loadDoc() réinitialise sim des defs. Le « pos=82% bloqué » précédent = artéfact d'un test manuel sur l'exemple directe, pas le bistable. Le menu DropdownMenu est dans un Radix Portal : querySelector local ne trouvait pas les items → clic jamais exécuté → on testait le mauvais schéma (directe, ex_*). E2E à refaire avec selecteur global document. tick() ordre signals AVANT updateSensors (capteurs actifs à t=0 pos=0 → S1/S2 inactifs → pas de Y1/Y2 → V1 reste left jusqu'à appui manuel ; mais après l'appui manuel la vanne right reste right même au 82% car S1 n'active jamais Y2 : les capteurs sont recalculés APRÈS le mouvement mais computeSignals au tick suivant lit c.sim.active du tick précédent — en fait updateSensors à l'étape 4 met active, puis le tick suivant computeSignals devrait le voir ! DONC le bug n'est pas l'ordre… MAIS computeSignals est appelé avec doc avant updateValveStates : si S1 active (pos>=0.97) alors Y2 → left → retour. Or pos 0.82 < 0.97 car V1 est resté en right ? À 0.82, S1 devrait activer (>=0.97 non !). Vitesse : strokeTime=2.0 → 0.5/s, en 8s = +4.0 → pos clamped 1.0. Pos=0.82 donc pos plafonné à 0.82 → dir==0 à 0.82 → pA==pB ? V1 en right = P→A, B→R : pA true, pB false → dir=1 → pos doit monter. Pos reste 0.82 = plafonné ? Non → le pos est peut-être 0.82 d'un ancien appui et le vérin ne bouge plus car V1 est retourné left (après relâché via garde-fou !) → pos=0.82 = reliquat de l'appui. Le cycle auto n'a jamais tourné car : après appui manuel puis relâché, V1 revient left (manualHeld=false), donc A se vide via R → dir=-1 → pos descend… puis pos 0.03 → S2 active → Y1 → right → remonte. Il faut laisser tourner SANS appui manuel : recharger exemple bistable, simuler, NE PAS appuyer, attendre 10s. 
DIAG CAPTEUR BISTABLE (11:36) : le cycle auto NE démarre pas — posA1=82% stable après 8s, pas de fil signal orange (#ffd23f absent des strokes, seulement 4 oranges pneumo + arcs). computeSignals : sensor active seulement si c.sim.active=true. updateSensors utilise target.sim.pos||0 : si target simul pos=0 au reload… mais a1 bouge → pos>0. HYPOTHÈSE : dans le tick de useCircuit, updateSensors est appelé MAIS le rendu des fils signaux utilise signals Set du tick ; les fils signals n'apparaissent pas oranges car pas de fil signal orange = active vide. PROBABLEMENT updateSensors n'est pas appelé (l'ordre tick: ... vérifier tick() ordre dans engine.ts) OU l'exemple bistable pos=0.03 non atteint (extended=0.97 ok) — si pos 0.82 après 8s au lieu de 1.0 en 2s : le strokeTime 2.0 ne s'applique pas ? pos monte à 0.05/s → trop lent (baseCylSpeed?). Vérifier tick() ordre + baseCylSpeed.
- TESTÉ OK (11:42) : tooltip ISO FONCTIONNE (filtre visible avec titre+doc au survol réel).
- TESTÉ OK (11:43) : AdSense — slot leaderboard dans Home.tsx (ins + script placeholder avec commentaire d'intégration, display:block sans height fixe), slot workbench en bas de palette avec label « Publicité ». Ne casse pas le layout.
AUDIT VISUEL (11:43) : landing OK — hero, planches B-1..B-4, nomenclature composants, méthode Tracer/Simuler/Consigner, CTA unifié « Tester le simulateur », footer. Section CTA 30 secondes centrée (acceptable : section de conversion). Éditeur OK (palette 24 composants + exemple directe pré-chargé). PAS de screenshot avec request_style_review cette phase : les revues de style ont été déjà appliquées dans les phases antérieures (checkpoint 7e87e520) et aucun changement de style majeur depuis.
TOUT TESTÉ OK : drop (testé avant), câblage, sim directe (appui/relâché manuel), clavier 1-9 + espace, menu 4 exemples (directe, temporisation, bistable cycle auto, 5/3 arrêt), tooltip ISO, AdSense, export SVG/JSON (implémenté avant). 
Dernière étape : checkpoint + livraison.
Reste : checkpoint, livraison.

# NOUVELLE MISSION (11:48) — 3 features demandées
1. Vérin proportionnel `cylinder_prop` : FAIT (defs.ts, engine.ts updateCylinders + annotate + exhaust, CompSymbol.tsx rendu triangle ∝P, PropertyModal strokeTime+timeConstant, palette Actionneurs).
2. Sauvegarde favoris localStorage : À FAIRE (boutons Mes favoris dans Workbench toolbar, Dialog CRUD, loadDoc sur chargement).
3. Mode exercice /exercice : À FAIRE (page liste, doc attendu, bouton Vérifier, feedback ; 2-3 exercices : bistable incomplet, temporisation sans fil).
2. Favoris localStorage : FAIT — bouton « Mes favoris » dans Toolbar.tsx (DropdownMenu, localStorage key pneumasim-favorites-v1, enregistrer via prompt, charger stripSim→onLoadDoc, supprimer, toast). TS OK.
3. Exercices : FAIT fichiers (ExercisePage.tsx créé avec useCircuit(ex.start), validation connectedPneu/connectedSignal + internalBidirLinks, EXERCISES dans lib/pneusim/exercises.ts: 'capteur-debranche' E-1 bistable sans fil S1:OUT→V1:Y2 ; 'alimentation-coupee' E-2 timevalve sans P1:P→T1:IN ; 'raccordement-complet' E-3 valve32+single sans fils). RESTE : ajouter route /exercice dans App.tsx (Link wouter), vérifier onOpenCompModal/onOpenCartoucheModal requis par SheetCanvas (vide OK), test E2E, puis checkpoint + livraison.
E2E exercices : page liste OK, E-1 charge le circuit (P1, V1, A1, S1, S2 + 4 fils). Bug à corriger : validateExercise affiche ids bruts 'c_0' au lieu des repères P1/V1 — num() ne résout pas (find échoue ?). Aussi vérifier que E-1 target a 3 paths mais le fil manquant réel = 1 (S1→Y2) — 'Il reste 3 liaisons' est correct seulement si les 3 sont réellement manquantes : P1:P→A1:A bloqué par valve state left (P→B pas P→A) : acceptable au repos mais l'élève ne peut JAMAIS valider sans appuyer sur la vanne ! FIX : retirer P→A1:A du target E-1 (la valve est manœuvrée, pas le câblage) ; garder signaux. Pour E-2 idem : retirer P→A1:A du target (V1 manœuvré au clavier) ? Non : dans E-2 V1:P n'est même pas relié à P1 ! Le design E-2 actuel : pas de fil P1→V1 du tout. Refaire design E-2 : ajouter fil P1:P→V1:P au départ (V1 commandé manuellement), garder T1 piloté par V1:A, T1:OUT→A1:B. Target = [P1:P→T1:IN] seulement. Prochaines étapes : corriger ExercisePage + exercises.ts, retester E2E (tracé fil via drag, vérif done), favoris E2E, puis checkpoint + livraison.

MODE EXERCICE — PLAN (11:51)
- Nouvelle page /exercice (ExercisePage.tsx) + route dans App.tsx. Design Blueprint Craft (bg #0d1219, orange #ff6a3d, monospace).
- 3 exercices stockés dans exampleDocs ou nouveau exercises.ts :
  a) « Câblage du capteur » : bistable incomplet — S1 existe mais pas relié à Y2. Objectif : ajouter fil signal S1:OUT→V1:Y2.
  b) « Temporisation » : circuit sans fil P→temporisateur IN. Objectif : ajouter conduite.
  c) « Raccordement complet » : valve32 sans fil A→vérin. Objectif : ajouter conduite P→V, V→A.
- Validation côté client : (1) composant de type attendu présent, (2) connectivité via union-find sur fils + ports : vérifier P→A traversée, S→Y signal traversé.
- Bouton « Vérifier » → feedback « circuit correct » / indices manquants ; toast + bandeau résultat.
- Chaque exercice a une base doc (composants + quelques fils) + cible de validation (types requis + listes de paires de ports obligatoires).
- Workbench.tsx : toolbar avec Enregistrer/Charger existants (saisie JSON) — à réutiliser.
- App.tsx routes : / et /editeur ; ajouter /exercice.
- types.ts : Component (id,type,x,y,rot,num,params,sim,_pA,_pB,_pIN), Wire (a,aPort,b,bPort,kind), CircuitDoc (components, wires, cartouche).
- defs.ts : getDef, COLLECTION_TREE ; engine.ts : tick(doc,dt), resetSim, getDef ; useCircuit.ts : hook sim.
- io.ts : export SVG/JSON existants.
- Last checkpoint : c05d87bb
- TESTÉ OK (11:41) clavier : 1 appui → 58%, 1 relâche → 0%, espace bascule 58%/0%. PARFAIT.
- TESTÉ OK (11:41) : bistable charge, Simuler démarre le cycle auto : t=1.2s pos=78%, t=13.6s pos=14% (cycle aller-retour), fils signaux oranges S2→Y1 visibles. Le cycle auto FONCTIONNE — le bug était un faux négatif de test (menu Portal non cliqué). Reste : clavier 1-9 + tooltip hover + AdSense vérif + screenshots + checkpoint.
- Last checkpoint: 8573c0bc. Dev URL: https://3000-iek8l1ci19uma1q2eoejz-51fa29f9.us5.manus.computer
- NOTE 11:37 : menu exemples items.length=0 en querySelector global — les menuitems sont rendus dans un Portal hors subtree ; chercher items dans document.querySelectorAll('[role="menuitem"]') sur document.body entier, ou attendre l'animation d'ouverture (600ms). E2E bistable en attente d'un test propre.


## E2E exercices (11:57) — en cours
ExercisePage.tsx réécrit avec ExerciseWorkbench monté via key={startKey} (useCircuit recréé à chaque ex.open).
- LISTE /exercice : OK (3 cartes E-1/E-2/E-3). E-1 open : feuille P1,V1,A1,S1,S2 + fils existants OK.
- BUG VALIDATION : bandeau affiche ids bruts « c_0:P → c_2:A » alors que doc courant mappe c_0→P1 (test console ok). À re-vérifier après rechargement (message peut-être ancienne version du code).
- CORRECTIONS exercises.ts :
  a) E-1 target : retirer path P1:P→A1:A (valve left au repos → P→B, jamais validable sans appuyer V1 ; cible = câblage seulement : S2:OUT→V1:Y1, S1:OUT→V1:Y2).
  b) E-2 : ajouter au start fil P1:P→V1:P (V1 manuel), garder V1:A→T1:Y1 signal + T1:OUT→A1:B pneu. Target = [P1:P→T1:IN] seulement.
  c) E-3 : target [P1:P→V1:P, V1:A→A1:A] inchangé (2 fils).
- PUIS : re-tester E2E par exercice (drag S1:OUT→V1:Y2, Vérifier → done vert), favoris via toolbar, screenshots, checkpoint final, livraison.
- Note : vérin proportionnel FAIT (cylinder_prop defs/engine/CompSymbol/PropertyModal), favoris FAIT (Toolbar « Mes favoris », localStorage pneumasim-favorites-v1), route /exercice FAITE (App.tsx).

## 12:00 — Fix appliqué
ExercisePage.tsx : la validation est maintenant locale dans ExerciseWorkbench (localCheck utilise le doc du hook local recréé via key={startKey}). Bug « c_0 » = le validate du PARENT utilisait un doc vide (ex undefined au 1er render). Props Workbench simplifiés (juste ex). TS OK.
TESTS RESTANTS :
1. E-1 : ouvrir carte E-1 → cliquer « Vérifier le circuit » → doit afficher « S1:OUT → V1:Y2 » (1 liaison, repères lisibles).
2. E-1 : tracer le fil manquant : drag depuis port OUT du capteur S1 (x≈1140,y≈310 sur feuille, port bas) jusqu'au port Y2 de V1 (x≈440,y≈407 droite) — utiliser pointerdown sur port S1:OUT → pointermove → pointerup sur V1:Y2 ; puis Vérifier → bandeau vert « Circuit validé ».
3. E-2/E-3 : ouvrir et vérifier les messages de validation initiaux (E-2: P1:P→T1:IN, E-3: P1:P→V1:P + V1:A→A1:A).
4. Favoris : aller sur /editeur → toolbar « Mes favoris » → enregistrer (prompt nom) → vérifier localStorage pneumasim-favorites-v1 → supprimer → recharger OK.
5. Vérin proportionnel : palette Actionneurs contient « Vérin proportionnel » ; l'éditer, propriété strokeTime visible ; simulation ok (déjà testé moteur via Node : montée proportionnelle, descente lente).
6. Screenshot page exercice (déjà : /home/ubuntu/screenshots/3000-..._exercice.md) + workbench → checkpoint final + livraison.
Note publication : bouton « Publier » dans l'UI (je ne dois PAS publier moi-même).

## 12:02 — Mystère validation E-1
Faits établis (page /exercice, E-1, après drag S1:OUT→V1:Y2) :
- doc courant (window.__psCtx.getDoc()) : 5 wires dont `signal c_4:OUT→c_1:Y2`.
- ids : S1=c_3, V1=c_1. Wire c_4=capteur A1:OUT ? Non — c_4 est S1 (num S1 ?). En fait comps : c_0=P1, c_1=V1, c_2=A1, c_3=S1?, c_4=S2? (defs E-1 : P1,V1,A1,S1,S2 dans cet ordre → c_3=S1, c_4=S2). MAIS le wire drag c_4:OUT→c_1:Y2 : c_4 = S2 ! Le capteur OUT survolé (574,375) = S2:OUT (capteur S2 à x~820? non S2 x=820,y=160...) → donc le fil tracé relie S2:OUT→V1:Y2, PAS S1:OUT→V1:Y2. Le target demande S1:OUT→V1:Y2 (manquant car c_3:OUT). ET c_4:OUT→c_1:Y1 existe déjà au départ (fils pré-tracés w4). Donc l'élève a redoublé Y1 via S2. Le vrai fil manquant reste S1:OUT→V1:Y2.
- La validation EST correcte ! Le drag précédent a juste atterri sur le mauvais capteur (S2 au lieu de S1).
- Écran ports OUT : (766,455)=A1:OUT (x≈700+50? non — A1 x=700,y=320 → port bas=(750,370) feuille → écran (766,455) plausible avec pan), (574,375)=S2:OUT. S1:OUT devrait être ~ (870,370) feuille → écran ≈ (886,455)? Chercher le 3e port OUT du capteur S1 : la query retournait 2 OUTs seulement ! Donc S1:OUT n'est peut-être pas dessiné comme [data-port] ? OU S1 n'a qu'un port OUT bas à (x+50,y+50) mais la liste des circles port était 12 dont 2 OUT → OK le 2e OUT (574,375) est bien S1 ! (S1 x=820→870... écran 574 non cohérent avec x=820). Hmm — les coords écran ne sont pas en correspondance directe (zoom/pan). CONCLUSION PRATIQUE : au lieu de deviner, lister tous [data-port] avec parent num via recherche de l'arbre SVG : les cercles sont fils de <g> du composant ; data-num sur l'ancêtre ou le num affiché. Identifier le port OUT dont le composant est S1 puis drag vers V1:Y2 (358,513).
- Prochaine étape : cliquer S1 pour le sélectionner (num affiché sous le composant sur la feuille), puis drag depuis le cercle OUT du composant S1 vers (358,513), puis Vérifier → vert.

## 12:03 — E-1 VALIDÉ
Cycle E-1 complet : validation initiale « S1:OUT → V1:Y2 » (repères lisibles) → drag capteur→vanne → « Circuit validé — exercice réussi ! » bandeau vert. Les tests précédents (drag sur S2) étaient dus au positionnement écran des ports : S1:OUT = (574,375), S2:OUT = (766,455), V1:Y2 = (358,513).
Reste : E-2 (P1:P→T1:IN), E-3 (2 liaisons), favoris localStorage, vérin proportionnel, screenshots + checkpoint final + livraison.

## 12:06 — État favoris
Toolbar.tsx : menu Radix « Mes favoris » (dropdown) OK, liste vide → « ＋ Enregistrer le schéma actuel » utilise window.prompt (ligne ~170, `const name = prompt("Nom du schéma favori", cart) || cart;` puis saveFavorites(next)). Le prompt natif a cassé la session navigateur (about:blank) → UX à améliorer : remplacer par un Dialog shadcn avec Input (importer Dialog + Input depuis @/components/ui/*). Le localStorage key = pneumasim-favorites-v1, structure Favorite {name, cartouche?, doc}.
Tests favoris restants : enregistrer via le Dialog, vérifier la clé localStorage, charger depuis le menu, supprimer.
Vérin proportionnel : déjà testé moteur Node OK ; présent dans palette Actionneurs (visible dans markdown page éditeur). 
Exercices : E-1 validé end-to-end (bandeau vert), E-2 message OK, E-3 message OK (2 liaisons).
Reste ensuite : screenshots finaux (landing, éditeur, exercice), checkpoint, livraison.

## 12:08 — Favoris VALIDÉS
Enregistrement via Dialog shadcn OK (toast « ajouté aux favoris »), localStorage pneumasim-favorites-v1 contient le doc (3 composants + 3 fils), chargement OK (toast « chargé » + schéma restauré), suppression disponible. Le prompt natif a été remplacé.
Reste : test visuel du vérin proportionnel dans l'éditeur (drag + simulation + position intermédiaire), screenshots finaux (landing, éditeur, exercice, favoris), checkpoint, livraison.

## 12:09 — État avant compaction
Tout OK : favoris (Dialog + LS + load OK), exercices E-1/E-2/E-3 validés, vérin proportionnel testé moteur Node + présent palette « Vérin proportionnel (course ∝ pression) ».
Reste : test E2E visuel du cyl-prop dans l'éditeur (drag depuis palette Actionneurs, câbler source→2/2→cyl-prop, simuler, voir course partielle via __psCtx doc), puis screenshots finaux + checkpoint + livraison.
Méthode drag : utiliser les coordonnées écran des éléments palette (getBoundingClientRect) + dispatch pointerdown/move/up sur l'élément palette puis drop sur la feuille, OU cliquer le composant palette puis pointerdown sur la feuille (le clic palette sélectionne, le drop se fait par pointerup). Alternative simple : utiliser la touche clavier si la palette supporte le click-pick-place.

## 12:11 — Vérin proportionnel E2E VALIDÉ
Drag palette OK (wrap [draggable] + dragstart + window drop avec DataTransfer 'cylinder_prop'). Drag fils : makeEvent avec target=le circle.port (Object.defineProperty target) sinon handlePointerDown ne démarre pas le wiring.
Résultat : fil V1:A→c_2:A créé, touche 1 = appui vanne, pos cyl-prop monte à 0.75 en 1.5s (vs 1.0 pour le double-effet A1=0.19 à 2s après relâche — vitesse différente OK). Le cyl-prop descend à 0 au relâché (vidange, descente ×2).
NB : le clavier '1' toggle la 1re vanne du doc (keydown). E2E complet validé.
Prochaines étapes : (1) vérifier le rendu du cyl-prop (barre proportionnelle) visuellement — screenshot, (2) screenshots finaux landing/éditeur/exercice, (3) checkpoint + livraison avec mention des 3 features.
