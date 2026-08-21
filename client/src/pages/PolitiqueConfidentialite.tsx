import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-[#0d1219] text-[#dfe8f2] font-sans selection:bg-[#ff6a3d]/30">
      <header className="border-b border-[#26333f] px-6 lg:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[13px] font-mono text-[#5d7189] hover:text-[#ff6a3d] transition-colors">
          <ArrowLeft className="h-4 w-4" /> RETOUR À L'ACCUEIL
        </Link>
        <div className="font-mono text-[11px] text-[#5d7189]">PNEUMASIM · CONFIDENTIALITÉ · REV. 2026.08</div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Politique de Confidentialité</h1>
        
        <div className="space-y-12 text-[15px] leading-relaxed text-[#8296ab]">
          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">1. Introduction</h2>
            <p>
              La protection de vos données personnelles est une priorité pour PneumaSim. Cette politique détaille 
              comment nous traitons les informations collectées lors de votre utilisation de la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">2. Collecte des données</h2>
            <p>
              PneumaSim ne collecte aucune donnée personnelle nominative sans votre consentement. 
              Les schémas enregistrés en "Favoris" sont stockés exclusivement dans votre navigateur via le 
              <strong> LocalStorage</strong>. Aucune donnée de conception n'est transmise à nos serveurs.
            </p>
          </section>

          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">3. Publicité (Google AdSense)</h2>
            <p>
              Ce site utilise Google AdSense pour diffuser des annonces. Google utilise des cookies pour diffuser 
              des annonces basées sur vos visites antérieures sur ce site ou sur d'autres sites Web.
            </p>
            <p className="mt-4">
              L'utilisation de cookies publicitaires par Google lui permet, ainsi qu'à ses partenaires, de diffuser 
              des annonces en fonction de votre navigation sur nos sites et/ou d'autres sites sur Internet. 
              Vous pouvez choisir de désactiver la publicité personnalisée dans les 
              <a href="https://www.google.com/settings/ads" className="text-[#ff6a3d] hover:underline"> Paramètres des annonces Google</a>.
            </p>
          </section>

          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">4. Cookies techniques</h2>
            <p>
              Nous utilisons des cookies techniques strictement nécessaires au fonctionnement de l'éditeur 
              (mémorisation de vos préférences d'affichage, zoom, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">5. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. 
              Pour toute demande, contactez-nous à : <strong>helpscannerapk@gmail.com</strong>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-[#26333f] px-6 py-8 text-center font-mono text-[11px] text-[#5d7189]">
        © 2026 PNEUMASIM · PROTECTION DES DONNÉES
      </footer>
    </div>
  );
}
