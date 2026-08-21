import React, { useState, useEffect, createContext, useContext } from 'react';

export type LocalizedString = {
  fr: string;
  en: string;
};

type Language = 'fr' | 'en';

const translations = {
  fr: {
    // Nav
    nav_library: "Bibliothèque",
    nav_capabilities: "Capacités",
    nav_components: "Composants",
    nav_method: "Méthode",
    nav_editor: "Éditeur",
    nav_exercises: "Exercices",
    nav_simulator: "Simulateur",
    nav_legal: "Mentions Légales",
    nav_privacy: "Confidentialité",
    lang_fr: "Français",
    lang_en: "English",

    // Hero
    hero_tagline: "Atelier virtuel de pneumatique",
    hero_title_1: "Câblez. Testez.",
    hero_title_2: "Validez vos automatismes ",
    hero_title_3: "sans risque.",
    hero_subtitle: "L'éditeur professionnel pour concevoir, simuler et exporter vos circuits pneumatiques aux normes ISO 1219.",
    btn_open_editor: "Ouvrir l'éditeur",
    btn_view_examples: "Voir les exemples",
    btn_discover: "Découvrir",
    btn_test_sim: "Tester le simulateur",
    meta_components: "composants",
    meta_iso: "NORME ISO 1219",
    meta_browser: "navigateur",
    legend_pressurized: "Air sous pression",
    legend_rest: "Air / conduite au repos",
    legend_signal: "Signal de pilotage actif",

    // Capacities
    cap_tagline: "De la feuille au mouvement",
    cap_title: "Une feuille de plan qui devient une machine.",
    cap_subtitle: "Tracez vos conduites, mettez l'air, observez le résultat. Chaque pas de simulation évalue le circuit complet :",
    cap_li1: "l'air progresse dans chaque conduite",
    cap_li2: "les distributeurs suivent leurs signaux de pilotage",
    cap_li3: "les vérins sortent et rentrent selon leur temps de course, ralentis par les régulateurs comme en réalité",
    cap1_title: "Monter le circuit",
    cap1_desc: "Glissez depuis la palette : compresseur, distributeurs, vérins, régulateurs, clapets, logique, capteurs et manomètres.",
    cap2_title: "Mettre l'air",
    cap2_desc: "Lancez la simulation et observez la pression se propager en orange, les distributeurs basculer et les vérins bouger.",
    cap3_title: "Observer & dépanner",
    cap3_desc: "Capteurs reliés aux vannes, ralentisseurs sur les régulateurs : vérifiez vos automatismes avant la vraie machine.",
    cap4_title: "Exporter & partager",
    cap4_desc: "Feuille au format plan ISO avec cartouche, export SVG vectoriel et sauvegarde JSON rechargeable.",
    diag_chamber_a: "chambre A pressurisée",
    diag_sensor_active: "signal capteur actif",

    // Footer
    footer_desc: "Plateforme professionnelle de simulation pneumatique interactive conforme aux normes ISO 1219.",
    footer_nav: "Navigation",
    footer_legal: "Légal",
    footer_rights: "Tous droits réservés",
    legal_title: "Mentions Légales",
    privacy_title: "Politique de Confidentialité",
    author_by: "Conçu et développé par",

    // Editor / Workbench
    toolbar_save: "Enregistrer",
    toolbar_load: "Charger",
    toolbar_favorites: "Mes favoris",
    toolbar_export: "Exporter",
    toolbar_oscillo: "Oscillo",
    toolbar_diagnostic: "Diagnostic",
    editor_help: "Glissez un composant • Cliquez un port • Double-clic = propriétés • Molette = zoom • R = pivoter",
    back_to_home: "Retour à l'accueil",
    back_to_editor: "Retour à l'éditeur",
    library_title: "Bibliothèque de Schémas",
    library_subtitle: "Modèles industriels certifiés ISO 1219",
    exercises_title: "Atelier d'Exercices",
    exercises_subtitle: "Défis interactifs de câblage et diagnostic",
    btn_test_editor: "Tester le simulateur",
    btn_examples: "Exemples",
    label_components: "Composants",
    label_author: "Auteur",
    label_back_home: "Retour à l'accueil",
    
    // PDF Export
    pdf_report_title: "PneumaSim - Rapport de Conception",
    pdf_title: "Titre",
    pdf_author: "Auteur",
    pdf_folio: "Folio",
    pdf_date: "Date",
    pdf_bom_title: "Nomenclature des composants (BOM)",
    pdf_qty: "Quantité",
    pdf_designation: "Désignation ISO 1219",
    pdf_type: "Type ID",
    pdf_perf_title: "Analyses de Performance",
    pdf_generated_by: "Généré par PneumaSim",
    pdf_page: "Page"
  },
  en: {
    // Nav
    nav_library: "Library",
    nav_capabilities: "Capabilities",
    nav_components: "Components",
    nav_method: "Method",
    nav_editor: "Editor",
    nav_exercises: "Exercises",
    nav_simulator: "Simulator",
    nav_legal: "Legal Notice",
    nav_privacy: "Privacy Policy",
    lang_fr: "French",
    lang_en: "English",

    // Hero
    hero_tagline: "Virtual Pneumatic Workshop",
    hero_title_1: "Design. Test.",
    hero_title_2: "Validate your systems ",
    hero_title_3: "without risk.",
    hero_subtitle: "The professional editor to design, simulate, and export your pneumatic circuits to ISO 1219 standards.",
    btn_open_editor: "Open Editor",
    btn_view_examples: "View Examples",
    btn_discover: "Discover",
    btn_test_sim: "Test Simulator",
    meta_components: "components",
    meta_iso: "ISO 1219 STANDARD",
    meta_browser: "browser",
    legend_pressurized: "Pressurized air",
    legend_rest: "Air / line at rest",
    legend_signal: "Active pilot signal",

    // Capacities
    cap_tagline: "From Blueprint to Motion",
    cap_title: "A blueprint that becomes a machine.",
    cap_subtitle: "Trace your lines, turn on the air, observe the result. Each simulation step evaluates the full circuit:",
    cap_li1: "air progresses through each line",
    cap_li2: "valves follow their pilot signals",
    cap_li3: "cylinders extend and retract according to their stroke time, slowed by regulators as in reality",
    cap1_title: "Build the Circuit",
    cap1_desc: "Drag from the palette: compressor, valves, cylinders, regulators, check valves, logic, sensors, and gauges.",
    cap2_title: "Turn on the Air",
    cap2_desc: "Start the simulation and watch pressure spread in orange, valves switch, and cylinders move.",
    cap3_title: "Observe & Troubleshoot",
    cap3_desc: "Sensors linked to valves, flow control throttling: verify your automation before the real machine.",
    cap4_title: "Export & Share",
    cap4_desc: "ISO format sheet with title block, vector SVG export, and reloadable JSON save.",
    diag_chamber_a: "chamber A pressurized",
    diag_sensor_active: "sensor signal active",

    // Footer
    footer_desc: "Professional interactive pneumatic simulation platform compliant with ISO 1219 standards.",
    footer_nav: "Navigation",
    footer_legal: "Legal",
    footer_rights: "All rights reserved",
    legal_title: "Legal Notice",
    privacy_title: "Privacy Policy",
    author_by: "Designed and developed by",

    // Editor / Workbench
    toolbar_save: "Save",
    toolbar_load: "Load",
    toolbar_favorites: "My Favorites",
    toolbar_export: "Export",
    toolbar_oscillo: "Scope",
    toolbar_diagnostic: "Diagnostic",
    editor_help: "Drag a component • Click a port • Double-click = properties • Wheel = zoom • R = rotate",
    back_to_home: "Back to Home",
    back_to_editor: "Back to Editor",
    library_title: "Schematic Library",
    library_subtitle: "ISO 1219 Certified Industrial Models",
    exercises_title: "Exercise Workshop",
    exercises_subtitle: "Interactive wiring and diagnostic challenges",
    btn_test_editor: "Test Simulator",
    btn_examples: "Examples",
    label_components: "Components",
    label_author: "Author",
    label_back_home: "Back to Home",
    
    // PDF Export
    pdf_report_title: "PneumaSim - Design Report",
    pdf_title: "Title",
    pdf_author: "Author",
    pdf_folio: "Folio",
    pdf_date: "Date",
    pdf_bom_title: "Bill of Materials (BOM)",
    pdf_qty: "Quantity",
    pdf_designation: "ISO 1219 Designation",
    pdf_type: "Type ID",
    pdf_perf_title: "Performance Analysis",
    pdf_generated_by: "Generated by PneumaSim",
    pdf_page: "Page"
  }
};

type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

export const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pneumasim-lang');
      return (saved as Language) || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('pneumasim-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: TranslationKey) => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  return React.createElement(I18nContext.Provider, { value: { lang, setLang, t } }, children);
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used within I18nProvider");
  return context;
}

export function getL(str: string | LocalizedString | undefined, lang: Language): string {
  if (!str) return "";
  if (typeof str === 'string') return str;
  return str[lang] || str.en || "";
}
