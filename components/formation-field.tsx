"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTeamStore, FORMATION_PRESETS, type FormationBoard } from "@/lib/team-store"
import { Copy, Trash2, Plus, Pencil, Check, RotateCcw, Users } from "lucide-react"

// ─── Hockey Field Background ────────────────────────────────────────────────
function HockeyField() {
  return (
    <img 
      src="/canchadeagua.png"
      alt="Cancha de hockey"
      className="w-full h-full object-contain"
      draggable={false}
    />
  )
}

// ─── Single board ────────────────────────────────────────────────────────────
function BoardPanel({ board, canDelete, bw }: { board: FormationBoard; canDelete: boolean; bw: boolean }) {
  const {
    players, citedPlayers,
    updateBoardPositions, applyPresetToBoard,
    cloneFormationBoard, removeFormationBoard,
    renameBoardLabel, formationBoards,
  } = useTeamStore()

  const [isEditing, setIsEditing] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(board.name)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState("4-3-3")
  const fieldRef = useRef<HTMLDivElement>(null)

  const onFieldIds = board.positions.map(p => p.playerId)
  const availablePlayers = citedPlayers.filter(p => !onFieldIds.includes(p.id))

  const getPlayer = (id: string) => players.find(p => p.id === id)

  const calcPos = useCallback((cx: number, cy: number) => {
    if (!fieldRef.current) return null
    const r = fieldRef.current.getBoundingClientRect()
    return {
      x: Math.max(3, Math.min(97, ((cx - r.left) / r.width) * 100)),
      y: Math.max(3, Math.min(97, ((cy - r.top)  / r.height) * 100)),
    }
  }, [])

  const handleMove = useCallback((cx: number, cy: number) => {
    if (!draggingId) return
    const pos = calcPos(cx, cy)
    if (!pos) return
    updateBoardPositions(board.id, board.positions.map(p =>
      p.playerId === draggingId ? { ...p, ...pos } : p
    ))
  }, [draggingId, calcPos, board, updateBoardPositions])

  useEffect(() => {
    if (!draggingId) return
    const mm = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
    const tm = (e: TouchEvent) => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY) }
    const up = () => setDraggingId(null)
    window.addEventListener("mousemove", mm)
    window.addEventListener("touchmove", tm, { passive: false })
    window.addEventListener("mouseup", up)
    window.addEventListener("touchend", up)
    return () => {
      window.removeEventListener("mousemove", mm)
      window.removeEventListener("touchmove", tm)
      window.removeEventListener("mouseup", up)
      window.removeEventListener("touchend", up)
    }
  }, [draggingId, handleMove])

  const addToField = (pid: string) => {
    updateBoardPositions(board.id, [...board.positions, { playerId: pid, x: 50, y: 50 }])
  }

  const removeFromField = (pid: string) => {
    updateBoardPositions(board.id, board.positions.filter(p => p.playerId !== pid))
  }

  const handlePreset = (name: string) => {
    setActivePreset(name)
    const preset = FORMATION_PRESETS.find(p => p.name === name)
    if (preset) applyPresetToBoard(board.id, preset)
  }

  const saveName = () => {
    renameBoardLabel(board.id, nameVal || board.name)
    setEditingName(false)
  }

  const canClone = formationBoards.length < 5

  // Token colors (PDF style - solid colors)
  const tokenBg = (isGK: boolean) => {
    if (bw) return "#666"
    return isGK ? "#f97316" : "#3b82f6"
  }

  return (
    <div className="bento-card shadow-xl flex flex-col">
      {/* Board header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/5 bg-card/60">
        <div className="flex items-center gap-2 min-w-0 order-1 sm:order-none">
          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveName()}
                className="bg-secondary text-foreground text-xs sm:text-sm font-semibold rounded-lg px-2 py-1 border border-primary/50 outline-none w-24 sm:w-36"
              />
              <button onClick={saveName} className="p-1 rounded-lg bg-success text-success-foreground hover:opacity-80 shrink-0">
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setNameVal(board.name); setEditingName(true) }}
              className="flex items-center gap-1 group min-w-0"
            >
              <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[100px] sm:max-w-[140px]">{board.name}</span>
              <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 order-2 sm:order-none">
          <button
            onClick={() => cloneFormationBoard(board.id)}
            disabled={!canClone}
            title={canClone ? "Clonar pizarra" : "Máximo 5 formaciones"}
            className="p-1 sm:p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          {canDelete && (
            <button
              onClick={() => removeFormationBoard(board.id)}
              className="p-1 sm:p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
          <button
            onClick={() => { setIsEditing(e => !e); setDraggingId(null) }}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isEditing
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {isEditing ? <><Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden sm:inline">Listo</span></> : <><Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden sm:inline">Editar</span></>}
          </button>
        </div>
      </div>

      {/* Presets bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-secondary/20 border-b border-border/20 overflow-x-auto">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Sistema:</span>
        <div className="flex bg-secondary/60 rounded-xl p-0.5 gap-0.5 flex-wrap sm:flex-nowrap">
          {FORMATION_PRESETS.map(p => (
            <button
              key={p.name}
              onClick={() => handlePreset(p.name)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activePreset === p.name
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        {isEditing && (
          <button
            onClick={() => updateBoardPositions(board.id, [])}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10"
          >
            <RotateCcw className="w-3 h-3" /> Limpiar
          </button>
        )}
      </div>

      {/* Field + bench */}
      <div className="flex flex-1">
        {/* Field */}
        <div className="flex-1 p-1 sm:p-1.5 max-w-md mx-auto">
          <div
            ref={fieldRef}
            className="relative w-full overflow-hidden select-none"
            style={{ aspectRatio: "91/150" }}
          >
            <HockeyField />

            {board.positions.map(pos => {
              const player = getPlayer(pos.playerId)
              if (!player) return null
              const isGK = player.position === "GK"
              const isDragging = draggingId === pos.playerId
              const bg = tokenBg(isGK)

              return (
                <div
                  key={pos.playerId}
                  className={`absolute flex flex-col items-center transition-transform duration-75 ${
                    isEditing ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                  } ${isDragging ? "scale-110 z-50" : "z-10"}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)" }}
                  onMouseDown={e => { if (!isEditing) return; e.preventDefault(); setDraggingId(pos.playerId) }}
                  onTouchStart={() => { if (!isEditing) return; setDraggingId(pos.playerId) }}
                >
                  {/* Circle token with number */}
                  <div
                    className="relative w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white/50"
                    style={{ backgroundColor: bg }}
                  >
                    <span className="text-black text-[10px] sm:text-xs font-bold">{player.dorsalNumber}</span>
                    {isEditing && (
                      <button
                        onMouseDown={e => e.stopPropagation()}
                        onClick={() => removeFromField(pos.playerId)}
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-bold shadow hover:opacity-80"
                      >
                        x
                      </button>
                    )}
                  </div>
                  {/* Name label below */}
                  <span 
                    className="mt-0.5 sm:mt-1 px-1 sm:px-1.5 py-0.5 text-[7px] sm:text-[9px] md:text-[10px] font-bold text-white whitespace-nowrap uppercase tracking-wide max-w-[50px] sm:max-w-[70px] truncate"
                    style={{ 
                      textShadow: "0 1px 2px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)" 
                    }}
                  >
                    {player.firstName || player.lastName}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            {board.positions.length} en cancha
          </p>
        </div>

        {/* Bench (only in edit mode) */}
        {isEditing && (
          <div className="w-28 sm:w-36 md:w-44 border-l border-border/30 bg-secondary/10 flex flex-col">
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 border-b border-border/20">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold text-foreground">Citadas</span>
              <span className="ml-auto text-[10px] sm:text-xs text-muted-foreground bg-secondary px-1 sm:px-1.5 py-0.5 rounded-full">{availablePlayers.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1 sm:space-y-1.5 max-h-64 sm:max-h-80">
              {availablePlayers.length === 0 ? (
                <p className="text-[10px] sm:text-xs text-muted-foreground text-center py-4">{citedPlayers.length === 0 ? "Cita jugadoras primero" : "Todas en cancha"}</p>
              ) : availablePlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => addToField(player.id)}
                  className="w-full flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-card/60 hover:bg-card rounded-lg sm:rounded-xl border border-transparent hover:border-primary/30 transition-all group"
                >
                  <div
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full shrink-0 border-2 border-white/30 flex items-center justify-center"
                    style={{ backgroundColor: bw ? "#666" : "#3b82f6" }}
                  >
                    <span className="text-black text-[8px] sm:text-[10px] font-bold">{player.dorsalNumber}</span>
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs font-semibold text-foreground truncate">{player.lastName}</p>
                    <p className="text-[8px] sm:text-[10px] text-muted-foreground truncate hidden sm:block">{player.firstName}</p>
                  </div>
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main component (carousel of boards) ─────────────────────────────────────
export function FormationField() {
  const { formationBoards, addFormationBoard, bwMode } = useTeamStore()
  const [activeIdx, setActiveIdx] = useState(0)

  const idx = Math.min(activeIdx, formationBoards.length - 1)

  return (
    <div className="space-y-4">
      {/* Board tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap overflow-x-auto pb-1">
        {formationBoards.map((b, i) => (
          <button
            key={b.id}
            onClick={() => setActiveIdx(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap ${
              i === idx
                ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                : "bg-secondary/40 text-secondary-foreground border-border/30 hover:border-primary/40"
            }`}
          >
            {b.name}
          </button>
        ))}
        {formationBoards.length < 5 && (
          <button
            onClick={addFormationBoard}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground border border-dashed border-border/50 hover:border-primary/50 hover:text-primary transition-all whitespace-nowrap"
          >
            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Nueva pizarra</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        )}
        {formationBoards.length >= 5 && (
          <span className="text-xs text-muted-foreground px-2">Máximo 5 pizarras</span>
        )}
      </div>

      {/* Active board */}
      {formationBoards[idx] && (
        <BoardPanel
          board={formationBoards[idx]}
          canDelete={formationBoards.length > 1}
          bw={bwMode}
        />
      )}
    </div>
  )
}
