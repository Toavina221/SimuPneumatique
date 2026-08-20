// PneumaSim — Plan d'atelier (Blueprint Craft)
// Store léger partagé entre les composants de l'éditeur (composants React
// déconnectés du DOM), en lecture seule : recherche d'un composant par id.
// Alimenté par la feuille SVG à chaque rendu complet.

import type { Component } from "@/lib/pneusim/types";

const byId = new Map<string, Component>();

export function syncComponentMap(components: Component[]): void {
  byId.clear();
  components.forEach((c) => byId.set(c.id, c));
}

export function getComp(id: string): Component | undefined {
  return byId.get(id);
}
