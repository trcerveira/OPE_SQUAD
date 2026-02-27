"use client";

import { useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { questions, SECTIONS, TOTAL_QUESTIONS } from "@/lib/genius/questions";
import { calculateGeniusProfile, type GeniusProfile } from "@/lib/genius/calculate";

// ─────────────────────────────────────────
// COMPONENTE: ESCALA VISUAL (5 pontos)
// ─────────────────────────────────────────
function ScaleInput({
  leftLabel, rightLabel, points, value, onChange,
}: {
  leftLabel: string;
  rightLabel: string;
  points: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-[#8892a4] mb-3 px-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="flex gap-2">
        {points.map((p, i) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            title={p.label}
            className={`flex-1 h-12 rounded-lg border-2 transition-all font-bold text-sm relative group ${
              value === p.value
                ? "border-[#BFD64B] bg-[#BFD64B] text-[#0A0E1A]"
                : "border-[#2a3555] bg-[#111827] text-[#4a5568] hover:border-[#BFD64B]/50 hover:text-[#F0ECE4]"
            }`}
          >
            {i + 1}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1a2035] text-[#F0ECE4] text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-[#2a3555]">
              {p.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// COMPONENTE: SECÇÃO INTRO CARD
// ─────────────────────────────────────────
function SectionIntro({
  section,
  onStart,
}: {
  section: { num: number; label: string; icon: string; color: string; totalQ: number };
  onStart: () => void;
}) {
  const descriptions: Record<number, string> = {
    1: "Vamos perceber o teu ponto de partida — personalidade, área e como tomas decisões.",
    2: "O que te drena, o que te energiza, e como ages naturalmente. Os dados do teu Kolbe.",
    3: "Os teus talentos naturais, padrões de sucesso e o diagnóstico da Armadilha da Excelência.",
    4: "Como preferes criar riqueza — o coração do teu Wealth Dynamics Profile.",
    5: "O teu objectivo concreto e o que te está a travar. Honestidade radical aqui.",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6"
          style={{ backgroundColor: `${section.color}20`, border: `2px solid ${section.color}40` }}
        >
          {section.icon}
        </div>
        <div className="text-xs font-bold tracking-widest mb-2" style={{ color: section.color }}>
          SECÇÃO {section.num} DE 5
        </div>
        <h2 className="text-3xl font-bold text-[#F0ECE4] mb-3">{section.label}</h2>
        <p className="text-[#8892a4] leading-relaxed mb-6">{descriptions[section.num]}</p>
        <div className="bg-[#111827] border border-[#2a3555] rounded-lg px-4 py-2 inline-flex items-center gap-2 text-sm text-[#8892a4] mb-8">
          <span style={{ color: section.color }}>●</span>
          {section.totalQ} perguntas nesta secção
        </div>
        <div>
          <button
            onClick={onStart}
            className="bg-[#BFD64B] text-[#0A0E1A] font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Começar Secção {section.num} →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// COMPONENTE: RESULTADOS — DASHBOARD RICO
// ─────────────────────────────────────────
function GeniusResults({ profile, onRestart, onContinue }: {
  profile: GeniusProfile;
  onRestart: () => void;
  onContinue: () => void;
}) {
  // Ordem garantida para as zonas
  const zoneOrder = ["genialidade", "excelencia", "competencia", "incompetencia"] as const;
  type ZoneKey = typeof zoneOrder[number];

  const zoneColors: Record<ZoneKey, string> = {
    genialidade: "#BFD64B",
    excelencia: "#F59E0B",
    competencia: "#6B7280",
    incompetencia: "#EF4444",
  };
  const zoneEmojis: Record<ZoneKey, string> = {
    genialidade: "🔥", excelencia: "⚠️", competencia: "📉", incompetencia: "🚫",
  };
  const zoneNamesPT: Record<ZoneKey, string> = {
    genialidade: "Genialidade", excelencia: "Excelência", competencia: "Competência", incompetencia: "Incompetência",
  };

  const kolbeModes = [
    { key: "factFinder",  pt: "Investigador",   score: profile.kolbeProfile.factFinder,  color: "#60a5fa" },
    { key: "followThru",  pt: "Seguimento",      score: profile.kolbeProfile.followThru,  color: "#34d399" },
    { key: "quickStart",  pt: "Início Rápido",   score: profile.kolbeProfile.quickStart,  color: "#f59e0b" },
    { key: "implementor", pt: "Implementador",   score: profile.kolbeProfile.implementor, color: "#a78bfa" },
  ] as const;

  const wealthIcons: Record<string, string> = {
    creator: "🎨", mechanic: "⚙️", star: "⭐", supporter: "🤝",
    dealmaker: "🎯", trader: "📊", accumulator: "🏦", lord: "👑",
  };
  const advantageLabels: Record<string, string> = {
    innovation: "Innovation", passion: "Passion", power: "Power",
    prestige: "Prestige", trust: "Trust", mystique: "Mystique", alert: "Alert",
  };

  const kolbePTNames: Record<string, string> = {
    "Fact Finder": "Investigador", "Follow Thru": "Seguimento",
    "Quick Start": "Início Rápido", "Implementor": "Implementador",
  };
  const kolbeDominantLabel = kolbePTNames[profile.kolbeProfile.dominant.split(" — ")[0]] ?? profile.kolbeProfile.dominant.split(" — ")[0];

  const hormoziSubItems = [
    { label: "Resultado Sonhado", score: profile.hormozi.subScores.resultadoSonhado, color: "#f97316" },
    { label: "Probabilidade",     score: profile.hormozi.subScores.probabilidade,     color: "#facc15" },
    { label: "Tempo de Espera",   score: profile.hormozi.subScores.tempoEspera,       color: "#60a5fa" },
    { label: "Esforço",           score: profile.hormozi.subScores.esforco,           color: "#34d399" },
  ];

  const domainLabels: Record<string, string> = {
    execucao: "Execução", influencia: "Influência",
    relacionamento: "Relacionamento", pensamento_estrategico: "Pensamento Estratégico",
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-24">
      {/* ── HERO ── */}
      <div className="px-6 py-10 text-center border-b border-[#1a2035]">
        <div className="inline-flex items-center gap-2 bg-[#BFD64B]/10 border border-[#BFD64B]/30 text-[#BFD64B] text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6">
          🧬 GENIUS PROFILE V2 — COMPLETO
        </div>
        <h1 className="text-4xl font-bold text-[#F0ECE4] mb-3">O teu Genius Profile</h1>
        <p className="text-[#8892a4] max-w-lg mx-auto text-sm leading-relaxed">
          7 frameworks analisados. Usa este mapa para construir o negócio no teu caminho — não contra ele.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── METRIC STRIP ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#111827] border border-[#2a3555] rounded-xl p-3 text-center">
            <div className="text-xl mb-1">{zoneEmojis[profile.hendricksZone as ZoneKey]}</div>
            <div className="text-xs text-[#8892a4] mb-1">ZONA ACTUAL</div>
            <div className="text-sm font-bold" style={{ color: zoneColors[profile.hendricksZone as ZoneKey] }}>
              {zoneNamesPT[profile.hendricksZone as ZoneKey]}
            </div>
          </div>
          <div className="bg-[#111827] border border-[#2a3555] rounded-xl p-3 text-center">
            <div className="text-xl mb-1">{wealthIcons[profile.wealthProfile]}</div>
            <div className="text-xs text-[#8892a4] mb-1">WEALTH PROFILE</div>
            <div className="text-sm font-bold text-purple-400">
              {profile.wealthProfile.charAt(0).toUpperCase() + profile.wealthProfile.slice(1)}
            </div>
          </div>
          <div className="bg-[#111827] border border-[#2a3555] rounded-xl p-3 text-center">
            <div className="text-xl mb-1">⚡</div>
            <div className="text-xs text-[#8892a4] mb-1">KOLBE</div>
            <div className="text-sm font-bold text-blue-400">{kolbeDominantLabel}</div>
          </div>
          <div className="bg-[#111827] border border-[#2a3555] rounded-xl p-3 text-center">
            <div className="text-xl mb-1">✨</div>
            <div className="text-xs text-[#8892a4] mb-1">FASCINATION</div>
            <div className="text-sm font-bold text-yellow-400">{advantageLabels[profile.fascinationAdvantage]}</div>
          </div>
        </div>

        {/* ── 1. GAY HENDRICKS — ZONAS ── */}
        <div className="bg-[#111827] border border-[#BFD64B]/20 rounded-2xl p-6">
          <div className="text-xs font-bold tracking-widest text-[#BFD64B] mb-1">GAY HENDRICKS</div>
          <div className="text-lg font-bold text-[#F0ECE4] mb-4">Distribuição por Zonas de Operação</div>
          <div className="space-y-3 mb-5">
            {zoneOrder.map((zone) => {
              const pct = profile.zoneDistribution[zone];
              return (
                <div key={zone}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: zoneColors[zone] }}>
                      {zoneEmojis[zone]} {zoneNamesPT[zone]}
                    </span>
                    <span className="text-sm font-bold" style={{ color: zoneColors[zone] }}>{pct}%</span>
                  </div>
                  <div className="w-full bg-[#1a2035] rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: zoneColors[zone] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[#8892a4] text-sm leading-relaxed mb-4">{profile.hendricksInsight}</p>
          {profile.ulpType !== "nenhum" && profile.ulpDescription && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="text-amber-400 text-xs font-bold tracking-widest mb-1">⚠️ UPPER LIMIT PROBLEM DETECTADO</div>
              <p className="text-[#8892a4] text-xs leading-relaxed">{profile.ulpDescription}</p>
            </div>
          )}
        </div>

        {/* ── 2. DAN SULLIVAN — UNIQUE ABILITY ── */}
        <div className="bg-[#111827] border border-[#BFD64B]/30 rounded-2xl p-6">
          <div className="text-xs font-bold tracking-widest text-[#BFD64B] mb-1">DAN SULLIVAN</div>
          <div className="text-lg font-bold text-[#F0ECE4] mb-4">Unique Ability Statement</div>
          <blockquote className="text-lg font-bold text-[#F0ECE4] leading-relaxed mb-4 italic border-l-4 border-[#BFD64B] pl-4">
            &ldquo;{profile.uniqueAbilityStatement}&rdquo;
          </blockquote>
          <p className="text-[#8892a4] text-sm mb-5">{profile.uniqueAbilityCore}</p>
          {/* 3 métricas Sullivan */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0d1420] rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#BFD64B] mb-1">{profile.sullivanAlignment}%</div>
              <div className="text-xs text-[#8892a4]">Alinhamento</div>
            </div>
            <div className="bg-[#0d1420] rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">{profile.sullivanZoneTime}%</div>
              <div className="text-xs text-[#8892a4]">Tempo na Zona</div>
            </div>
            <div className="bg-[#0d1420] rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-1">{profile.sullivanPotential}%</div>
              <div className="text-xs text-[#8892a4]">Potencial</div>
            </div>
          </div>
        </div>

        {/* ── 3. HAMILTON + HOGSHEAD ── */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-[#111827] border border-purple-500/30 rounded-2xl p-5">
            <div className="text-xs font-bold tracking-widest text-purple-400 mb-1">ROGER HAMILTON</div>
            <div className="text-sm font-bold text-[#F0ECE4] mb-1">Wealth Dynamics</div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{wealthIcons[profile.wealthProfile]}</span>
              <div>
                <div className="text-xl font-bold text-[#F0ECE4]">
                  {profile.wealthProfile.charAt(0).toUpperCase() + profile.wealthProfile.slice(1)}
                </div>
                <div className="text-xs text-purple-400">{profile.wealthSpectrumLevel}</div>
              </div>
            </div>
            <p className="text-[#8892a4] text-xs leading-relaxed">{profile.wealthPathOfLeastResistance}</p>
          </div>
          <div className="bg-[#111827] border border-yellow-500/30 rounded-2xl p-5">
            <div className="text-xs font-bold tracking-widest text-yellow-400 mb-1">SALLY HOGSHEAD</div>
            <div className="text-sm font-bold text-[#F0ECE4] mb-3">Fascination Advantage</div>
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full mb-2">
              {advantageLabels[profile.fascinationAdvantage]}
            </div>
            <div className="text-[#F0ECE4] font-bold mb-2">{profile.fascinationArchetype}</div>
            <p className="text-[#8892a4] text-xs leading-relaxed">{profile.fascinationBrandAngle}</p>
          </div>
        </div>

        {/* ── 4. KATHY KOLBE ── */}
        <div className="bg-[#111827] border border-blue-500/20 rounded-2xl p-6">
          <div className="text-xs font-bold tracking-widest text-blue-400 mb-1">KATHY KOLBE</div>
          <div className="text-lg font-bold text-[#F0ECE4] mb-5">Kolbe Action Profile</div>
          {/* Chips numéricos */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {kolbeModes.map((m) => (
              <div
                key={m.key}
                className="text-center rounded-xl p-3 border"
                style={{ backgroundColor: `${m.color}10`, borderColor: `${m.color}30` }}
              >
                <div className="text-3xl font-bold mb-1" style={{ color: m.color }}>{m.score}</div>
                <div className="text-xs text-[#8892a4] leading-tight">{m.pt}</div>
              </div>
            ))}
          </div>
          {/* Barras */}
          <div className="space-y-3">
            {kolbeModes.map((m) => (
              <div key={m.key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[#F0ECE4]">{m.pt}</span>
                  <span className="text-xs font-bold" style={{ color: m.color }}>{m.score}/10</span>
                </div>
                <div className="w-full bg-[#1a2035] rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${m.score * 10}%`, backgroundColor: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            <p className="text-[#8892a4] text-xs leading-relaxed">
              {profile.kolbeProfile.dominant.split(" — ")[1] ?? profile.kolbeProfile.dominant}
            </p>
          </div>
        </div>

        {/* ── 5. DON CLIFTON — CLIFTONSTRENGTHS ── */}
        <div className="bg-[#111827] border border-emerald-500/20 rounded-2xl p-6">
          <div className="text-xs font-bold tracking-widest text-emerald-400 mb-1">DON CLIFTON</div>
          <div className="text-lg font-bold text-[#F0ECE4] mb-1">CliftonStrengths — Top 5</div>
          <div className="text-sm text-emerald-400 mb-4">Domínio: {domainLabels[profile.cliftonDomain]}</div>
          <p className="text-[#8892a4] text-sm leading-relaxed mb-5">{profile.cliftonInsight}</p>
          <div className="space-y-3">
            {profile.cliftonTop5WithScores.map(({ theme, score }, i) => (
              <div key={theme}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#4a5568] w-4">#{i + 1}</span>
                    <span className="text-sm font-medium text-[#F0ECE4]">{theme}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{score}</span>
                </div>
                <div className="w-full bg-[#1a2035] rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${score * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[#4a5568] text-xs mt-4">
            * Scores estimados com base nas respostas. Para exactidão total, faz o CliftonStrengths oficial.
          </p>
        </div>

        {/* ── 6. ALEX HORMOZI — VALUE EQUATION ── */}
        <div className="bg-[#111827] border border-orange-500/20 rounded-2xl p-6">
          <div className="text-xs font-bold tracking-widest text-orange-400 mb-1">ALEX HORMOZI</div>
          <div className="text-lg font-bold text-[#F0ECE4] mb-2">Value Equation</div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-orange-400">{profile.hormozi.valueScore}</span>
            </div>
            <div>
              <div className="text-[#F0ECE4] font-bold">Score de Monetização: {profile.hormozi.valueScore}/10</div>
              <div className="text-[#8892a4] text-xs mt-0.5">
                {profile.hormozi.valueScore >= 8 ? "Excelente — oferta clara e ambiciosa"
                  : profile.hormozi.valueScore >= 6 ? "Bom — afinar o posicionamento"
                  : "A trabalhar — clareza de oferta necessária"}
              </div>
            </div>
          </div>
          {/* 4 sub-scores */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {hormoziSubItems.map(({ label, score, color }) => (
              <div key={label} className="bg-[#0d1420] rounded-xl p-4 text-center">
                <div className="text-2xl font-bold mb-1" style={{ color }}>{score}/10</div>
                <div className="text-xs text-[#8892a4] mb-2">{label}</div>
                <div className="w-full bg-[#1a2035] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${score * 10}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-bold text-orange-400 mb-1 tracking-widest">GRAND SLAM OFFER HINT</div>
              <p className="text-[#8892a4] text-sm leading-relaxed">{profile.hormozi.grandSlamOfferHint}</p>
            </div>
            <div>
              <div className="text-xs font-bold text-orange-400 mb-1 tracking-widest">MAIOR BLOQUEIO DETECTADO</div>
              <p className="text-[#8892a4] text-sm italic">&ldquo;{profile.hormozi.biggestBlocker}&rdquo;</p>
            </div>
          </div>
        </div>

        {/* ── 7. MAPA DE CONVERGÊNCIA ── */}
        <div className="bg-[#BFD64B]/5 border border-[#BFD64B]/20 rounded-2xl p-6">
          <div className="text-xs font-bold tracking-widest text-[#BFD64B] mb-1">MAPA DE CONVERGÊNCIA</div>
          <div className="text-lg font-bold text-[#F0ECE4] mb-4">Onde os frameworks alinham</div>
          <div className="space-y-2 mb-4">
            {profile.convergences.map((c, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-[#BFD64B] flex-shrink-0 mt-0.5">✓</span>
                <span className="text-[#8892a4] text-sm leading-relaxed">{c}</span>
              </div>
            ))}
          </div>
          {profile.contradictions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#2a3555]">
              <div className="text-xs font-bold text-amber-400 tracking-widest mb-2">⚡ TENSÕES A EXPLORAR</div>
              {profile.contradictions.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-amber-400 flex-shrink-0">→</span>
                  <span className="text-[#8892a4] text-xs leading-relaxed">{c}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 8. DISTRIBUIÇÃO DO TEMPO POR ZONA ── */}
        <div className="bg-[#111827] border border-[#2a3555] rounded-2xl p-6">
          <div className="text-xs font-bold tracking-widest text-[#BFD64B] mb-1">DISTRIBUIÇÃO DO TEMPO POR ZONA</div>
          <div className="text-lg font-bold text-[#F0ECE4] mb-4">Actual vs Target</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a3555]">
                  <th className="text-left py-2 text-[#8892a4] font-medium text-xs">ZONA</th>
                  <th className="text-center py-2 text-[#8892a4] font-medium text-xs">ACTUAL</th>
                  <th className="text-center py-2 text-[#8892a4] font-medium text-xs">TARGET</th>
                  <th className="text-center py-2 text-[#8892a4] font-medium text-xs">DELTA</th>
                </tr>
              </thead>
              <tbody>
                {zoneOrder.map((zone) => {
                  const current = profile.zoneDistribution[zone];
                  const target  = profile.zoneTarget[zone];
                  const delta   = target - current;
                  return (
                    <tr key={zone} className="border-b border-[#1a2035]">
                      <td className="py-2.5 font-medium text-xs" style={{ color: zoneColors[zone] }}>
                        {zoneEmojis[zone]} {zoneNamesPT[zone]}
                      </td>
                      <td className="text-center py-2.5 text-[#F0ECE4] font-bold">{current}%</td>
                      <td className="text-center py-2.5 text-[#BFD64B] font-bold">{target}%</td>
                      <td className={`text-center py-2.5 font-bold text-xs ${
                        delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-[#4a5568]"
                      }`}>
                        {delta > 0 ? `+${delta}%` : `${delta}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 9. RECOMENDAÇÃO PRINCIPAL ── */}
        <div className="bg-[#111827] border border-[#2a3555] rounded-2xl p-6">
          <div className="text-xs font-bold tracking-widest text-[#BFD64B] mb-1">RECOMENDAÇÃO PRINCIPAL</div>
          <div className="text-lg font-bold text-[#F0ECE4] mb-4">O teu próximo passo</div>
          <p className="text-[#8892a4] text-sm leading-relaxed">{profile.mainRecommendation}</p>
        </div>

        {/* ── 10. PLANO DE AÇÃO ── */}
        <div className="bg-[#111827] border border-[#2a3555] rounded-2xl p-6">
          <div className="text-xs font-bold tracking-widest text-[#BFD64B] mb-1">PLANO DE AÇÃO — CHECKLIST</div>
          <div className="text-lg font-bold text-[#F0ECE4] mb-5">Próximos 30 dias</div>
          <div className="grid sm:grid-cols-3 gap-5">
            {/* Esta semana */}
            <div>
              <div className="text-xs font-bold text-blue-400 mb-3 tracking-widest">📅 ESTA SEMANA</div>
              <div className="space-y-2">
                {profile.plan30.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[#8892a4] flex-shrink-0 mt-0.5">☐</span>
                    <span className="text-[#8892a4] text-xs leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Próximas 2 semanas */}
            <div>
              <div className="text-xs font-bold text-purple-400 mb-3 tracking-widest">📅 PRÓXIMAS 2 SEM.</div>
              <div className="space-y-2">
                {profile.plan60.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[#8892a4] flex-shrink-0 mt-0.5">☐</span>
                    <span className="text-[#8892a4] text-xs leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Próximo mês */}
            <div>
              <div className="text-xs font-bold text-[#BFD64B] mb-3 tracking-widest">📅 PRÓXIMO MÊS</div>
              <div className="space-y-2">
                {profile.plan90.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[#BFD64B] flex-shrink-0 mt-0.5">☐</span>
                    <span className="text-[#8892a4] text-xs leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* O que NÃO fazer */}
          <div className="mt-6 bg-red-500/5 border border-red-500/20 rounded-xl p-5">
            <div className="text-xs font-bold text-red-400 tracking-widest mb-3">🚫 O QUE NÃO FAZER</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {profile.planDoNot.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-red-400 flex-shrink-0 mt-0.5 text-xs">✕</span>
                  <span className="text-[#8892a4] text-xs leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 11. SQUAD RECOMENDADO ── */}
        <div className="bg-[#BFD64B]/5 border border-[#BFD64B]/20 rounded-2xl p-6">
          <div className="text-xs font-bold tracking-widest text-[#BFD64B] mb-1">🎯 SQUAD RECOMENDADO</div>
          <div className="text-xl font-bold text-[#F0ECE4] mb-2">{profile.squadRecommendation}</div>
          <p className="text-[#8892a4] text-sm leading-relaxed mb-5">{profile.squadRationale}</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="bg-[#0d1420] rounded-xl p-4">
              <div className="text-xs font-bold text-[#BFD64B] mb-1 tracking-widest">DOMÍNIO</div>
              <div className="text-[#F0ECE4] text-sm font-bold">{profile.squadDomain}</div>
            </div>
            <div className="bg-[#0d1420] rounded-xl p-4">
              <div className="text-xs font-bold text-[#BFD64B] mb-1 tracking-widest">PROPÓSITO</div>
              <div className="text-[#8892a4] text-xs leading-relaxed">{profile.squadPurpose}</div>
            </div>
            <div className="bg-[#0d1420] rounded-xl p-4">
              <div className="text-xs font-bold text-[#BFD64B] mb-1 tracking-widest">UTILIZADOR-ALVO</div>
              <div className="text-[#8892a4] text-xs leading-relaxed">{profile.squadTargetUser}</div>
            </div>
          </div>
        </div>

        {/* ── CTAs ── */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onContinue}
            className="flex-1 bg-[#BFD64B] text-[#0A0E1A] font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Gerar Conteúdo com este Perfil →
          </button>
        </div>
        <p className="text-center text-[#4a5568] text-xs pb-4">
          <button onClick={onRestart} className="hover:text-[#8892a4] underline transition-colors">
            Refazer assessment
          </button>
        </p>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────
export default function GeniusAssessment() {
  const { user } = useUser();
  const router = useRouter();

  type Phase = "intro" | "section-intro" | "assessment" | "calculating" | "results";

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentSection, setCurrentSection] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>("");
  const [profile, setProfile] = useState<GeniusProfile | null>(null);
  const [calcStep, setCalcStep] = useState(0);

  const sectionQuestions = questions.filter((q) => q.section === currentSection);
  const currentQ = sectionQuestions[currentQuestionIndex];
  const currentSectionInfo = SECTIONS[currentSection - 1];

  const totalDone = Object.keys(answers).length;
  const globalProgress = Math.round((totalDone / TOTAL_QUESTIONS) * 100);

  const canAdvance = useCallback(() => {
    if (!currentQ) return false;
    if (currentQ.type === "multi") {
      return Array.isArray(currentAnswer) && (currentAnswer as string[]).length > 0;
    }
    if (typeof currentAnswer === "string") return currentAnswer.trim().length > 0;
    return false;
  }, [currentQ, currentAnswer]);

  function handleOptionSelect(value: string) {
    if (currentQ.type === "multi") {
      const maxSel = currentQ.maxSelect ?? 3;
      const arr = Array.isArray(currentAnswer) ? [...(currentAnswer as string[])] : [];
      if (arr.includes(value)) {
        setCurrentAnswer(arr.filter((v) => v !== value));
      } else if (arr.length < maxSel) {
        setCurrentAnswer([...arr, value]);
      }
    } else {
      setCurrentAnswer(value);
    }
  }

  function handleNext() {
    if (!canAdvance()) return;

    const newAnswers = { ...answers, [currentQ.id]: currentAnswer };
    setAnswers(newAnswers);
    setCurrentAnswer("");

    const isLastQInSection = currentQuestionIndex >= sectionQuestions.length - 1;
    const isLastSection = currentSection >= 5;

    if (isLastQInSection && isLastSection) {
      runCalculation(newAnswers);
    } else if (isLastQInSection) {
      setCurrentSection((s) => s + 1);
      setCurrentQuestionIndex(0);
      setPhase("section-intro");
    } else {
      setCurrentQuestionIndex((i) => i + 1);
    }
  }

  function handleBack() {
    setCurrentAnswer(answers[currentQ.id] ?? "");
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    } else if (currentSection > 1) {
      const prevSection = currentSection - 1;
      const prevSectionQs = questions.filter((q) => q.section === prevSection);
      setCurrentSection(prevSection);
      setCurrentQuestionIndex(prevSectionQs.length - 1);
    }
  }

  const calcSteps = [
    { label: "A analisar as tuas Zonas de Genialidade (Gay Hendricks)...", icon: "🔥" },
    { label: "A mapear o teu Perfil de Riqueza (Roger Hamilton)...", icon: "💰" },
    { label: "A identificar os teus Talentos (Don Clifton)...", icon: "💎" },
    { label: "A definir a tua Unique Ability (Dan Sullivan)...", icon: "🎯" },
    { label: "A calcular o teu Kolbe Action Profile (Kathy Kolbe)...", icon: "⚡" },
    { label: "A descobrir a tua Fascination Advantage (Sally Hogshead)...", icon: "✨" },
    { label: "A calcular o teu Value Equation Score (Alex Hormozi)...", icon: "📊" },
    { label: "A cruzar os 7 frameworks e gerar o teu Blueprint...", icon: "🧬" },
  ];

  function runCalculation(finalAnswers: Record<string, string | string[]>) {
    setPhase("calculating");
    setCalcStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCalcStep(step);
      if (step >= calcSteps.length) {
        clearInterval(interval);
        const calculated = calculateGeniusProfile(finalAnswers);
        setProfile(calculated);

        if (user) {
          user.update({
            unsafeMetadata: {
              ...user.unsafeMetadata,
              geniusProfile: calculated,
              geniusComplete: true,
            },
          }).catch(console.error);
        }

        setTimeout(() => setPhase("results"), 800);
      }
    }, 600);
  }

  // ─── RENDER: INTRO ───
  if (phase === "intro") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6">
              🧬 GENIUS ZONE ASSESSMENT V2
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#F0ECE4] mb-4 leading-tight">
              Descobre onde está<br />
              <span className="text-[#BFD64B]">o teu tecto real.</span>
            </h1>
            <p className="text-[#8892a4] text-lg leading-relaxed">
              {TOTAL_QUESTIONS} perguntas. 5 secções. 7 frameworks de elite analisados simultaneamente.
              Um mapa completo de quem és e como criar riqueza no teu caminho natural.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { icon: "🔥", name: "Gay Hendricks", desc: "4 Zonas de Operação" },
              { icon: "💰", name: "Wealth Dynamics", desc: "8 Perfis de Riqueza" },
              { icon: "⚡", name: "Kolbe Index", desc: "4 Action Modes" },
              { icon: "💎", name: "CliftonStrengths", desc: "4 Domínios + Top 5" },
              { icon: "🎯", name: "Dan Sullivan", desc: "Unique Ability" },
              { icon: "✨", name: "Sally Hogshead", desc: "7 Vantagens" },
              { icon: "📊", name: "Alex Hormozi", desc: "Value Equation" },
              { icon: "🗓️", name: "Plano de Ação", desc: "Checklist + Do Not" },
            ].map((f) => (
              <div key={f.name} className="bg-[#111827] border border-[#2a3555] rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{f.icon}</div>
                <div className="font-bold text-[#F0ECE4] text-xs">{f.name}</div>
                <div className="text-[#8892a4] text-xs mt-0.5">{f.desc}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#111827] border border-[#2a3555] rounded-xl p-5 mb-8">
            <h3 className="font-bold text-[#F0ECE4] text-sm mb-2">⚡ Regras de ouro</h3>
            <ul className="space-y-1.5">
              {[
                "Responde rápido — a primeira reacção é a mais honesta",
                "Responde como ÉS, não como gostarias de ser",
                "Pensa em padrões de longo prazo, não num dia isolado",
                "Não existe resposta certa ou errada — cada perfil tem o seu caminho",
              ].map((rule) => (
                <li key={rule} className="flex gap-2 text-sm text-[#8892a4]">
                  <span className="text-[#BFD64B] flex-shrink-0">→</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={() => setPhase("section-intro")}
              className="bg-[#BFD64B] text-[#0A0E1A] font-bold px-10 py-4 rounded-lg hover:opacity-90 transition-opacity text-lg"
            >
              Começar o Assessment →
            </button>
            <p className="text-[#4a5568] text-xs mt-4">~15 minutos · Guardado automaticamente</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: SECTION INTRO ───
  if (phase === "section-intro" && currentSectionInfo) {
    return (
      <SectionIntro
        section={currentSectionInfo}
        onStart={() => setPhase("assessment")}
      />
    );
  }

  // ─── RENDER: CALCULATING ───
  if (phase === "calculating") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 border-4 border-[#BFD64B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#F0ECE4]">A gerar o teu Genius Profile...</h2>
          </div>
          <div className="space-y-3">
            {calcSteps.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 ${
                  i < calcStep
                    ? "bg-[#BFD64B]/5 border-[#BFD64B]/20 text-[#BFD64B]"
                    : i === calcStep
                    ? "bg-[#111827] border-[#2a3555] text-[#F0ECE4]"
                    : "bg-transparent border-transparent text-[#2a3555]"
                }`}
              >
                <span className="text-lg flex-shrink-0">{step.icon}</span>
                <span className="text-sm">{step.label}</span>
                {i < calcStep && <span className="ml-auto text-[#BFD64B] text-sm">✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: RESULTS ───
  if (phase === "results" && profile) {
    return (
      <GeniusResults
        profile={profile}
        onRestart={() => {
          setPhase("intro");
          setCurrentSection(1);
          setCurrentQuestionIndex(0);
          setAnswers({});
          setCurrentAnswer("");
          setProfile(null);
        }}
        onContinue={() => router.push("/manifesto")}
      />
    );
  }

  // ─── RENDER: ASSESSMENT (perguntas) ───
  if (!currentQ) return null;

  const sectionColor = currentSectionInfo?.color ?? "#BFD64B";
  const progressInSection = Math.round(((currentQuestionIndex + 1) / sectionQuestions.length) * 100);
  const isMultiSelected = (val: string) =>
    Array.isArray(currentAnswer) && (currentAnswer as string[]).includes(val);
  const multiCount = Array.isArray(currentAnswer) ? (currentAnswer as string[]).length : 0;

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Progresso global */}
      <div className="max-w-2xl mx-auto w-full mb-6">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentSectionInfo?.icon}</span>
            <span className="text-xs font-bold tracking-widest" style={{ color: sectionColor }}>
              {currentSectionInfo?.label?.toUpperCase()} — Secção {currentQ.sectionNum}
            </span>
          </div>
          <span className="text-[#8892a4] text-xs">{globalProgress}% total</span>
        </div>
        <div className="flex gap-1 mb-2">
          {SECTIONS.map((s) => (
            <div
              key={s.num}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  s.num < currentSection ? s.color
                  : s.num === currentSection ? sectionColor
                  : "#1a2035",
                opacity: s.num === currentSection ? 1 : s.num < currentSection ? 0.7 : 0.3,
              }}
            />
          ))}
        </div>
        <div className="w-full bg-[#1a2035] rounded-full h-1">
          <div
            className="h-1 rounded-full transition-all duration-500"
            style={{ width: `${progressInSection}%`, backgroundColor: sectionColor }}
          />
        </div>
      </div>

      {/* Pergunta */}
      <div className="max-w-2xl mx-auto w-full flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F0ECE4] mb-2 leading-tight">
          {currentQ.question}
        </h1>
        {currentQ.hint && (
          <p className="text-[#8892a4] text-sm mb-6">{currentQ.hint}</p>
        )}

        {currentQ.type === "multi" && (
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#8892a4] text-xs">Escolhe até {currentQ.maxSelect}</span>
            <span className="text-xs font-bold" style={{ color: multiCount > 0 ? sectionColor : "#4a5568" }}>
              {multiCount}/{currentQ.maxSelect} seleccionados
            </span>
          </div>
        )}

        {currentQ.type === "text" && (
          <input
            type="text"
            value={currentAnswer as string}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canAdvance() && handleNext()}
            placeholder={currentQ.placeholder}
            autoFocus
            className="w-full bg-[#111827] border border-[#2a3555] rounded-xl px-5 py-4 text-[#F0ECE4] placeholder-[#4a5568] text-lg focus:outline-none focus:border-[#BFD64B] transition-colors"
          />
        )}

        {currentQ.type === "textarea" && (
          <textarea
            value={currentAnswer as string}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQ.placeholder}
            autoFocus
            rows={4}
            className="w-full bg-[#111827] border border-[#2a3555] rounded-xl px-5 py-4 text-[#F0ECE4] placeholder-[#4a5568] text-base focus:outline-none focus:border-[#BFD64B] transition-colors resize-none"
          />
        )}

        {currentQ.type === "scale" && currentQ.scalePoints && (
          <ScaleInput
            leftLabel={currentQ.scaleLeft ?? ""}
            rightLabel={currentQ.scaleRight ?? ""}
            points={currentQ.scalePoints}
            value={currentAnswer as string}
            onChange={setCurrentAnswer}
          />
        )}

        {(currentQ.type === "single" || currentQ.type === "multi") && currentQ.options && (
          <div className="grid gap-2 mt-4">
            {currentQ.options.map((opt) => {
              const isSelected =
                currentQ.type === "multi" ? isMultiSelected(opt.value) : currentAnswer === opt.value;
              const isDisabled =
                currentQ.type === "multi" && !isSelected && multiCount >= (currentQ.maxSelect ?? 3);

              return (
                <button
                  key={opt.value}
                  onClick={() => handleOptionSelect(opt.value)}
                  disabled={isDisabled}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "border-[#BFD64B] bg-[#BFD64B]/10"
                      : isDisabled
                      ? "border-[#1a2035] bg-[#0d1420] opacity-40 cursor-not-allowed"
                      : "border-[#2a3555] bg-[#111827] hover:border-[#BFD64B]/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-4 h-4 rounded-${currentQ.type === "multi" ? "sm" : "full"} border-2 flex-shrink-0 mt-0.5 transition-all ${
                        isSelected ? "border-[#BFD64B] bg-[#BFD64B]" : "border-[#4a5568]"
                      }`}
                    />
                    {opt.icon && <span className="text-lg flex-shrink-0">{opt.icon}</span>}
                    <div>
                      <div className="font-bold text-[#F0ECE4] text-sm">{opt.label}</div>
                      {opt.desc && (
                        <div className="text-[#8892a4] text-xs mt-0.5 leading-relaxed">{opt.desc}</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleNext}
            disabled={!canAdvance()}
            className="bg-[#BFD64B] text-[#0A0E1A] font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {currentQuestionIndex === sectionQuestions.length - 1 && currentSection === 5
              ? "Ver o meu Genius Profile →"
              : "Continuar →"}
          </button>

          {(currentQuestionIndex > 0 || currentSection > 1) && (
            <button
              onClick={handleBack}
              className="text-[#8892a4] text-sm hover:text-[#F0ECE4] transition-colors"
            >
              ← Voltar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
