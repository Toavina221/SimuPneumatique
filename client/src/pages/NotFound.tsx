import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { lang } = useTranslation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0d1219]">
      <Card className="w-full max-w-lg mx-4 shadow-2xl border border-[#2f3f4f] bg-[#141c27]">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/10 rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-red-500" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-[#dfe8f2] mb-2">404</h1>

          <h2 className="text-xl font-semibold text-[#dfe8f2] mb-4">
            {lang === 'fr' ? 'Page non trouvée' : 'Page Not Found'}
          </h2>

          <p className="text-[#8296ab] mb-8 leading-relaxed">
            {lang === 'fr' 
              ? "Désolé, la page que vous recherchez n'existe pas." 
              : "Sorry, the page you are looking for doesn't exist."}
            <br />
            {lang === 'fr'
              ? "Elle a peut-être été déplacée ou supprimée."
              : "It may have been moved or deleted."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleGoHome}
              className="bg-[#4aa8ff] hover:bg-[#3d8ce6] text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-4 h-4 mr-2" />
              {lang === 'fr' ? 'Retour à l\'accueil' : 'Go Home'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
