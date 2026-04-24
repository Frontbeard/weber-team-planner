"use client"

import { useState, useRef, useCallback } from "react"
import { useTeamStore, type CornerPlay, type CornerToken, type DefensiveCornerPlay } from "@/lib/team-store"
import { Plus, Trash2, X, GripVertical, Save, Users } from "lucide-react"

// ─── Draggable Token ────────────────────────────────────────────────────────
function DraggableToken({ 
  token, 
  onDrag, 
  onRemove,
  isEditing 
}: { 
  token: CornerToken
  onDrag: (x: number, y: number) => void
  onRemove: () => void
  isEditing: boolean
}) {
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return
    e.preventDefault()
    const container = (e.target as HTMLElement).closest(".corner-field-container")
    if (!container) return

    const rect = container.getBoundingClientRect()
    
    const onMouseMove = (ev: MouseEvent) => {
      const x = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100))
      const y = Math.max(0, Math.min(100, ((ev.clientY - rect.top) / rect.height) * 100))
      onDrag(x, y)
    }
    
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
    
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isEditing) return
    const container = (e.target as HTMLElement).closest(".corner-field-container")
    if (!container) return

    const rect = container.getBoundingClientRect()
    
    const onTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0]
      const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100))
      const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100))
      onDrag(x, y)
    }
    
    const onTouchEnd = () => {
      document.removeEventListener("touchmove", onTouchMove)
      document.removeEventListener("touchend", onTouchEnd)
    }
    
    document.addEventListener("touchmove", onTouchMove)
    document.addEventListener("touchend", onTouchEnd)
  }

  if (token.type === "ball") {
    return (
      <div
        className={`absolute w-3 h-3 rounded-full bg-white border border-gray-600 shadow-md transform -translate-x-1/2 -translate-y-1/2 ${isEditing ? "cursor-move" : ""}`}
        style={{ left: `${token.x}%`, top: `${token.y}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />
    )
  }

  const isOpponent = token.type === "opponent"

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${isEditing ? "cursor-move" : ""}`}
      style={{ left: `${token.x}%`, top: `${token.y}%` }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="relative">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shadow-md border border-white/70 ${
          isOpponent ? "bg-black text-white" : "bg-primary text-white"
        }`}>
          {token.label}
        </div>
        {isEditing && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 text-white flex items-center justify-center"
          >
            <X className="w-2 h-2" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Mini Preview Card ──────────────────────────────────────────────────────
function CornerMiniCard({ 
  play, 
  onClick,
  isDefensive = false
}: { 
  play: CornerPlay | DefensiveCornerPlay
  onClick: () => void
  isDefensive?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-white/10 bg-card hover:border-primary/40 hover:bg-card/80 glow-hover transition-all overflow-hidden group"
    >
      {/* Mini field preview */}
      <div className="relative w-full aspect-video overflow-hidden">
        <img 
          src={isDefensive ? "/cornercortodef.png" : "/cornercorto.png"}
          alt=""
          className="w-full h-full object-contain"
        />
        {/* Mini tokens */}
        {play.tokens.map(token => (
          <div
            key={token.id}
            className={`absolute w-1.5 h-1.5 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
              token.type === "ball" ? "bg-white border border-gray-500" : token.type === "opponent" ? "bg-black" : "bg-primary"
            }`}
            style={{ left: `${token.x}%`, top: `${token.y}%` }}
          />
        ))}
      </div>
      {/* Title */}
      <div className="px-2 py-1.5 text-left">
        <p className="text-[10px] font-bold text-foreground truncate">{play.name || "Sin nombre"}</p>
      </div>
    </button>
  )
}

// ─── Full Editor Modal ──────────────────────────────────────────────────────
function CornerEditor({
  play,
  onSave,
  onDelete,
  onClose,
  players,
  isDefensive = false
}: {
  play: CornerPlay | DefensiveCornerPlay
  onSave: (updates: Partial<CornerPlay>) => void
  onDelete: () => void
  onClose: () => void
  players: { id: string; firstName: string; lastName: string; dorsalNumber: number }[]
  isDefensive?: boolean
}) {
  const [tokens, setTokens] = useState<CornerToken[]>(play.tokens)
  const [name, setName] = useState(play.name)
  const [description, setDescription] = useState(play.description)
  const [isEditingField, setIsEditingField] = useState(false)
  const [showPlayerSelect, setShowPlayerSelect] = useState(false)
  const fieldRef = useRef<HTMLDivElement>(null)
  const localIdRef = useRef(0)
  const nextLocalId = useCallback(() => {
    localIdRef.current += 1
    return localIdRef.current
  }, [])

  const handleAddPlayer = (player: { id: string; firstName: string; lastName: string; dorsalNumber: number }) => {
    const newToken: CornerToken = {
      id: `token-${nextLocalId()}`,
      x: 50,
      y: 50,
      label: String(player.dorsalNumber),
      type: "attacker"
    }
    setTokens(prev => [...prev, newToken])
    setShowPlayerSelect(false)
  }

  const handleAddBall = () => {
    const hasBall = tokens.some(t => t.type === "ball")
    if (hasBall) return
    const newToken: CornerToken = {
      id: `ball-${nextLocalId()}`,
      x: 10,
      y: 85,
      label: "",
      type: "ball"
    }
    setTokens(prev => [...prev, newToken])
  }

  const handleTokenDrag = (tokenId: string, x: number, y: number) => {
    setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, x, y } : t))
  }

  const handleRemoveToken = (tokenId: string) => {
    setTokens(prev => prev.filter(t => t.id !== tokenId))
  }

  const handleSave = () => {
    onSave({ name, description, tokens })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="glass-strong rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="font-display text-sm font-bold text-foreground">
            Editar {isDefensive ? "Corner Defensivo" : "Corner Ofensivo"}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Name & Description */}
          <div className="space-y-2">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre de la jugada"
              className="w-full px-3 py-2 rounded-xl border border-border/30 bg-secondary/30 text-sm font-medium"
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descripción de la jugada..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-border/30 bg-secondary/30 text-xs resize-none"
            />
          </div>

          {/* Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Tablero</span>
              <button
                onClick={() => setIsEditingField(!isEditingField)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isEditingField ? "bg-primary text-white" : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <GripVertical className="w-3 h-3" />
                {isEditingField ? "Editando..." : "Mover fichas"}
              </button>
            </div>

            <div className="flex justify-center">
              <div 
                ref={fieldRef}
                className="corner-field-container relative rounded-xl overflow-hidden"
                style={{ aspectRatio: "16/9", width: "100%", maxWidth: "320px" }}
              >
              <img 
                src={isDefensive ? "/cornercortodef.png" : "/cornercorto.png"}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
              {tokens.map(token => (
                <DraggableToken
                  key={token.id}
                  token={token}
                  onDrag={(x, y) => handleTokenDrag(token.id, x, y)}
                  onRemove={() => handleRemoveToken(token.id)}
                  isEditing={isEditingField}
                />
              ))}
              </div>
            </div>

            {/* Add tokens */}
            {isEditingField && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowPlayerSelect(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20"
                >
                  <Users className="w-3.5 h-3.5" />
                  Jugadora
                </button>
                <button
                  onClick={() => {
                    const opponentCount = tokens.filter(t => t.type === "opponent").length
                    const newToken: CornerToken = {
                      id: `opponent-${nextLocalId()}`,
                      x: 60,
                      y: 40,
                      label: String(opponentCount + 1),
                      type: "opponent"
                    }
                    setTokens(prev => [...prev, newToken])
                  }}
                  className="px-3 py-2 rounded-xl bg-black text-white text-xs font-medium hover:bg-black/80"
                >
                  + Rival
                </button>
                <button
                  onClick={handleAddBall}
                  disabled={tokens.some(t => t.type === "ball")}
                  className="px-3 py-2 rounded-xl bg-secondary text-xs font-medium hover:bg-secondary/80 disabled:opacity-50"
                >
                  + Pelota
                </button>
              </div>
            )}
          </div>

          {/* Player select */}
          {showPlayerSelect && (
            <div className="border border-border/30 rounded-xl p-3 bg-secondary/20 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">Seleccionar jugadora</span>
                <button onClick={() => setShowPlayerSelect(false)} className="p-1 hover:bg-secondary rounded">
                  <X className="w-3 h-3" />
                </button>
              </div>
              {players.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-2">Primero citá jugadoras en la pestaña Jugadoras</p>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {players.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleAddPlayer(p)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-card hover:bg-primary/10 text-left"
                    >
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                        {p.dorsalNumber}
                      </span>
                      <span className="text-[10px] text-foreground truncate">{p.lastName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border/30">
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 text-xs font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary/90"
          >
            <Save className="w-3.5 h-3.5" />
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function CornerPlaysCard() {
  const { 
    players,
    cornerPlays, 
    addCornerPlay, 
    updateCornerPlay, 
    removeCornerPlay,
    defensiveCornerPlays,
    addDefensiveCornerPlay,
    updateDefensiveCornerPlay,
    removeDefensiveCornerPlay
  } = useTeamStore()

  const [activeTab, setActiveTab] = useState<"offensive" | "defensive">("offensive")
  const [editingPlay, setEditingPlay] = useState<CornerPlay | DefensiveCornerPlay | null>(null)
  const [editingIsDefensive, setEditingIsDefensive] = useState(false)

  const citedPlayers = players.filter(p => p.isCited)

  const handleAddOffensive = () => {
    const newPlay: Omit<CornerPlay, "id"> = {
      name: `Jugada ${cornerPlays.length + 1}`,
      description: "",
      tokens: [],
      drawings: [],
      shapes: [],
    }
    addCornerPlay(newPlay)
  }

  const handleAddDefensive = () => {
    const newPlay: Omit<DefensiveCornerPlay, "id"> = {
      name: `Defensa ${defensiveCornerPlays.length + 1}`,
      description: "",
      tokens: [],
      drawings: [],
      shapes: [],
    }
    addDefensiveCornerPlay(newPlay)
  }

  const handleEditPlay = (play: CornerPlay | DefensiveCornerPlay, isDefensive: boolean) => {
    setEditingPlay(play)
    setEditingIsDefensive(isDefensive)
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl">
        <button
          onClick={() => setActiveTab("offensive")}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold font-display tracking-tight transition-all ${
            activeTab === "offensive" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Ofensivo ({cornerPlays.length})
        </button>
        <button
          onClick={() => setActiveTab("defensive")}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold font-display tracking-tight transition-all ${
            activeTab === "defensive" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Defensivo ({defensiveCornerPlays.length})
        </button>
      </div>

      {/* Offensive Grid */}
      {activeTab === "offensive" && (
        <div className="grid grid-cols-3 gap-2">
          {cornerPlays.map(play => (
            <CornerMiniCard
              key={play.id}
              play={play}
              onClick={() => handleEditPlay(play, false)}
            />
          ))}
          {/* Add button */}
          <button
            onClick={handleAddOffensive}
            className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border/40 hover:border-primary/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-medium">Nueva</span>
          </button>
        </div>
      )}

      {/* Defensive Grid */}
      {activeTab === "defensive" && (
        <div className="grid grid-cols-3 gap-2">
          {defensiveCornerPlays.map(play => (
            <CornerMiniCard
              key={play.id}
              play={play}
              onClick={() => handleEditPlay(play, true)}
              isDefensive
            />
          ))}
          {/* Add button */}
          <button
            onClick={handleAddDefensive}
            className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border/40 hover:border-primary/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-medium">Nueva</span>
          </button>
        </div>
      )}

      {/* Editor Modal */}
      {editingPlay && (
        <CornerEditor
          play={editingPlay}
          onSave={(updates) => {
            if (editingIsDefensive) {
              updateDefensiveCornerPlay(editingPlay.id, updates)
            } else {
              updateCornerPlay(editingPlay.id, updates)
            }
          }}
          onDelete={() => {
            if (editingIsDefensive) {
              removeDefensiveCornerPlay(editingPlay.id)
            } else {
              removeCornerPlay(editingPlay.id)
            }
            setEditingPlay(null)
          }}
          onClose={() => setEditingPlay(null)}
          players={citedPlayers}
          isDefensive={editingIsDefensive}
        />
      )}
    </div>
  )
}
