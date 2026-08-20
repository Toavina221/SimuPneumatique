# Fixes audit restants

1. **B5 piloté right via Y1** : updateSensors désactive `cap.sim.active` car targetId inexistant → signal jamais émis. → utiliser un targetId valide pointant sur c et position "extended" avec pos forcée à 1 avant l'activation (comme B9), OU désactiver la surcharge sensors. Retenir : créer un capteur valide avec targetId=c, position "extended", et forcer c.sim.pos=1 puis capter le signal.
2. **B8bis** : d3 utilise reg2 avec restriction 60 (défaut) → identique à c. Fix : set reg2 restriction à 100 avant les ticks, et comparer c2.pos >= c.pos à même durée.
3. **Defs 10 types** : échec mystérieux — vérifier que le fichier exécuté est bien /home/ubuntu/pneumasim/audit-engine.ts (peut-être tsx charge une copie en cache via tsconfig paths ou un fichier homonyme). Vérifier avec un log console.log au début du bloc defs.
