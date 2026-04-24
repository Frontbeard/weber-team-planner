"use client"

import { useState } from "react"
import { useTeamStore } from "@/lib/team-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Edit2, Trash2, ChevronDown, X } from "lucide-react"
import type { Fixture } from "@/lib/team-store"

const MONTH_NAMES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]

export function ScoutingNotesCard({ fixtures }: { fixtures: Fixture[] }) {
  const { getScoutingNote, addScoutingNote, updateScoutingNote, removeScoutingNote } = useTeamStore()
  const [editingFixtureId, setEditingFixtureId] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState("")
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([3]))

  const fixturesByMonth = fixtures.reduce((acc, f) => {
    if (f.isBye) return acc
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

  const handleOpenPopup = (fixtureId: string) => {
    const existing = getScoutingNote(fixtureId)
    setNoteContent(existing?.content || "")
    setEditingFixtureId(fixtureId)
  }

  const handleSaveNote = () => {
    if (!editingFixtureId) return
    const existing = getScoutingNote(editingFixtureId)
    if (existing) {
      updateScoutingNote(existing.id, noteContent)
    } else {
      addScoutingNote({ fixtureId: editingFixtureId, content: noteContent })
    }
    setEditingFixtureId(null)
    setNoteContent("")
  }

  const editingFixture = fixtures.find(f => f.id === editingFixtureId)

  return (
    <>
      <Card className="bento-card p-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-4 h-4 text-primary-soft" />
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">Anotaciones</h3>
            <p className="text-[10px] text-muted-foreground">Observaciones por fecha</p>
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(fixturesByMonth).sort(([a], [b]) => Number(a) - Number(b)).map(([monthStr, monthFixtures]) => {
            const month = Number(monthStr)
            const isExpanded = expandedMonths.has(month)
            const notesCount = monthFixtures.filter(f => getScoutingNote(f.id)).length
            
            return (
              <div key={month} className="rounded-xl border border-border/20 bg-secondary/10 overflow-hidden">
                <button
                  onClick={() => toggleMonth(month)}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{MONTH_NAMES[month]}</span>
                    {notesCount > 0 && (
                      <Badge className="bg-primary/20 text-primary text-[9px] px-1.5 py-0">
                        {notesCount} notas
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                
                {isExpanded && (
                  <div className="px-2 pb-2 space-y-1.5">
                    {monthFixtures.map(fixture => {
                      const note = getScoutingNote(fixture.id)
                      const hasNotes = !!note

                      return (
                        <div key={fixture.id} className="flex items-center justify-between p-2 bg-card rounded-lg hover:bg-secondary/30 transition-colors group">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[9px] font-bold text-muted-foreground">{fixture.matchday}</span>
                              <p className="text-xs font-semibold text-foreground truncate">vs {fixture.opponent}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] text-muted-foreground">
                                {new Date(fixture.date + "T12:00:00").getDate()} {MONTH_NAMES[month].slice(0,3).toLowerCase()}
                              </span>
                              {hasNotes && (
                                <Badge className="bg-green-500/20 text-green-600 text-[8px] px-1 py-0">
                                  Notas
                                </Badge>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleOpenPopup(fixture.id)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Popup Modal */}
      {editingFixtureId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="font-display text-sm font-bold text-foreground">
                Notas - {editingFixture?.opponent}
              </h3>
              <button 
                onClick={() => setEditingFixtureId(null)} 
                className="p-1.5 hover:bg-secondary rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">
                  Observaciones tácticas
                </label>
                <Textarea
                  placeholder="Escribí aquí tus notas y observaciones del rival..."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  className="bg-secondary border-border/30 text-foreground placeholder:text-muted-foreground rounded-xl min-h-40 resize-none text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveNote}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Guardar
                </Button>
                <Button
                  onClick={() => setEditingFixtureId(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>

              {getScoutingNote(editingFixtureId) && (
                <Button
                  onClick={() => {
                    const n = getScoutingNote(editingFixtureId)
                    if (n) removeScoutingNote(n.id)
                    setEditingFixtureId(null)
                  }}
                  variant="outline"
                  className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar nota
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
