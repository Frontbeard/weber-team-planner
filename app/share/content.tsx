"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Users, Shirt, Target, LayoutGrid, Clock } from "lucide-react"

interface PlayerPosition {
  playerId: string
  x: number
  y: number
}

interface FormationBoard {
  id: string
  name: string
  positions: PlayerPosition[]
}

interface CornerToken {
  id: string
  x: number
  y: number
  label: string
  type: "attacker" | "defender" | "ball" | "opponent"
}

interface CornerPlay {
  id: string
  name: string
  description: string
  tokens: CornerToken[]
  drawings: DrawingPath[]
  shapes: DrawingShape[]
}

interface DefensiveCornerPlay {
  id: string
  name: string
  description: string
  tokens: CornerToken[]
  drawings: DrawingPath[]
  shapes: DrawingShape[]
}

interface DrawingPath {
  id: string
  points: { x: number; y: number }[]
  color: string
  strokeWidth?: number
}

type ShapeType = "rectangle" | "circle" | "triangle" | "line" | "arrow" | "banana" | "ball"

interface DrawingShape {
  id: string
  type: ShapeType
  x: number
  y: number
  width: number
  height: number
  color: string
  opacity: number
  rotation?: number
}

interface BlockPlay {
  id: string
  name: string
  description: string
  tokens: CornerToken[]
  drawings: DrawingPath[]
  shapes?: DrawingShape[]
}

interface Uniform {
  camiseta: string
  medias: string
}

interface Player {
  id: string
  firstName: string
  lastName: string
  dorsalNumber: number
  position?: string
}

interface SharedData {
  m?: { d: string; t: string; o: string; l: string; md: string; to: string; r?: string }
  p?: any[]
  fb?: any[]
  cp?: any[]
  dcp?: any[]
  bp?: any[]
  u?: Uniform
  ol?: string
}

interface ExpandedData {
  matchInfo: {
    date: string
    time: string
    opponent: string
    location: "local" | "visitante"
    matchday: string
    tournament: string
  }
  players: Player[]
  formationBoards: FormationBoard[]
  cornerPlays: CornerPlay[]
  defensiveCornerPlays: DefensiveCornerPlay[]
  blockPlays: BlockPlay[]
  uniform?: Uniform
  opponentLogo?: string
}

