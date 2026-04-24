"use client"

import { useState } from "react"
import { useTeamStore } from "@/lib/team-store"
import { Pencil, Check, Plus, Trash2, Users, Cross } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

export function CitedPlayersCard() {
  const { players, updatePlayer, addPlayer, removePlayer, selectedFixtureId, citedPlayers } = useTeamStore()
  const [isEditing, setIsEditing] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null)
  const [np, setNp] = useState({ firstName: "", lastName: "", dorsalNumber: "" })
  const [editData, setEditData] = useState({ firstName: "", lastName: "", dorsalNumber: "", isInjured: false })

  const toggleCite = async (id: string, cited: boolean) => {
    // Update local state
    updatePlayer(id, { isCited: cited })
    
    // Persist to database
    if (selectedFixtureId) {
      try {
        await fetch("/api/cited-players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fixtureId: selectedFixtureId,
            playerId: id,
            remove: !cited
          })
        })
      } catch (error) {
        console.error("Error updating cited status:", error)
      }
    }
  }

  const handleAdd = () => {
    if (!np.firstName || !np.lastName || !np.dorsalNumber) return
    addPlayer({ firstName: np.firstName, lastName: np.lastName, dorsalNumber: parseInt(np.dorsalNumber), isCited: false })
    setNp({ firstName: "", lastName: "", dorsalNumber: "" })
    setAddOpen(false)
  }

  const openEdit = (player: typeof players[0]) => {
    setEditingPlayer(player.id)
    setEditData({
      firstName: player.firstName,
      lastName: player.lastName,
      dorsalNumber: player.dorsalNumber.toString(),
      isInjured: player.isInjured || false
    })
    setEditOpen(true)
  }

  const saveEdit = () => {
    if (!editingPlayer) return
    updatePlayer(editingPlayer, {
      firstName: editData.firstName,
      lastName: editData.lastName,
      dorsalNumber: parseInt(editData.dorsalNumber),
      isInjured: editData.isInjured
    })
    setEditOpen(false)
    setEditingPlayer(null)
  }

  return (
    <div className="bento-card shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary-soft" />
          <h3 className="font-display text-sm font-bold text-foreground">Plantel</h3>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{citedPlayers.length}/{players.length} citadas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setAddOpen(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsEditing(e => !e)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isEditing ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {isEditing ? <><Check className="w-3 h-3" /> Listo</> : <><Pencil className="w-3 h-3" /> Editar</>}
          </button>
        </div>
      </div>

      {/* Player list */}
      <div className="divide-y divide-border/10 max-h-[520px] overflow-y-auto">
        {players.map(player => (
          <div
            key={player.id}
            className={`flex items-center gap-3 px-4 py-3 transition-colors ${
              player.isCited ? "bg-primary/5" : "hover:bg-secondary/20"
            }`}
          >
            {/* Citation status dot */}
            <button
              onClick={() => toggleCite(player.id, !player.isCited)}
              className={`w-3 h-3 rounded-full shrink-0 transition-all ${
                player.isCited ? "bg-green-500" : "bg-red-500"
              }`}
              title={player.isCited ? "Citada" : "No citada"}
            />
            
            {/* Dorsal */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-primary/10 text-black shrink-0">
              {player.dorsalNumber}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">
                  {player.lastName}, {player.firstName}
                </p>
                {player.position === "GK" && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent shrink-0">GK</span>
                )}
                {player.isInjured && (
                  <div className="w-4 h-4 rounded-full bg-destructive flex items-center justify-center shrink-0" title="Lesionada">
                    <Cross className="w-2.5 h-2.5 text-destructive-foreground" strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {isEditing && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(player)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {player.position !== "GK" && (
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add player dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle className="text-foreground">Agregar Jugadora</DialogTitle>
            <DialogDescription>
              Ingresa los datos de la nueva jugadora
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Nombre</label>
              <input
                value={np.firstName}
                onChange={e => setNp(p => ({ ...p, firstName: e.target.value }))}
                className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm border border-border/40 outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Apellido</label>
              <input
                value={np.lastName}
                onChange={e => setNp(p => ({ ...p, lastName: e.target.value }))}
                className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm border border-border/40 outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Dorsal</label>
              <input
                type="number"
                value={np.dorsalNumber}
                onChange={e => setNp(p => ({ ...p, dorsalNumber: e.target.value }))}
                className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm border border-border/40 outline-none focus:border-primary/50"
              />
            </div>
            <button
              onClick={handleAdd}
              className="w-full bg-success text-success-foreground rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Agregar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit player dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Jugadora</DialogTitle>
            <DialogDescription>
              Modifica los datos de la jugadora
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Nombre</label>
              <input
                value={editData.firstName}
                onChange={e => setEditData(p => ({ ...p, firstName: e.target.value }))}
                className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm border border-border/40 outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Apellido</label>
              <input
                value={editData.lastName}
                onChange={e => setEditData(p => ({ ...p, lastName: e.target.value }))}
                className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm border border-border/40 outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Dorsal</label>
              <input
                type="number"
                value={editData.dorsalNumber}
                onChange={e => setEditData(p => ({ ...p, dorsalNumber: e.target.value }))}
                className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm border border-border/40 outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="injured"
                checked={editData.isInjured}
                onChange={e => setEditData(p => ({ ...p, isInjured: e.target.checked }))}
                className="w-4 h-4 rounded border-border/40 text-destructive focus:ring-destructive/50 cursor-pointer"
              />
              <label htmlFor="injured" className="text-sm font-medium text-foreground cursor-pointer">
                Lesionada
              </label>
            </div>
            <button
              onClick={saveEdit}
              className="w-full bg-success text-success-foreground rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Guardar cambios
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
