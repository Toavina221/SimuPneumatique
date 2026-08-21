import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-[#0d1219] text-[#dfe8f2] font-sans selection:bg-[#ff6a3d]/30">
      <header className="border-b border-[#26333f] px-6 lg:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[13px] font-mono text-[#5d7189] hover:text-[#ff6a3d] transition-colors">
          <ArrowLeft className="h-4 w-4" /> RETOUR À L'ACCUEIL
        </Link>
        <div className="font-mono text-[11px] text-[#5d7189]">PNEUMASIM · DOC. LÉGALE · REV. 2026.08</div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Mentions Légales</h1>
        
        <div className="space-y-12 text-[15px] leading-relaxed text-[#8296ab]">
          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">1. Édition du site</h2>
            <p>
              En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, 
              il est précisé aux utilisateurs du site <strong>PneumaSim</strong> l'identité des différents intervenants 
              dans le cadre de sa réalisation et de son suivi :
            </p>
            <ul className="mt-4 space-y-2 list-disc list-inside">
              <li><strong>Propriétaire du site :</strong> Rovamampionina Toavina</li>
              <li><strong>Contact :</strong> helpscannerapk@gmail.com</li>
              <li><strong>Directeur de la publication :</strong> Rovamampionina Toavina</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">2. Hébergement</h2>
            <p>
              Le site est hébergé par <strong>Vercel Inc.</strong><br />
              Adresse : 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.<br />
              Site web : <a href="https://vercel.com" className="text-[#ff6a3d] hover:underline">https://vercel.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">3. Propriété intellectuelle</h2>
            <p>
              Rovamampionina Toavina est propriétaire des droits de propriété intellectuelle ou détient les droits d’usage 
              sur tous les éléments accessibles sur le site internet, notamment les textes, images, graphismes, logos, 
              vidéos, architecture, icônes et sons.
            </p>
            <p className="mt-4">
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, 
              quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
            </p>
          </section>

          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">4. Limitations de responsabilité</h2>
            <p>
              PneumaSim est un outil de simulation à but pédagogique. Les résultats obtenus ne sauraient engager la responsabilité 
              de l'éditeur pour une application industrielle réelle. L'utilisateur est responsable de la vérification de ses 
              circuits par un ingénieur qualifié avant toute mise en œuvre physique.
            </p>
          </section>
        </div>
      </main>

      {/* Signature Auteur */}
      <div className="py-8 text-center border-t border-[#26333f]/30 bg-[#0d1219]/50">
        <span className="text-[9px] uppercase tracking-[0.3em] text-[#5d7189] font-medium opacity-50">
          Conçu et développé par
        </span>
        <div className="mt-1 text-2xl font-normal text-[#ff6a3d]" style={{ fontFamily: "'Caveat', cursive" }}>
          Rovamampionina Toavina
        </div>
      </div>

      <footer className="border-t border-[#26333f] px-6 py-8 text-center font-mono text-[11px] text-[#5d7189]">
        © 2026 PNEUMASIM · TOUS DROITS RÉSERVÉS
      </footer>
    </div>
  );
}
