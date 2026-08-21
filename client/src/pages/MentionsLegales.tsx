import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function MentionsLegales() {
  const { lang, setLang, t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#0d1219] text-[#dfe8f2] font-sans selection:bg-[#ff6a3d]/30">
      <header className="border-b border-[#26333f] px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-10 bg-[#0d1219]/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-[13px] font-mono text-[#5d7189] hover:text-[#ff6a3d] transition-colors">
            <ArrowLeft className="h-4 w-4" /> {lang === 'fr' ? "RETOUR À L'ACCUEIL" : "BACK TO HOME"}
          </Link>
          <div className="hidden sm:flex items-center gap-2 border-l border-[#26333f] pl-6">
            <button 
              onClick={() => setLang('fr')} 
              className={`text-[11px] font-mono ${lang === 'fr' ? 'text-[#ff6a3d] font-bold' : 'text-[#5d7189] hover:text-[#dfe8f2]'}`}
            >{t('lang_fr')}</button>
            <span className="text-[#26333f]">|</span>
            <button 
              onClick={() => setLang('en')} 
              className={`text-[11px] font-mono ${lang === 'en' ? 'text-[#ff6a3d] font-bold' : 'text-[#5d7189] hover:text-[#dfe8f2]'}`}
            >{t('lang_en')}</button>
          </div>
        </div>
        <div className="font-mono text-[11px] text-[#5d7189]">PNEUMASIM · {lang === 'fr' ? 'DOC. LÉGALE' : 'LEGAL DOC.'} · REV. 2026.08</div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold tracking-tight mb-8">{t('legal_title')}</h1>
        
        <div className="space-y-12 text-[15px] leading-relaxed text-[#8296ab]">
          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">1. {lang === 'fr' ? 'Édition du site' : 'Site Information'}</h2>
            <p>
              {lang === 'fr' 
                ? "En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, il est précisé aux utilisateurs du site PneumaSim l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi :"
                : "In accordance with Article 6 of Law No. 2004-575 of June 21, 2004, on confidence in the digital economy, users of the PneumaSim site are informed of the identity of the various parties involved in its creation and monitoring:"}
            </p>
            <ul className="mt-4 space-y-2 list-disc list-inside">
              <li><strong>{lang === 'fr' ? 'Propriétaire du site :' : 'Site Owner:'}</strong> Rovamampionina Toavina</li>
              <li><strong>Contact :</strong> helpscannerapk@gmail.com</li>
              <li><strong>{lang === 'fr' ? 'Directeur de la publication :' : 'Publication Director:'}</strong> Rovamampionina Toavina</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">2. {lang === 'fr' ? 'Hébergement' : 'Hosting'}</h2>
            <p>
              {lang === 'fr' ? 'Le site est hébergé par' : 'The site is hosted by'} <strong>Vercel Inc.</strong><br />
              {lang === 'fr' ? 'Adresse :' : 'Address:'} 340 S Lemon Ave #4133, Walnut, CA 91789, {lang === 'fr' ? 'États-Unis' : 'USA'}.<br />
              {lang === 'fr' ? 'Site web :' : 'Website:'} <a href="https://vercel.com" className="text-[#ff6a3d] hover:underline">https://vercel.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">3. {lang === 'fr' ? 'Propriété intellectuelle' : 'Intellectual Property'}</h2>
            <p>
              {lang === 'fr' 
                ? "Rovamampionina Toavina est propriétaire des droits de propriété intellectuelle ou détient les droits d’usage sur tous les éléments accessibles sur le site internet, notamment les textes, images, graphismes, logos, vidéos, architecture, icônes et sons."
                : "Rovamampionina Toavina owns the intellectual property rights or holds the usage rights for all elements accessible on the website, including texts, images, graphics, logos, videos, architecture, icons, and sounds."}
            </p>
            <p className="mt-4">
              {lang === 'fr'
                ? "Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable."
                : "Any reproduction, representation, modification, publication, adaptation of all or part of the elements of the site, regardless of the means or process used, is prohibited, except with prior written authorization."}
            </p>
          </section>

          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">4. {lang === 'fr' ? 'Limitations de responsabilité' : 'Limitation of Liability'}</h2>
            <p>
              {lang === 'fr'
                ? "PneumaSim est un outil de simulation à but pédagogique. Les résultats obtenus ne sauraient engager la responsabilité de l'éditeur pour une application industrielle réelle. L'utilisateur est responsable de la vérification de ses circuits par un ingénieur qualifié avant toute mise en œuvre physique."
                : "PneumaSim is a simulation tool for educational purposes. The results obtained cannot engage the publisher's liability for a real industrial application. The user is responsible for verifying their circuits by a qualified engineer before any physical implementation."}
            </p>
          </section>
        </div>
      </main>

      {/* Signature Auteur */}
      <div className="py-8 text-center border-t border-[#26333f]/30 bg-[#0d1219]/50">
        <span className="text-[9px] uppercase tracking-[0.3em] text-[#5d7189] font-medium opacity-50">
          {t('author_by')}
        </span>
        <div className="mt-1 text-2xl font-normal text-[#ff6a3d]" style={{ fontFamily: "'Caveat', cursive" }}>
          Rovamampionina Toavina
        </div>
      </div>

      <footer className="border-t border-[#26333f] px-6 py-8 text-center font-mono text-[11px] text-[#5d7189]">
        © 2026 PNEUMASIM · {t('footer_rights').toUpperCase()}
      </footer>
    </div>
  );
}
