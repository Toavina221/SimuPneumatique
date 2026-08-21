import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nContext } from "./lib/i18n";
import { useState, useEffect } from "react";
import { lazy, Suspense } from "react";
import Home from "./pages/Home";

const Workbench = lazy(() => import("./pages/Workbench"));
const ExercisePage = lazy(() => import("./pages/ExercisePage"));
const Library = lazy(() => import("./pages/Library"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const PolitiqueConfidentialite = lazy(() => import("./pages/PolitiqueConfidentialite"));


function Router() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d1219] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ff6a3d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/editeur"} component={Workbench} />
        <Route path={"/exercice"} component={ExercisePage} />
        <Route path={"/bibliotheque"} component={Library} />
        <Route path={"/mentions-legales"} component={MentionsLegales} />
        <Route path={"/confidentialite"} component={PolitiqueConfidentialite} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const [lang, setLang] = useState<"fr" | "en">(() => {
    const saved = localStorage.getItem("ps-lang");
    return (saved as "fr" | "en") || "fr";
  });

  useEffect(() => {
    localStorage.setItem("ps-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: any) => {
    const translations: any = {
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
    return translations[lang][key] || key;
  };

  return (
    <ErrorBoundary>
      <I18nContext.Provider value={{ lang, setLang, t }}>
        <ThemeProvider
          defaultTheme="dark"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </I18nContext.Provider>
    </ErrorBoundary>
  );
}

export default App;
