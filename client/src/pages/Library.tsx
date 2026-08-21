// PneumaSim — Plan d'atelier (Blueprint Craft)
// Page Bibliothèque : catalogue de circuits types avec aperçus et chargement.

import { Link, useLocation } from "wouter";
import { ArrowLeft, Play, Info } from "lucide-react";
import { EXAMPLES } from "@/lib/pneusim/exampleDocs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const LOGO_URL = "/manus-storage/pneumasim-logo_42e92c26.png";

export default function Library() {
  const [, setLocation] = useLocation();

  const handleLoad = (id: string) => {
    // Le Workbench charge l'exemple "directe" par défaut s'il n'y a rien.
    // On passe l'ID via localStorage ou state pour que Workbench le récupère.
    localStorage.setItem("ps_load_example", id);
    setLocation("/editeur");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0d1219", color: "#dfe8f2" }}>
      {/* Header */}
      <header className="border-b border-[#26333f] px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-[#0d1219]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/">
            <img src={LOGO_URL} alt="PneumaSim" className="h-8 w-8 cursor-pointer active:scale-95 transition-transform" />
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#dfe8f2]">Bibliothèque de Schémas</h1>
            <p className="text-xs text-[#5d7189] font-mono uppercase tracking-wider">Modèles industriels certifiés ISO 1219</p>
          </div>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-[#8296ab] hover:text-[#dfe8f2] hover:bg-[#26333f]">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
        </Link>
      </header>

      <main className="flex-1 container max-w-6xl py-12 px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-[#ff6a3d]">Circuits Classiques</h2>
          <p className="text-[#8296ab] max-w-2xl leading-relaxed">
            Explorez notre collection de circuits pneumatiques types. Chaque schéma est prêt à être simulé, modifié et exporté pour vos projets d'automatisation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXAMPLES.map((ex) => (
            <Card key={ex.id} className="bg-[#141c27] border-[#26333f] hover:border-[#ff6a3d]/50 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-8 w-8 rounded bg-[#ff6a3d]/10 flex items-center justify-center text-[#ff6a3d]">
                    <Info className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono text-[#5d7189] bg-[#0d1219] px-2 py-0.5 rounded border border-[#26333f]">
                    {ex.id.toUpperCase()}
                  </span>
                </div>
                <CardTitle className="text-lg text-[#dfe8f2] group-hover:text-[#ff6a3d] transition-colors">
                  {ex.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[#8296ab] text-sm leading-relaxed min-h-[60px]">
                  {ex.description}
                </CardDescription>
                <div className="mt-4 aspect-video rounded-md bg-[#0d1219] border border-[#26333f] flex items-center justify-center overflow-hidden relative">
                   {/* Placeholder pour un futur rendu d'aperçu statique */}
                   <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                     <img src={LOGO_URL} alt="" className="w-1/2" />
                   </div>
                   <span className="text-[10px] font-mono text-[#5d7189]">Aperçu ISO 1219</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button 
                  onClick={() => handleLoad(ex.id)}
                  className="w-full bg-[#ff6a3d] hover:bg-[#ff855f] text-white font-bold"
                >
                  <Play className="h-4 w-4 mr-2 fill-current" /> Ouvrir dans l'éditeur
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#26333f] py-8 px-6 text-center">
        <p className="text-[11px] font-mono text-[#5d7189]">
          PNEUMASIM &copy; 2026 • CONCEPTION INDUSTRIELLE • ISO 1219 COMPLIANT
        </p>
      </footer>
    </div>
  );
}
