// PneumaSim — Plan d'atelier (Blueprint Craft)
// Page d'accueil : hero asymétrique avec visuel blueprint généré,
// présentation des capacités (éditer, simuler, exporter), bibliothèque
// de composants et CTA vers l'éditeur. Palette ardoise + orange pression.

import { Link } from "wouter";
import {
  AirVent,
  ArrowRight,
  CircuitBoard,
  ClipboardList,
  FileOutput,
  Gauge,
  Layers,
  Play,
  ScanSearch,
} from "lucide-react";

const LOGO_URL = "/pneumasim-logo.png";
const HERO_URL = "/pneumasim-hero.png";
const FEATURES_URL = "/pneumasim-features.png";

const capabilities = [
  {
    icon: Layers,
    title: "Monter le circuit",
    desc: "Glissez depuis la palette : compresseur, distributeurs 3/2 et 5/2 (mono et bistable), vérins simple et double effet, régulateurs, clapets, logique OU/ET, capteurs, manomètres et silencieux.",
  },
  {
    icon: Play,
    title: "Mettre l'air",
    desc: "Lancez la simulation et observez la pression se propager en orange dans les conduites, les distributeurs basculer sous signaux de pilotage et les vérins se déplacer en temps réel.",
  },
  {
    icon: ScanSearch,
    title: "Observer & dépanner",
    desc: "Capteurs de fin de course reliés aux vannes pilotées, ralentisseurs sur les régulateurs de débit, manomètres qui réagissent : vérifiez vos automatismes avant la vraie machine.",
  },
  {
    icon: FileOutput,
    title: "Exporter & partager",
    desc: "Feuille au format plan ISO avec cartouche (titre, auteur, date, folio), export SVG vectoriel pour vos rapports et sauvegarde JSON rechargeable à tout moment.",
  },
];

const components = [
  "Alimentation",
  "Distributeur 3/2",
  "Distributeur 5/2 mono",
  "Distributeur 5/2 bistable",
  "Vérin double effet",
  "Vérin simple effet",
  "Régulateur de débit",
  "Clapet anti-retour",
  "Logique OU",
  "Logique ET",
  "Capteur de position",
  "Manomètre",
  "Silencieux",
];

