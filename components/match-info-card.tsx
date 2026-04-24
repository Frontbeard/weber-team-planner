"use client"

import { useState } from "react"
import { useTeamStore } from "@/lib/team-store"
import { Calendar, Clock, MapPin, Pencil, Check, X } from "lucide-react"

export function MatchInfoCard() {
  const { matchInfo, updateMatchInfo, teamLogo } = useTeamStore()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(matchInfo)

  const save = () => { updateMatchInfo(draft); setIsEditing(false) }
  const cancel = () => { setDraft(matchInfo); setIsEditing(false) }

  const formatDate = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })

  if (isEditing) {
    return (
      <div className="bento-card p-4 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-foreground">Editar partido</h3>
          <div className="flex gap-2">
            <button onClick={cancel} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary/60 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <button onClick={save} className="p-1.5 rounded-lg bg-success text-success-foreground hover:opacity-90 transition-colors">
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Fecha", type: "date",  val: draft.date,       key: "date" },
            { label: "Hora",  type: "time",  val: draft.time,       key: "time" },
            { label: "Rival", type: "text",  val: draft.opponent,   key: "opponent", span: true },
            { label: "Jornada", type: "text",val: draft.matchday,   key: "matchday" },
            { label: "Torneo",  type: "text",val: draft.tournament, key: "tournament" },
            { label: "Rueda",   type: "text",val: draft.round,      key: "round" },
          ].map(f => (
            <div key={f.key} className={f.span ? "col-span-2" : ""}>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{f.label}</label>
              <input
                type={f.type}
                value={f.val}
                onChange={e => setDraft({ ...draft, [f.key]: e.target.value })}
                className="w-full bg-secondary text-foreground text-sm rounded-xl px-3 py-2 border border-border/50 outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Condición</label>
            <select
              value={draft.location}
              onChange={e => setDraft({ ...draft, location: e.target.value as "local" | "visitante" })}
              className="w-full bg-secondary text-foreground text-sm rounded-xl px-3 py-2 border border-border/50 outline-none focus:border-primary/60"
            >
              <option value="local">Local</option>
              <option value="visitante">Visitante</option>
            </select>
          </div>
        </div>
      </div>
    )
  }

  // Get opponent logo from store
  const opponentLogo = matchInfo.opponentLogo

  return (
    <div className="bento-card shadow-lg overflow-hidden">
      {/* Eyebrow bar */}
      <div className="flex items-center justify-between px-4 py-2 glass-primary border-b border-white/5">
        <span className="label-caps text-primary-soft">{matchInfo.matchday}</span>
        <span className="text-[11px] text-muted-foreground">{matchInfo.tournament} · {matchInfo.round}</span>
        <button onClick={() => { setDraft(matchInfo); setIsEditing(true) }} className="p-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-4 py-4">
        {/* Teams row */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-2xl glass overflow-hidden p-1 flex items-center justify-center">
              <img src={teamLogo} alt="BH" className="w-full h-full object-contain" />
            </div>
            <span className="font-display text-[11px] font-bold text-foreground tracking-tight">B. HIPOTECARIO</span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="font-display text-xl font-black text-muted-foreground tracking-widest">VS</span>
          </div>

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

        {/* Meta row */}
        <div className="flex items-center justify-around pt-3 border-t border-border/20 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="capitalize">{formatDate(matchInfo.date)}</span>
          </div>
          <div className="h-3 w-px bg-border/40" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>{matchInfo.time} hs</span>
          </div>
          <div className="h-3 w-px bg-border/40" />
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className={`font-semibold ${matchInfo.location === "local" ? "text-primary" : "text-muted-foreground"}`}>
              {matchInfo.location === "local" ? "Local" : "Visitante"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
