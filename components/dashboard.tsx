"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { TeamStoreProvider, useTeamStore } from "@/lib/team-store"
import { FormationField } from "@/components/formation-field"
import { CornerPlaysCard } from "@/components/corner-plays-card"
import { BlockPlaysCard } from "@/components/block-plays-card"
import { CitedPlayersCard } from "@/components/cited-players-card"
import { MatchInfoCard } from "@/components/match-info-card"
import { ExportPanel } from "@/components/export-panel"

import { ScoutingNotesCard } from "@/components/scouting-notes-card"
import { VestidorCard } from "@/components/vestidor-card"
import { LogOut, Moon, Sun, Calendar, Users, ChevronRight, ArrowLeft, MapPin, Clock, ChevronDown } from "lucide-react"
import type { Fixture } from "@/lib/team-store"

// ─── Month names ──────────────────────────────────────────────────────────────
const MONTH_NAMES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]

// ─── Home view ─────────────────────────────────────────────────────────────────
function HomeView({ onSelectFixture }: { onSelectFixture: (f: Fixture) => void }) {
  const { fixtures, players, teamLogo, isLoading } = useTeamStore()
  const citedPlayers = players.filter(p => p.isCited)
  const squad = players
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([3])) // Only Apr=3 expanded by default

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (squad.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Users className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No hay jugadoras cargadas</p>
        </div>
      </div>
    )
  }

  const isPast = (d: string) => {
    // 1. Separamos el string de la fecha (asume formato "YYYY-MM-DD")
    const [year, month, day] = d.split('-').map(Number);

    // 2. Creamos la fecha exacta del partido pero al final del día (23:59:59)
    // Nota: month - 1 porque en JavaScript los meses van de 0 a 11
    const endOfMatchDay = new Date(year, month - 1, day, 23, 59, 59);
    
    // 3. Tomamos el momento exacto actual
    const now = new Date();

    // 4. Retorna true (se bloquea) SOLO si ya pasamos la medianoche de la fecha del partido
    return now > endOfMatchDay;
  };

  // Group fixtures by month
  const fixturesByMonth = fixtures.reduce((acc, f) => {
    const month = new Date(f.date + "T12:00:00").getMonth()
    if (!acc[month]) acc[month] = []
    acc[month].push(f)
    return acc
  }, {} as Record<number, Fixture[]>)

  const toggleMonth = (month: number) => {
    setExpandedMonths(prev => {
      const next = new Set(prev)
      if (next.has(month)) next.delete(month)
      else next.add(month)
      return next
    })
  }

  return (
    <div className="space-y-8">
      {/* Hero: Club identity — bento card with glow accent */}
      <div className="relative bento-card p-6 shadow-2xl">
        {/* Subtle ambient glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,102,255,0.18) 0%, transparent 60%)" }} />
        <div className="relative flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-secondary flex items-center justify-center shadow-lg border border-white/10 shrink-0 glow-primary-soft">
            <img src={teamLogo} alt="Banco Hipotecario" className="w-full h-full object-contain p-1.5" />
          </div>
          <div>
            <p className="label-caps text-primary-soft mb-1.5">Panel DT</p>
            <h2 className="font-display text-2xl font-bold text-foreground leading-tight">Club Banco<br />Hipotecario</h2>
            <p className="text-sm text-muted-foreground mt-1">Hockey Femenino — SEGUNDA 2026</p>
          </div>
        </div>
        {/* Stats row */}
        <div className="relative mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Plantel", val: squad.length },
            { label: "Posición Torneo", val: 12 },
            { label: "Puntos", val: 3 },
          ].map(s => (
            <div key={s.label} className="text-center glass rounded-xl py-3 px-3">
              <p className="stat-value text-primary-soft">{s.val}</p>
              <p className="label-caps text-muted-foreground mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6 auto-rows-max">
        {/* Left: Fixture + New cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fixture section by month */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground tracking-tight">Fixture 2026</h3>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full ml-auto">Segunda División</span>
            </div>
            
            {Object.entries(fixturesByMonth).sort(([a], [b]) => Number(a) - Number(b)).map(([monthStr, monthFixtures]) => {
              const month = Number(monthStr)
              const isExpanded = expandedMonths.has(month)
              return (
                <div key={month} className="bento-card overflow-hidden">
                  {/* Month header */}
                  <button
                    onClick={() => toggleMonth(month)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{MONTH_NAMES[month]}</span>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        {monthFixtures.length} {monthFixtures.length === 1 ? "partido" : "partidos"}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  
                  {/* Month fixtures */}
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-2">
                      {monthFixtures.map(f => {
                        const past = isPast(f.date)
                        const isBye = f.isBye
                        return (
                          <div key={f.id} className="relative">
                            <button
                              onClick={() => !past && !isBye && onSelectFixture(f)}
                              disabled={past || isBye}
                              className={`w-full flex items-center gap-2 p-2.5 rounded-xl border transition-all group ${
                                isBye
                                  ? "border-border/10 bg-secondary/5 cursor-default"
                                  : past
                                  ? "border-border/10 bg-secondary/5 opacity-50 cursor-not-allowed"
                                  : "border-border/20 bg-secondary/10 hover:border-primary/40 hover:bg-secondary/20 cursor-pointer"
                              }`}
                            >
                              {/* Date */}
                              <div className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0 ${
                                isBye ? "bg-secondary/30" : past ? "bg-secondary/40" : "bg-primary/10"
                              }`}>
                                <span className={`text-base font-bold leading-none ${isBye || past ? "text-muted-foreground" : "text-primary"}`}>
                                  {new Date(f.date + "T12:00:00").getDate()}
                                </span>
                              </div>
                              
                              {/* Opponent logo */}
                              {f.opponentLogo && !isBye && (
                                <div className="w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center shrink-0 overflow-hidden p-1">
                                  <img src={f.opponentLogo} alt={f.opponent} className="w-full h-full object-contain" />
                                </div>
                              )}
                              
                              {/* Info */}
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase">{f.matchday}</span>
                                  {!isBye && (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                      f.location === "local" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                                    }`}>
                                      {f.location === "local" ? "LOCAL" : "VISIT"}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-xs font-bold ${isBye ? "text-muted-foreground italic" : "text-foreground"}`}>
                                  {isBye ? "Fecha libre" : `vs ${f.opponent}`}
                                </p>
                                {!isBye && (
                                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                    <Clock className="w-2.5 h-2.5" />{f.time}
                                  </span>
                                )}
                              </div>
                              
                              {!past && !isBye && (
                                <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              )}
                            </button>
                            
                            {/* Map link */}
                            {f.mapUrl && !isBye && (
                              <a
                                href={f.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-secondary/60 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all"
                                title="Ver ubicación"
                              >
                                <MapPin className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Scouting notes by month */}
          <ScoutingNotesCard fixtures={fixtures} />
        </div>

        {/* Right: Squad only */}
        <div className="lg:col-span-1 space-y-5">
          {/* Squad */}
          <div className="bento-card p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Plantel</h3>
              <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{squad.length} jugadoras</span>
            </div>
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {squad.map(p => (
                <div key={p.id} className="flex items-center gap-3 py-1.5 px-2 rounded-xl hover:bg-secondary/30 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-primary/10 text-primary shrink-0">
                    {p.dorsalNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{p.lastName}, {p.firstName}</p>
                    {p.position && <p className="text-[10px] text-primary">{p.position}</p>}
                  </div>
                  {p.isInjured && (
                    <div className="w-4 h-4 rounded bg-red-500 flex items-center justify-center shrink-0" title="Lesionada">
                      <span className="text-white text-[8px] font-bold">+</span>
                    </div>
                  )}
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.isInjured ? "bg-red-500" : "bg-green-500"}`} title={p.isInjured ? "Lesionada" : "Disponible"} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Match view ───────────────────────────────────────────────────────────────
function MatchView({ fixture, onBack }: { fixture: Fixture; onBack: () => void }) {
  const { updateMatchInfo } = useTeamStore()
  const [activeTab, setActiveTab] = useState<"formation" | "players" | "corners" | "vestidor" | "bloqueos">("players")

  // Sync fixture to matchInfo
  useState(() => {
    updateMatchInfo({
      date: fixture.date,
      time: fixture.time,
      opponent: fixture.opponent,
      opponentLogo: fixture.opponentLogo,
      location: fixture.location,
      matchday: fixture.matchday,
      tournament: fixture.tournament,
    })
  })

  const tabs = [
    { id: "players"   as const, label: "Jugadoras" },
    { id: "vestidor"  as const, label: "Vestidor" },
    { id: "formation" as const, label: "Formación" },
    { id: "corners"   as const, label: "Corners" },
    { id: "bloqueos"  as const, label: "Bloqueos" },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al inicio</span>
      </button>

      {/* Match header */}
      <MatchInfoCard />

      {/* Tab bar — glass segmented control */}
      <div className="flex glass rounded-xl sm:rounded-2xl p-0.5 sm:p-1 gap-0.5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all font-display tracking-tight ${
              activeTab === t.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Export buttons - fixed at bottom */}
      <div className="fixed bottom-4 right-4 z-40">
        <ExportPanel />
      </div>

      {/* Tab content */}
      {activeTab === "formation" && <FormationField />}
      {activeTab === "players" && <CitedPlayersCard />}
      {activeTab === "corners" && <CornerPlaysCard />}
      {activeTab === "vestidor" && <VestidorCard fixtureId={fixture.id} />}
      {activeTab === "bloqueos" && <BlockPlaysCard />}
    </div>
  )
}

// ─── Dashboard shell ──────────────────────────────────────────────────────────
function DashboardContent() {
  const { logout } = useAuth()
  const { teamLogo, bwMode, setBwMode, selectedFixtureId, setSelectedFixtureId, fixtures } = useTeamStore()
  const selectedFixture = fixtures.find(f => f.id === selectedFixtureId) ?? null

  return (
    <div className={`min-h-screen bg-background transition-colors duration-300 ${bwMode ? "bw-mode" : ""}`}>
      {/* Top nav — glass header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/50">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden bg-secondary/60 border border-white/10 p-0.5 shrink-0">
              <img src={teamLogo} alt="BH" className="w-full h-full object-contain" />
            </div>
            <span className="font-display text-xs sm:text-sm font-bold text-foreground tracking-tight hidden sm:block">Panel DT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setBwMode(!bwMode)}
              className={`p-2 rounded-xl transition-all ${
                bwMode
                  ? "bg-foreground text-background"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
              title={bwMode ? "Modo color" : "Modo B/N"}
            >
              {bwMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Page */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {selectedFixture ? (
          <MatchView
            fixture={selectedFixture}
            onBack={() => setSelectedFixtureId(null)}
          />
        ) : (
          <HomeView onSelectFixture={f => setSelectedFixtureId(f.id)} />
        )}
      </main>
    </div>
  )
}

export function Dashboard() {
  return (
    <TeamStoreProvider>
      <DashboardContent />
    </TeamStoreProvider>
  )
}
