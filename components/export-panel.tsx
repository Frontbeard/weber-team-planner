"use client"

import { useState } from "react"
import { useTeamStore } from "@/lib/team-store"
import { Link2, Copy, Check, ExternalLink } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

export function ExportPanel() {
  const {
    players,
    formationBoards,
    cornerPlays,
    defensiveCornerPlays,
    blockPlays,
    fixtures,
    getFixtureUniform,
    selectedFixtureId,
    citedPlayers,
  } = useTeamStore()
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const selectedFixture = fixtures.find(f => f.id === selectedFixtureId)
  const fixtureUniform = selectedFixture ? getFixtureUniform(selectedFixture.id) : null

  const generateLink = async () => {
    setIsGenerating(true)

    if (!selectedFixture) {
      setIsGenerating(false)
      alert("Por favor selecciona un partido")
      return
    }

    // Todas las jugadoras que están en alguna formación (cancha), para que el link pueda resolver dorsal/nombre
    const formationPlayerIds = new Set<string>()
    for (const board of formationBoards) {
      for (const pos of board.positions) {
        if (pos.playerId) formationPlayerIds.add(pos.playerId)
      }
    }
    const citedIds = new Set(citedPlayers.map(p => p.id))
    const playersForExport = [...citedPlayers]
    const seen = new Set(citedIds)
    for (const id of formationPlayerIds) {
      if (seen.has(id)) continue
      const pl = players.find(p => p.id === id)
      if (pl) {
        playersForExport.push(pl)
        seen.add(id)
      }
    }
    
    // Simplified data - only include essential info
    const data = {
      m: { // matchInfo
        d: selectedFixture.date,
        t: selectedFixture.time,
        o: selectedFixture.opponent,
        l: selectedFixture.location,
        md: selectedFixture.matchday,
        to: selectedFixture.tournament,
      },
      p: playersForExport.map(p => ({ // players (citadas + las que están en formación)
        i: p.id,
        f: p.firstName,
        l: p.lastName,
        n: p.dorsalNumber,
        po: p.position,
      })),
      fb: formationBoards.map(b => ({ // formationBoards
        i: b.id,
        n: b.name,
        ps: b.positions.map(pos => ({
          playerId: pos.playerId,
          x: pos.x,
          y: pos.y,
        })),
      })),
      cp: cornerPlays.map(c => ({ // cornerPlays
        i: c.id,
        n: c.name,
        d: c.description,
        t: c.tokens,
        dr: c.drawings || [],
        sh: (c.shapes || []).filter(s => s.type !== "banana"), // Sin banana en corners
      })),
      dcp: defensiveCornerPlays.map(c => ({ // defensiveCornerPlays
        i: c.id,
        n: c.name,
        d: c.description,
        t: c.tokens,
        dr: c.drawings || [],
        sh: (c.shapes || []).filter(s => s.type !== "banana"), // Sin banana en corners
      })),
      bp: blockPlays.map(b => ({ // blockPlays
        i: b.id,
        n: b.name,
        d: b.description,
        t: b.tokens,
        dr: b.drawings,
        sh: b.shapes || [],
      })),
      u: fixtureUniform,
      ol: selectedFixture?.opponentLogo,
    }
    
    try {
      // Guardar en la API y obtener ID corto
      const response = await fetch("/api/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      })

      if (!response.ok) {
        let msg = "No se pudo guardar el link"
        try {
          const errBody = await response.json()
          if (errBody?.error && typeof errBody.error === "string") {
            msg = errBody.error
          }
        } catch {
          /* ignore */
        }
        throw new Error(msg)
      }

      const { id } = await response.json()
      setShareUrl(`${window.location.origin}/share/${id}`)
    } catch (error) {
      console.error("Error generating link:", error)
      const msg =
        error instanceof Error ? error.message : "Error al generar el link. Por favor intenta de nuevo."
      alert(msg)
    }
    
    setIsGenerating(false)
    setDialogOpen(true)
  }

  const copyLink = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex gap-2 p-2 rounded-2xl glass-strong shadow-2xl glow-primary-soft">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <button
            onClick={generateLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold font-display tracking-tight hover:opacity-90 hover:shadow-[0_0_20px_rgba(0,102,255,0.4)] shadow-lg shadow-primary/25 transition-all"
          >
            <Link2 className="w-3.5 h-3.5" /> Link
          </button>
        </DialogTrigger>
        <DialogContent className="glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle className="font-display">Link de solo lectura</DialogTitle>
            <DialogDescription>Comparte este link con las jugadoras. Solo pueden ver, no editar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {shareUrl && (
              <>
                <div className="flex gap-2">
                  <input
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-secondary text-foreground text-xs rounded-xl px-3 py-2.5 border border-border/40 outline-none"
                  />
                  <button
                    onClick={copyLink}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      copied ? "bg-green-500 text-white border-green-500" : "bg-secondary border-border/40 text-foreground hover:border-primary/40"
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => window.open(shareUrl, "_blank")}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold border border-border/30 hover:border-primary/40 transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Abrir vista previa
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
