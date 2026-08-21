import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./lib/i18n";
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

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ThemeProvider
          defaultTheme="dark"
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