// Hockey Field with real image background (vertical)
function HockeyFieldSVG({ positions, players }: { positions: PlayerPosition[]; players: Player[] }) {
  // Filtrar solo las posiciones que tienen jugador asignado
  const validPositions = (positions || []).filter(pos => pos && pos.playerId)
  
  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-lg">
      <img src="/canchadeagua.png" alt="Hockey field" className="w-full h-auto" />
      {validPositions.map((pos, index) => {
        // Buscar por id o por playerId (el export puede tener diferentes estructuras)
        const player = players.find(p => p.id === pos.playerId)
        if (!player) {
          return null // No mostrar si no encuentra el jugador
        }
        const isGK = player.position === "GK"
        const name = player.firstName || player.lastName
        
        return (
          <div
            key={pos.playerId || `pos-${index}`}
            className="absolute flex flex-col items-center"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white/70 ${isGK ? 'bg-orange-500' : 'bg-blue-500'}`}>
              {player.dorsalNumber}
            </div>
            <span className="text-white text-[11px] font-bold mt-1 whitespace-nowrap" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
              {name.toUpperCase()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Offensive Corner with real image background
function CornerFieldSVG({ tokens, drawings, shapes }: { tokens: CornerToken[]; drawings?: DrawingPath[]; shapes?: DrawingShape[] }) {
  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-lg">
      <img src="/cornercorto.png" alt="Corner area" className="w-full h-auto" />
      {/* Shapes */}
      {(shapes || []).map(shape => (
        <div
          key={shape.id}
          className="absolute"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.width}%`,
            height: `${shape.height}%`,
            opacity: shape.opacity,
            transform: `rotate(${shape.rotation || 0}deg)`,
          }}
        >
          {shape.type === "rectangle" && <div className="w-full h-full rounded-sm" style={{ backgroundColor: shape.color }} />}
          {shape.type === "circle" && <div className="w-full h-full rounded-full" style={{ backgroundColor: shape.color }} />}
          {shape.type === "triangle" && <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,0 100,100 0,100" fill={shape.color} /></svg>}
          {shape.type === "line" && <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none"><line x1="0" y1="50" x2="100" y2="50" stroke={shape.color} strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" /></svg>}
          {shape.type === "arrow" && <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none"><defs><marker id={`arr-cp-${shape.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill={shape.color} /></marker></defs><line x1="0" y1="50" x2="90" y2="50" stroke={shape.color} strokeWidth="3" markerEnd={`url(#arr-cp-${shape.id})`} vectorEffect="non-scaling-stroke" /></svg>}
          {shape.type === "ball" && <div className="w-full h-full rounded-full bg-white border-2 border-gray-400 shadow-md" />}
        </div>
      ))}
      {/* Drawings */}
      {(drawings || []).map(drawing => (
        <svg key={drawing.id} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={drawing.points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke={drawing.color} strokeWidth={drawing.strokeWidth || 3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      ))}
      {/* Tokens */}
      {tokens.map(t => {
        const isBall = t.type === "ball"
        const isOpponent = t.type === "opponent"
        return (
          <div
            key={t.id}
            className="absolute flex flex-col items-center"
            style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`${isBall ? 'w-5 h-5' : 'w-8 h-8'} rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white/70 ${isBall ? 'bg-orange-500' : isOpponent ? 'bg-black' : 'bg-blue-500'}`}>
              {!isBall && t.label}
            </div>
            {!isBall && !isOpponent && (
              <span className="text-white text-[10px] font-bold mt-1 whitespace-nowrap" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                {t.label.toUpperCase()}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Defensive Corner with real image background
function DefensiveCornerFieldSVG({ tokens, drawings, shapes }: { tokens: CornerToken[]; drawings?: DrawingPath[]; shapes?: DrawingShape[] }) {
  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-lg">
      <img src="/cornercortodef.png" alt="Defensive corner area" className="w-full h-auto" />
      {/* Shapes */}
      {(shapes || []).map(shape => (
        <div
          key={shape.id}
          className="absolute"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.width}%`,
            height: `${shape.height}%`,
            opacity: shape.opacity,
            transform: `rotate(${shape.rotation || 0}deg)`,
          }}
        >
          {shape.type === "rectangle" && <div className="w-full h-full rounded-sm" style={{ backgroundColor: shape.color }} />}
          {shape.type === "circle" && <div className="w-full h-full rounded-full" style={{ backgroundColor: shape.color }} />}
          {shape.type === "triangle" && <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,0 100,100 0,100" fill={shape.color} /></svg>}
          {shape.type === "line" && <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none"><line x1="0" y1="50" x2="100" y2="50" stroke={shape.color} strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" /></svg>}
          {shape.type === "arrow" && <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none"><defs><marker id={`arr-dcp-${shape.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill={shape.color} /></marker></defs><line x1="0" y1="50" x2="90" y2="50" stroke={shape.color} strokeWidth="3" markerEnd={`url(#arr-dcp-${shape.id})`} vectorEffect="non-scaling-stroke" /></svg>}
          {shape.type === "ball" && <div className="w-full h-full rounded-full bg-white border-2 border-gray-400 shadow-md" />}
        </div>
      ))}
      {/* Drawings */}
      {(drawings || []).map(drawing => (
        <svg key={drawing.id} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={drawing.points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke={drawing.color} strokeWidth={drawing.strokeWidth || 3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      ))}
      {/* Tokens */}
      {tokens.map(t => {
        const isBall = t.type === "ball"
        const isOpponent = t.type === "opponent"
        return (
          <div
            key={t.id}
            className="absolute flex flex-col items-center"
            style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`${isBall ? 'w-5 h-5' : 'w-8 h-8'} rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white/70 ${isBall ? 'bg-orange-500' : isOpponent ? 'bg-black' : 'bg-green-500'}`}>
              {!isBall && t.label}
            </div>
            {!isBall && !isOpponent && (
              <span className="text-white text-[10px] font-bold mt-1 whitespace-nowrap" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                {t.label.toUpperCase()}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function SharePageContent({ exportData }: { exportData: SharedData }) {
  const expanded = useMemo((): ExpandedData | null => {
    try {
      if (exportData?.m && exportData?.p !== undefined) {
        const m = exportData.m
        return {
          matchInfo: {
            date: m.d || "",
            time: m.t || "",
            opponent: m.o || "Rival",
            location: (m.l as "local" | "visitante") || "local",
            matchday: m.md || "",
            tournament: m.to || "",
          },
          players: (exportData.p || []).map((p: Record<string, unknown>) => ({
            id: String(p.i || ""),
            firstName: String(p.f || ""),
            lastName: String(p.l || ""),
            dorsalNumber: Number(p.n) || 0,
            position: String(p.po || ""),
          })),
          formationBoards: (exportData.fb || []).map((b: Record<string, unknown>) => ({
            id: String(b.i || ""),
            name: String(b.n || ""),
            positions: ((b.ps as Array<Record<string, unknown>>) || []).map((p: Record<string, unknown>) => ({
              playerId: String(p.playerId ?? p.pi ?? ""),
              x: typeof p.x === "number" ? p.x : Number(p.x) || 0,
              y: typeof p.y === "number" ? p.y : Number(p.y) || 0,
            })),
          })),
          cornerPlays: (exportData.cp || []).map((c: Record<string, unknown>, idx: number) => ({
            id: String(c.i ?? `cp-${idx}`),
            name: String(c.n ?? ""),
            description: String(c.d ?? ""),
            tokens: (Array.isArray(c.t) ? c.t : []) as CornerToken[],
            drawings: (c.dr as DrawingPath[]) || [],
            shapes: (c.sh as DrawingShape[]) || [],
          })),
          defensiveCornerPlays: (exportData.dcp || []).map((c: Record<string, unknown>, idx: number) => ({
            id: String(c.i ?? `dcp-${idx}`),
            name: String(c.n ?? ""),
            description: String(c.d ?? ""),
            tokens: (Array.isArray(c.t) ? c.t : []) as CornerToken[],
            drawings: (c.dr as DrawingPath[]) || [],
            shapes: (c.sh as DrawingShape[]) || [],
          })),
          blockPlays: (exportData.bp || []).map((b: Record<string, unknown>, idx: number) => ({
            id: String(b.i ?? `bp-${idx}`),
            name: String(b.n ?? ""),
            description: String(b.d ?? ""),
            tokens: (Array.isArray(b.t) ? b.t : []) as CornerToken[],
            drawings: (b.dr as DrawingPath[]) || [],
            shapes: (b.sh as DrawingShape[]) || [],
          })),
          uniform: exportData.u || { camiseta: "oficial", medias: "oficial" },
          opponentLogo: exportData.ol,
        }
      }
    } catch (error) {
      console.error("Error parsing export data:", error)
    }
    return null
  }, [exportData])

  if (!expanded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Cargando convocatoria...</p>
        </div>
      </div>
    )
  }

  const { matchInfo, players, formationBoards, cornerPlays, defensiveCornerPlays, blockPlays, uniform, opponentLogo } = expanded
  const displayUniform = uniform || { camiseta: "oficial", medias: "oficial" }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00")
    return date.toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header — glass */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shrink-0 glow-primary-soft">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/stickplanner-bH4F1wYyJg3tj1ECSKyuG7xPoQa1Hb.png"
              alt="Stick Planner"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <span className="font-display text-xs sm:text-sm font-bold text-foreground tracking-tight">Stick Planner</span>
            <p className="text-[10px] text-primary-soft leading-none">Convocatoria — Club Banco Hipotecario</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-6">
        {/* Match Info */}
        <div className="bento-card shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 glass-primary border-b border-white/5">
            <span className="label-caps text-primary-soft">{matchInfo.matchday}</span>
            <span className="text-[11px] text-muted-foreground">{matchInfo.tournament}</span>
            <div className="w-5" />
          </div>

          <div className="px-4 py-4">
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-2xl glass overflow-hidden p-1 flex items-center justify-center">
                  <img src="/escudo.png" alt="B. Hipotecario" className="w-full h-full object-contain" />
                </div>
                <span className="font-display text-[11px] font-bold text-foreground tracking-tight">B. HIPOTECARIO</span>
              </div>

              <span className="font-display text-xl font-black text-muted-foreground tracking-widest">VS</span>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-2xl glass overflow-hidden p-1 flex items-center justify-center">
                  {opponentLogo ? (
                    <img src={opponentLogo} alt={matchInfo.opponent} className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-display text-base font-black text-foreground">{matchInfo.opponent.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <span className="font-display text-[11px] font-bold text-foreground tracking-tight">{matchInfo.opponent.toUpperCase()}</span>
              </div>
            </div>

            <div className="flex items-center justify-around pt-3 border-t border-white/5 gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-primary-soft" />
                <span className="capitalize">{formatDate(matchInfo.date)}</span>
              </div>
              <div className="h-3 w-px bg-border/40" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary-soft" />
                <span>{matchInfo.time} hs</span>
              </div>
              <div className="h-3 w-px bg-border/40" />
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-primary-soft" />
                <span className={`font-semibold ${matchInfo.location === "local" ? "text-primary-soft" : "text-muted-foreground"}`}>
                  {matchInfo.location === "local" ? "Local" : "Visitante"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Jugadoras Citadas */}
        <Card className="bento-card border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-soft" />
              <CardTitle className="font-display text-lg text-card-foreground">Jugadoras Citadas ({players.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {players.map((player) => (
                <div key={player.id} className="flex items-center gap-2 p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    {player.dorsalNumber}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm truncate">{player.lastName}, {player.firstName}</p>
                    {player.position === "GK" && <span className="text-[10px] px-1.5 py-0.5 bg-accent text-accent-foreground rounded font-semibold">GK</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vestuario */}
        <Card className="bento-card border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Shirt className="h-5 w-5 text-primary-soft" />
              <CardTitle className="font-display text-lg text-card-foreground">Vestuario</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-xl border-2 border-primary/30">
                <img src={displayUniform.camiseta === "oficial" ? "/uniforms/camiseta-oficial.png" : "/uniforms/camiseta-alternativa.png"} alt="Camiseta" className="w-full h-auto object-contain mb-2" />
                <p className="text-xs font-semibold text-foreground text-center">{displayUniform.camiseta === "oficial" ? "Original" : "Alternativa"}</p>
              </div>
              <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-xl border-2 border-primary/30">
                <img src="/uniforms/pollera.png" alt="Pollera" className="w-full h-auto object-contain mb-2" />
                <p className="text-xs font-semibold text-foreground text-center">Pollera</p>
              </div>
              <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-xl border-2 border-primary/30">
                <img src={displayUniform.medias === "oficial" ? "/uniforms/medias-oficial.png" : displayUniform.medias === "fucsia" ? "/uniforms/medias-fucsia.png" : "/uniforms/medias-azul.png"} alt="Medias" className="w-full h-auto object-contain mb-2" />
                <p className="text-xs font-semibold text-foreground text-center">{displayUniform.medias === "oficial" ? "Oficial" : displayUniform.medias === "fucsia" ? "Fucsia" : "Azul"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloqueos */}
        {blockPlays && blockPlays.length > 0 && (
          <Card className="bento-card border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary-soft" />
                <CardTitle className="font-display text-lg text-card-foreground">Jugadas de Bloqueo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {blockPlays.map((play) => (
                  <div key={play.id} className="space-y-3">
                    <div className="border-l-4 border-primary pl-3">
                      <h4 className="font-bold text-foreground text-sm">{play.name}</h4>
                      {play.description && <p className="text-xs text-muted-foreground">{play.description}</p>}
                    </div>
                    <div className="relative w-full rounded-xl overflow-hidden shadow-lg">
                      <img src="/canchadeagua.png" alt="Hockey field" className="w-full h-auto" />
{/* Shapes */}
  {(play.shapes || []).map(shape => (
  <div
  key={shape.id}
  className="absolute"
  style={{
  left: `${shape.x}%`,
  top: `${shape.y}%`,
  width: `${shape.width}%`,
  height: `${shape.height}%`,
  opacity: shape.opacity,
  transform: `rotate(${shape.rotation || 0}deg)`,
  }}
  >
  {shape.type === "rectangle" && <div className="w-full h-full rounded-sm" style={{ backgroundColor: shape.color }} />}
  {shape.type === "circle" && <div className="w-full h-full rounded-full" style={{ backgroundColor: shape.color }} />}
  {shape.type === "triangle" && <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,0 100,100 0,100" fill={shape.color} /></svg>}
  {shape.type === "line" && <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none"><line x1="0" y1="50" x2="100" y2="50" stroke={shape.color} strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" /></svg>}
  {shape.type === "arrow" && <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none"><defs><marker id={`arr-${shape.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill={shape.color} /></marker></defs><line x1="0" y1="50" x2="90" y2="50" stroke={shape.color} strokeWidth="3" markerEnd={`url(#arr-${shape.id})`} vectorEffect="non-scaling-stroke" /></svg>}
  {shape.type === "ball" && <div className="w-full h-full rounded-full bg-white border-2 border-gray-400 shadow-md" />}
  {shape.type === "banana" && <img src="/banana.png" alt="Banana" className="w-full h-full object-contain" />}
  </div>
  ))}
  {/* Drawings */}
  {play.drawings.map(drawing => (
  <svg key={drawing.id} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
  <polyline points={drawing.points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke={drawing.color} strokeWidth={drawing.strokeWidth || 3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
  </svg>
  ))}
  {play.tokens.map(t => {
                        const isBall = t.type === "ball"
                        const isOpponent = t.type === "opponent"
                        return (
                          <div key={t.id} className="absolute flex flex-col items-center" style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white/70 ${isOpponent ? 'bg-black' : 'bg-blue-500'}`}>
                              {!isBall && t.label}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Corners Ofensivos */}
        {cornerPlays && cornerPlays.length > 0 && (
          <Card className="bento-card border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary-soft" />
                <CardTitle className="font-display text-lg text-card-foreground">Corners Ofensivos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cornerPlays.map((play) => (
                  <div key={play.id} className="space-y-3">
                    <div className="border-l-4 border-primary pl-3">
                      <h4 className="font-bold text-foreground text-sm">{play.name}</h4>
                      {play.description && <p className="text-xs text-muted-foreground">{play.description}</p>}
                    </div>
                    <CornerFieldSVG tokens={play.tokens} drawings={play.drawings} shapes={play.shapes} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Corners Defensivos */}
        {defensiveCornerPlays && defensiveCornerPlays.length > 0 && (
          <Card className="bento-card border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary-soft" />
                <CardTitle className="font-display text-lg text-card-foreground">Corners Defensivos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {defensiveCornerPlays.map((play) => (
                  <div key={play.id} className="space-y-3">
                    <div className="border-l-4 border-primary pl-3">
                      <h4 className="font-bold text-foreground text-sm">{play.name}</h4>
                      {play.description && <p className="text-xs text-muted-foreground">{play.description}</p>}
                    </div>
                    <DefensiveCornerFieldSVG tokens={play.tokens} drawings={play.drawings} shapes={play.shapes} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formaciones */}
        {formationBoards && formationBoards.length > 0 && (
          <Card className="bento-card border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary-soft" />
                <CardTitle className="font-display text-lg text-card-foreground">Formaciones</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {formationBoards.map((board) => (
                  <div key={board.id} className="space-y-3">
                    <h4 className="font-bold text-foreground text-sm border-l-4 border-primary pl-3">{board.name}</h4>
                    <HockeyFieldSVG positions={board.positions} players={players} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