export default function Home() {
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
          <a href="#capacites" className="hover:text-[#dfe8f2] transition-colors">Capacités</a>
          <a href="#composants" className="hover:text-[#dfe8f2] transition-colors">Composants</a>
          <a href="#methode" className="hover:text-[#dfe8f2] transition-colors">Méthode</a>
        </nav>
        <Link
          href="/editeur"
              className="inline-flex items-center gap-2 bg-[#ff6a3d] hover:bg-[#ff7d56] border border-[#ff6a3d] text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors active:scale-[0.97]"
        >
          Tester le simulateur <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <img
          src={HERO_URL}
          alt="Schéma pneumatique simulé"
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1219] via-[#0d1219]/80 to-[#0d1219]/30" />
        <div className="relative px-6 lg:px-12 py-24 lg:py-32 max-w-3xl">
          <p className="font-mono text-[12px] tracking-[2px] text-[#ff6a3d] uppercase mb-5">
            Atelier virtuel de pneumatique
          </p>
          <h1 className="text-4xl lg:text-6xl font-bold leading-[1.08] tracking-tight">
            Câblez. Testez.
            <br />
            Validez vos automatismes <span className="text-[#ff6a3d]">sans risque.</span>
          </h1>
          <p className="mt-6 text-[16px] leading-relaxed text-[#8296ab] max-w-xl">
            Concevez et simulez vos circuits pneumatiques en quelques clics,
            directement dans le navigateur : distributions ISO 1219, vérins,
            régulateurs et capteurs réagissent en temps réel — sans installation,
            sans logiciel de CAO.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/editeur"
              className="inline-flex items-center gap-2 bg-[#ff6a3d] hover:bg-[#ff7d56] text-white px-6 py-3 rounded-lg text-[14px] font-bold transition-colors active:scale-[0.97]"
            >
              <Play className="h-4 w-4" fill="white" /> Tester le simulateur
            </Link>
            <a
              href="#capacites"
              className="inline-flex items-center gap-2 border border-[#2f3f4f] hover:border-[#4aa8ff] text-[#dfe8f2] px-6 py-3 rounded-lg text-[14px] transition-colors"
            >
              Découvrir les capacités
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[12px] text-[#5d7189] border-l-2 border-[#ff6a3d]/50 pl-4">
            <span>REF 24 composants</span>
            <span>NORME ISO 1219</span>
            <span>EXPORT SVG / JSON</span>
            <span>100 % navigateur</span>
          </div>
          {/* légende d'état façon feuille technique */}
          <div className="mt-6 inline-flex flex-wrap gap-5 rounded-md border border-[#26333f] px-4 py-2.5 font-mono text-[11.5px]" style={{ background: "#121a24" }}>
            <span className="flex items-center gap-2"><span className="h-0.5 w-6 bg-[#ff6a3d]" /> Air sous pression</span>
            <span className="flex items-center gap-2"><span className="h-0.5 w-6 bg-[#5d7189]" /> Air / conduite au repos</span>
            <span className="flex items-center gap-2"><span className="h-0.5 w-6 border-t border-dashed border-[#ffd23f]" /> Signal de pilotage actif</span>
          </div>
        </div>
        {/* cadre de cote vertical, côté droit du hero */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[#3a4a5c]">
          <div className="flex flex-col items-center gap-1">
            <span>DIM. 1600 × 1000</span>
            <span className="[writing-mode:vertical-rl] tracking-[4px] text-[10px]">PNEUMASIM · ISO 1219</span>
          </div>
        </div>
      </section>

      {/* ── Bande repères alphanumériques ────────────────── */}
      <div className="border-y border-[#26333f] px-6 lg:px-12 py-2.5 flex flex-wrap gap-x-8 gap-y-1 font-mono text-[10.5px] text-[#5d7189] tracking-[1px]">
        <span>PLANCHE 1/4</span>
        <span className="text-[#ff6a3d]">A-01 · GÉNÉRALITÉS</span>
        <span>A-02 · CAPACITÉS</span>
        <span>A-03 · COMPOSANTS</span>
        <span>A-04 · MÉTHODE</span>
        <span className="ml-auto">ÉCH. 1:1 · UNITÉ mm</span>
      </div>

      {/* ── Capacités ────────────────────────────────────── */}
      <section id="capacites" className="px-6 lg:px-12 py-20 grid lg:grid-cols-2 gap-12 items-center border-t border-[#26333f]">
        <div>
          <p className="font-mono text-[12px] tracking-[2px] text-[#ff6a3d] uppercase mb-4">
            De la feuille au mouvement
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Une feuille de plan qui devient une machine.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#8296ab]">
            Tracez vos conduites, mettez l'air, observez le résultat. Chaque pas
            de simulation évalue le circuit complet :
          </p>
          <ul className="mt-4 space-y-2 font-mono text-[12.5px] text-[#c3d2e2]">
            <li className="flex items-start gap-2"><span className="mt-0.5 h-0.5 w-4 bg-[#ff6a3d]" /> l'air progresse dans chaque conduite</li>
            <li className="flex items-start gap-2"><span className="mt-0.5 h-0.5 w-4 bg-[#ff6a3d]" /> les distributeurs suivent leurs signaux de pilotage</li>
            <li className="flex items-start gap-2"><span className="mt-0.5 h-0.5 w-4 bg-[#ff6a3d]" /> les vérins sortent et rentrent selon leur temps de course, ralentis par les régulateurs comme en réalité</li>
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
            <div className="flex items-center justify-between border-t border-[#26333f] px-5 py-2 font-mono text-[10px] text-[#5d7189]">
              <span>REVISION A · VÉRIFIÉ PNEUMASIM</span>
              <span>4 POSITIONS</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <img
            src={FEATURES_URL}
            alt="Vérin double effet en coupe"
            className="rounded-xl border border-[#26333f] w-full"
          />
          <div className="absolute -bottom-4 -left-4 rounded-sm border border-[#2f3f4f] px-4 py-3 font-mono text-[12px]" style={{ background: "#141c27" }}>
            <span className="text-[#ff6a3d]">●</span> chambre A pressurisée ·{" "}
            <span className="text-[#ffd23f]">●</span> signal capteur actif
          </div>
          {/* mini-cartouche de plan sous l'illustration */}
          <div className="mt-5 grid grid-cols-4 border border-[#26333f] font-mono text-[10.5px]" style={{ background: "#121a24" }}>
            <span className="border-r border-[#26333f] px-2 py-1.5 text-[#5d7189]">AUTEUR</span>
            <span className="border-r border-[#26333f] px-2 py-1.5 text-[#dfe8f2]">—</span>
            <span className="border-r border-[#26333f] px-2 py-1.5 text-[#5d7189]">DATE</span>
            <span className="px-2 py-1.5 text-[#dfe8f2]">2026</span>
          </div>
        </div>
      </section>

      {/* ── Composants ───────────────────────────────────── */}
      <section id="composants" className="px-6 lg:px-12 py-20 border-t border-[#26333f]">
        <div className="max-w-3xl mb-10">
          <p className="font-mono text-[12px] tracking-[2px] text-[#ff6a3d] uppercase mb-4">
            Bibliothèque
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Les composants du technicien, en un glisser-déposer.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#8296ab]">
            Symbolique pneumatique conforme aux conventions industrielles :
            distributeurs en boîtes à 2 positions, vérins en coupe,
            vannes logiques et accessoires de conditionnement.
          </p>
        </div>
        <div className="border border-[#26333f]" style={{ background: "#121a24" }}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {components.map((name, i) => (
              <div
                key={name}
                className={`group flex items-center gap-2.5 px-4 py-3 text-[13px] text-[#dfe8f2] hover:bg-[#ff6a3d]/[0.04] hover:text-[#ff6a3d] transition-colors border-[#26333f] ${i % 4 !== 3 ? "border-r" : ""} ${i < components.length - 4 ? "border-b" : ""}`}
              >
                <span className="font-mono text-[10px] text-[#5d7189] group-hover:text-[#ff6a3d] w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <CircuitBoard className="h-4 w-4 text-[#5d7189] group-hover:text-[#ff6a3d] transition-colors" />
                {name}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-[#26333f] px-4 py-2 font-mono text-[10px] text-[#5d7189]">
            <span>NOMENCLATURE · 13 POSITIONS</span>
            <span className="text-[#ff6a3d]">SYMBOLE ISO 1219-1</span>
          </div>
        </div>
      </section>

      {/* ── Méthode ──────────────────────────────────────── */}
      <section id="methode" className="px-6 lg:px-12 py-20 border-t border-[#26333f]">
        <div className="grid lg:grid-cols-3 gap-8">
          {[
            {
              n: "01",
              icon: AirVent,
              title: "Tracer",
              desc: "Alimentation → distributeur → vérin, en conduites pneumatiques ou signaux de pilotage pointillés, sur une feuille repérée 1–16 / A–J.",
            },
            {
              n: "02",
              icon: Gauge,
              title: "Simuler",
              desc: "Bouton manuel, capteur de fin de course ou pilotage bistable : lancez, faites varier la vitesse (0,5× à 4×) et mettez en pause à volonté.",
            },
            {
              n: "03",
              icon: ClipboardList,
              title: "Consigner",
              desc: "Complétez le cartouche, exportez la feuille en SVG pour vos dossiers et sauvegardez le projet en JSON pour le retrouver tel quel.",
            },
          ].map((step) => (
            <div key={step.n} className="relative border border-[#26333f] p-7 overflow-hidden" style={{ background: "#121a24" }}>
              {/* repères de cote aux coins */}
              <span className="absolute top-2 left-3 font-mono text-[10px] text-[#3a4a5c]">{step.n}</span>
              <span className="absolute top-2 right-3 font-mono text-[10px] text-[#3a4a5c]">RÉV. A</span>
              <span className="absolute bottom-2 left-3 font-mono text-[10px] text-[#3a4a5c]">ÉCH. 1:1</span>
              <span className="absolute bottom-2 right-3 font-mono text-[10px] text-[#3a4a5c]">mm</span>
              <div className="mt-3 mb-6 h-px w-full bg-gradient-to-r from-[#ff6a3d]/70 via-[#26333f] to-[#26333f]" />
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center border border-[#ff6a3d]/50 font-mono text-[12px] font-bold text-[#ff6a3d]">{step.n}</span>
                <h3 className="text-[17px] font-bold">{step.title}</h3>
              </div>
              <p className="mt-4 text-[13.5px] leading-relaxed text-[#8296ab]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="px-6 lg:px-12 py-20 border-t border-[#26333f] text-center">
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
          Simulez votre premier circuit en <span className="text-[#ff6a3d]">30 secondes</span>.
        </h2>
        <p className="mt-4 text-[15px] text-[#8296ab] max-w-xl mx-auto">
          Un compresseur, un distributeur 3/2, un vérin, deux conduites : vous
          avez déjà un automate complet sous les yeux.
        </p>
        <Link
          href="/editeur"
          className="mt-8 inline-flex items-center gap-2 bg-[#ff6a3d] hover:bg-[#ff7d56] text-white px-7 py-3.5 rounded-md text-[15px] font-bold transition-colors active:scale-[0.97]"
        >
          Tester le simulateur <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ── Bannière publicitaire (leaderboard) ─────────────────────
          Intégration Google AdSense :
          1. Remplacer "ca-pub-XXXXXXXXXXXXXXXX" par votre ID AdSense.
          2. Créer le bloc d'annonces dans votre compte AdSense et remplacer
             "ca-pub-XXXXXXXXXXXXXXXX/NNNNNNNN" par l'ID du slot.
      */}
      <div className="mx-auto max-w-5xl px-6 lg:px-12 py-6">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="NNNNNNNN"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      {/* ── Pied de page ─────────────────────────────────── */}
      <footer className="px-6 lg:px-12 py-7 border-t border-[#26333f] flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-[#5d7189]">
        <div className="flex items-center gap-2">
          <img src={LOGO_URL} alt="" className="h-4 w-4" />
          PNEUMASIM — Éditeur &amp; simulateur de circuits pneumatiques
        </div>
        <div>Conventions de schéma ISO 1219 · Feuille 1600 × 1000 · Zones 100 px</div>
      </footer>
    </div>
  );
}
