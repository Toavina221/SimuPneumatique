// PneumaSim — Blueprint Craft
// Home page: asymmetric hero with generated blueprint visual,
// presentation of capabilities, component library and CTA to editor.

import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import {
  ArrowRight,
  FileOutput,
  Layers,
  Play,
  ScanSearch,
} from "lucide-react";

const LOGO_URL = "/manus-storage/pneumasim-logo_42e92c26.png";
const HERO_URL = "/manus-storage/pneumasim-hero_02a4d74e.png";
const FEATURES_URL = "/manus-storage/pneumasim-features_057a3382.png";

export default function Home() {
  const { lang, setLang, t } = useTranslation();

  const capabilities = [
    {
      icon: Layers,
      title: t('cap1_title'),
      desc: t('cap1_desc'),
    },
    {
      icon: Play,
      title: t('cap2_title'),
      desc: t('cap2_desc'),
    },
    {
      icon: ScanSearch,
      title: t('cap3_title'),
      desc: t('cap3_desc'),
    },
    {
      icon: FileOutput,
      title: t('cap4_title'),
      desc: t('cap4_desc'),
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0d1219", color: "#dfe8f2", fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
    >
      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-[#26333f]">
        <div className="flex items-center gap-2.5">
          <img src={LOGO_URL} alt="PneumaSim" className="h-9 w-9" />
          <span className="font-mono font-bold text-[16px] tracking-[2.5px] text-[#dfe8f2]">PNEUMA<span className="text-[#ff6a3d]">SIM</span></span>
          <span className="hidden sm:inline-block h-2 w-2 rounded-full bg-[#ff6a3d] shadow-[0_0_6px_#ff6a3d]" />
        </div>
        <nav className="hidden md:flex items-center gap-7 text-[13px] text-[#8296ab]">
          <Link href="/bibliotheque" className="hover:text-[#dfe8f2] transition-colors">{t('nav_library')}</Link>
          <a href="#capacites" className="hover:text-[#dfe8f2] transition-colors">{t('nav_capabilities')}</a>
          <a href="#composants" className="hover:text-[#dfe8f2] transition-colors">{t('nav_components')}</a>
          <a href="#methode" className="hover:text-[#dfe8f2] transition-colors">{t('nav_method')}</a>
          <div className="flex items-center gap-2 ml-4 border-l border-[#26333f] pl-4">
            {/* <button 
              onClick={() => setLang('fr')} 
              className={`text-[11px] ${lang === 'fr' ? 'text-[#ff6a3d] font-bold' : 'text-[#5d7189] hover:text-[#dfe8f2]'}`}
            >{t('lang_fr')}</button>
            <span className="text-[#26333f]">|</span>
            <button 
              onClick={() => setLang('en')} 
              className={`text-[11px] ${lang === 'en' ? 'text-[#ff6a3d] font-bold' : 'text-[#5d7189] hover:text-[#dfe8f2]'}`}
            >{t('lang_en')}</button> */}
          </div>
          {/*  */}
        </nav>
        <Link
          href="/editeur"
          className="inline-flex items-center gap-2 bg-[#ff6a3d] hover:bg-[#ff7d56] border border-[#ff6a3d] text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors active:scale-[0.97]"
        >
          {t('btn_test_sim')} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <img
          src={HERO_URL}
          alt="Simulated pneumatic diagram"
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1219] via-[#0d1219]/80 to-[#0d1219]/30" />
        <div className="relative px-6 lg:px-12 py-24 lg:py-32 max-w-3xl">
          <p className="font-mono text-[12px] tracking-[2px] text-[#ff6a3d] uppercase mb-5">
            {t('hero_tagline')}
          </p>
          <h1 className="text-4xl lg:text-6xl font-bold leading-[1.08] tracking-tight">
            {t('hero_title_1')}
            <br />
            {t('hero_title_2')}
            <span className="text-[#ff6a3d]">{t('hero_title_3')}</span>
          </h1>
          <p className="mt-6 text-[16px] leading-relaxed text-[#8296ab] max-w-xl">
            {t('hero_subtitle')}
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/editeur"
              className="inline-flex items-center gap-2 bg-[#ff6a3d] hover:bg-[#ff7d56] text-white px-6 py-3 rounded-lg text-[14px] font-bold transition-colors active:scale-[0.97]"
            >
              <Play className="h-4 w-4" fill="white" /> {t('btn_open_editor')}
            </Link>
            <Link
              href="/bibliotheque"
              className="inline-flex items-center gap-2 border border-[#ff6a3d]/50 hover:border-[#ff6a3d] text-[#ff6a3d] px-6 py-3 rounded-lg text-[14px] font-bold transition-colors active:scale-[0.97]"
            >
              <Layers className="h-4 w-4" /> {t('btn_view_examples')}
            </Link>
            <a
              href="#capacites"
              className="inline-flex items-center gap-2 border border-[#2f3f4f] hover:border-[#4aa8ff] text-[#dfe8f2] px-6 py-3 rounded-lg text-[14px] transition-colors"
            >
              {t('btn_discover')}
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[12px] text-[#5d7189] border-l-2 border-[#ff6a3d]/50 pl-4">
            <span>REF 37 {t('meta_components')}</span>
            <span>{t('meta_iso')}</span>
            <span>EXPORT SVG / JSON</span>
            <span>100% {t('meta_browser')}</span>
          </div>
          {/* technical sheet style state legend */}
          <div className="mt-6 inline-flex flex-wrap gap-5 rounded-md border border-[#26333f] px-4 py-2.5 font-mono text-[11.5px]" style={{ background: "#121a24" }}>
            <span className="flex items-center gap-2"><span className="h-0.5 w-6 bg-[#ff6a3d]" /> {t('legend_pressurized')}</span>
            <span className="flex items-center gap-2"><span className="h-0.5 w-6 bg-[#5d7189]" /> {t('legend_rest')}</span>
            <span className="flex items-center gap-2"><span className="h-0.5 w-6 border-t border-dashed border-[#ffd23f]" /> {t('legend_signal')}</span>
          </div>
        </div>
      </section>

      {/* ── Capacities ────────────────────────────────────── */}
      <section id="capacites" className="px-6 lg:px-12 py-20 grid lg:grid-cols-2 gap-12 items-center border-t border-[#26333f]">
        <div>
          <p className="font-mono text-[12px] tracking-[2px] text-[#ff6a3d] uppercase mb-4">
            {t('cap_tagline')}
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            {t('cap_title')}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#8296ab]">
            {t('cap_subtitle')}
          </p>
          <ul className="mt-4 space-y-2 font-mono text-[12.5px] text-[#c3d2e2]">
            <li className="flex items-start gap-2"><span className="mt-0.5 h-0.5 w-4 bg-[#ff6a3d]" /> {t('cap_li1')}</li>
            <li className="flex items-start gap-2"><span className="mt-0.5 h-0.5 w-4 bg-[#ff6a3d]" /> {t('cap_li2')}</li>
            <li className="flex items-start gap-2"><span className="mt-0.5 h-0.5 w-4 bg-[#ff6a3d]" /> {t('cap_li3')}</li>
          </ul>
          <div className="mt-8 border border-[#26333f]" style={{ background: "#121a24" }}>
            {capabilities.map((c, i) => (
              <div key={c.title} className={`group grid grid-cols-[52px_1fr] items-start p-5 hover:bg-[#ff6a3d]/[0.04] transition-colors ${i < capabilities.length - 1 ? "border-b border-[#26333f]" : ""}`}>
                <div className="flex flex-col items-center gap-2 font-mono text-[10px] text-[#3a4a5c]">
                  <span className="h-full w-px bg-[#26333f] group-hover:bg-[#ff6a3d]/60 transition-colors" />
                  <span className="group-hover:text-[#ff6a3d] transition-colors">B-{i + 1}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <c.icon className="h-4 w-4 text-[#4aa8ff] group-hover:text-[#ff6a3d] transition-colors" />
                    <h3 className="text-[14px] font-bold">{c.title}</h3>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#8296ab]">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <img
            src={FEATURES_URL}
            alt="Cross-section of double-acting cylinder"
            className="rounded-xl border border-[#26333f] w-full"
          />
          <div className="absolute -bottom-4 -left-4 rounded-sm border border-[#2f3f4f] px-4 py-3 font-mono text-[12px]" style={{ background: "#141c27" }}>
            <span className="text-[#ff6a3d]">●</span> {t('diag_chamber_a')} ·{" "}
            <span className="text-[#ffd23f]">●</span> {t('diag_sensor_active')}
          </div>
        </div>
      </section>

      {/* ── Signature ─────────────────────────────────────── */}
      <div className="px-6 lg:px-12 py-8 flex justify-center border-t border-[#26333f]">
        <p className="text-[24px] text-[#8296ab] opacity-60" style={{ fontFamily: "'Caveat', cursive" }}>
          Rovamampionina Toavina
        </p>
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="mt-auto px-6 lg:px-12 py-10 border-t border-[#26333f] bg-[#090d12]">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src={LOGO_URL} alt="PneumaSim" className="h-7 w-7" />
              <span className="font-mono font-bold text-[14px] tracking-[2px] text-[#dfe8f2]">PNEUMA<span className="text-[#ff6a3d]">SIM</span></span>
            </div>
            <p className="text-[13px] text-[#5d7189] max-w-sm">
              {t('footer_desc')}
            </p>
          </div>
          <div>
            <h4 className="font-mono text-[11px] tracking-[2px] text-[#ff6a3d] uppercase mb-4">{t('footer_nav')}</h4>
            <ul className="space-y-2 text-[13px] text-[#8296ab]">
              <li><Link href="/editeur" className="hover:text-[#dfe8f2]">{t('nav_editor')}</Link></li>
              <li><Link href="/bibliotheque" className="hover:text-[#dfe8f2]">{t('nav_library')}</Link></li>
              <li><Link href="/exercice" className="hover:text-[#dfe8f2]">{t('nav_exercises')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[11px] tracking-[2px] text-[#ff6a3d] uppercase mb-4">{t('footer_legal')}</h4>
            <ul className="space-y-2 text-[13px] text-[#8296ab]">
              <li><Link href="/mentions-legales" className="hover:text-[#dfe8f2]">{t('nav_legal')}</Link></li>
              <li><Link href="/confidentialite" className="hover:text-[#dfe8f2]">{t('nav_privacy')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[#26333f] flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-mono text-[#3a4a5c]">
          <span>© 2026 PNEUMASIM · {t('footer_rights')}</span>
          <div className="flex gap-6">
            <span>ISO 1219-1:2012 COMPLIANT</span>
            <span>VERCEL DEPLOYED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
