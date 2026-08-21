import { useState, useEffect, createContext, useContext } from 'react';

type Language = 'fr' | 'en';

const translations = {
  fr: {
    nav_library: "Bibliothèque",
    nav_capabilities: "Capacités",
    nav_components: "Composants",
    nav_method: "Méthode",
    nav_exercises: "Exercices",
    nav_simulator: "Simulateur",
    hero_title: "Câblez. Testez. Validez vos automatismes sans risque.",
    hero_subtitle: "Concevez et simulez vos circuits pneumatiques en quelques clics, directement dans le navigateur.",
    btn_open_editor: "Ouvrir l'éditeur",
    btn_view_examples: "Voir les schémas types",
    btn_discover: "Découvrir les capacités",
    footer_text: "PNEUMASIM — Éditeur & simulateur de circuits pneumatiques",
    legal_mentions: "MENTIONS LÉGALES",
    legal_privacy: "CONFIDENTIALITÉ",
    toolbar_save: "Enregistrer",
    toolbar_load: "Charger",
    toolbar_favorites: "Mes favoris",
    toolbar_export: "Exporter",
    toolbar_oscillo: "Oscillo",
    toolbar_diagnostic: "Diagnostic",
    editor_help: "Glissez un composant • Cliquez un port • Double-clic = propriétés • Molette = zoom • R = pivoter",
  },
  en: {
    nav_library: "Library",
    nav_capabilities: "Features",
    nav_components: "Components",
    nav_method: "Method",
    nav_exercises: "Exercises",
    nav_simulator: "Simulator",
    hero_title: "Wire. Test. Validate your systems without risk.",
    hero_subtitle: "Design and simulate your pneumatic circuits in a few clicks, directly in your browser.",
    btn_open_editor: "Open Editor",
    btn_view_examples: "View Example Schematics",
    btn_discover: "Discover Features",
    footer_text: "PNEUMASIM — Pneumatic Circuit Editor & Simulator",
    legal_mentions: "LEGAL NOTICE",
    legal_privacy: "PRIVACY POLICY",
    toolbar_save: "Save",
    toolbar_load: "Load",
    toolbar_favorites: "My Favorites",
    toolbar_export: "Export",
    toolbar_oscillo: "Scope",
    toolbar_diagnostic: "Diagnostic",
    editor_help: "Drag a component • Click a port • Double-click = properties • Wheel = zoom • R = rotate",
  }
};

type TranslationKey = keyof typeof translations.fr;

interface I18nContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

export const I18nContext = createContext<I18nContextType | null>(null);

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used within I18nProvider");
  return context;
}
