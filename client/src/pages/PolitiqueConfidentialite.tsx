import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function PolitiqueConfidentialite() {
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
        <div className="font-mono text-[11px] text-[#5d7189]">PNEUMASIM · {lang === 'fr' ? 'CONFIDENTIALITÉ' : 'PRIVACY'} · REV. 2026.08</div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold tracking-tight mb-8">{t('privacy_title')}</h1>
        
        <div className="space-y-12 text-[15px] leading-relaxed text-[#8296ab]">
          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">1. Introduction</h2>
            <p>
              {lang === 'fr'
                ? "La protection de vos données personnelles est une priorité pour PneumaSim. Cette politique détaille comment nous traitons les informations collectées lors de votre utilisation de la plateforme."
                : "The protection of your personal data is a priority for PneumaSim. This policy details how we process the information collected during your use of the platform."}
            </p>
          </section>

          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">2. {lang === 'fr' ? 'Collecte des données' : 'Data Collection'}</h2>
            <p>
              {lang === 'fr'
                ? "PneumaSim ne collecte aucune donnée personnelle nominative sans votre consentement. Les schémas enregistrés en \"Favoris\" sont stockés exclusivement dans votre navigateur via le LocalStorage. Aucune donnée de conception n'est transmise à nos serveurs."
                : "PneumaSim does not collect any nominative personal data without your consent. Schematics saved in \"Favorites\" are stored exclusively in your browser via LocalStorage. No design data is transmitted to our servers."}
            </p>
          </section>

          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">3. {lang === 'fr' ? 'Publicité (Google AdSense)' : 'Advertising (Google AdSense)'}</h2>
            <p>
              {lang === 'fr'
                ? "Ce site utilise Google AdSense pour diffuser des annonces. Google utilise des cookies pour diffuser des annonces basées sur vos visites antérieures sur ce site ou sur d'autres sites Web."
                : "This site uses Google AdSense to serve ads. Google uses cookies to serve ads based on your prior visits to this site or other websites."}
            </p>
            <p className="mt-4">
              {lang === 'fr'
                ? "L'utilisation de cookies publicitaires par Google lui permet, ainsi qu'à ses partenaires, de diffuser des annonces en fonction de votre navigation sur nos sites et/ou d'autres sites sur Internet. Vous pouvez choisir de désactiver la publicité personnalisée dans les Paramètres des annonces Google."
                : "Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our sites and/or other sites on the Internet. You may opt out of personalized advertising by visiting Google Ads Settings."}
            </p>
          </section>

          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">4. {lang === 'fr' ? 'Cookies techniques' : 'Technical Cookies'}</h2>
            <p>
              {lang === 'fr'
                ? "Nous utilisons des cookies techniques strictement nécessaires au fonctionnement de l'éditeur (mémorisation de vos préférences d'affichage, zoom, etc.)."
                : "We use technical cookies strictly necessary for the operation of the editor (remembering your display preferences, zoom, etc.)."}
            </p>
          </section>

          <section>
            <h2 className="text-[#dfe8f2] text-xl font-bold mb-4">5. {lang === 'fr' ? 'Vos droits' : 'Your Rights'}</h2>
            <p>
              {lang === 'fr'
                ? "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour toute demande, contactez-nous à : helpscannerapk@gmail.com."
                : "In accordance with the GDPR, you have the right to access, rectify, and delete your data. For any request, contact us at: helpscannerapk@gmail.com."}
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
        © 2026 PNEUMASIM · {lang === 'fr' ? 'PROTECTION DES DONNÉES' : 'DATA PROTECTION'}
      </footer>
    </div>
  );
}
