"use client"

import { useTeamStore, type CamisetaType, type MediasType, type MatchUniform } from "@/lib/team-store"
import { Shirt } from "lucide-react"

const CAMISETAS = [
  { id: "oficial" as CamisetaType, name: "Original", image: "/uniforms/camiseta-oficial.png" },
  { id: "alternativa" as CamisetaType, name: "Alternativa", image: "/uniforms/camiseta-alternativa.png" },
]

const POLLERA = { id: "pollera", name: "Pollera", image: "/uniforms/pollera.png" }

const MEDIAS = [
  { id: "oficial" as MediasType, name: "Oficial", image: "/uniforms/medias-oficial.png" },
  { id: "fucsia" as MediasType, name: "Fucsia", image: "/uniforms/medias-fucsia.png" },
  { id: "azul" as MediasType, name: "Azul", image: "/uniforms/medias-azul.png" },
]

interface VestidorCardProps {
  fixtureId: string
}

export function VestidorCard({ fixtureId }: VestidorCardProps) {
  const { getFixtureUniform, updateFixtureUniform } = useTeamStore()
  const uniform = getFixtureUniform(fixtureId)

  const handleUpdate = (updates: Partial<MatchUniform>) => {
    updateFixtureUniform(fixtureId, { ...uniform, ...updates })
  }

  return (
    <div className="bento-card p-4 sm:p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Shirt className="w-4 h-4 text-primary-soft" />
        <h3 className="font-display text-sm font-bold text-foreground">Vestidor</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Camisetas */}
        {CAMISETAS.map(c => (
          <button
            key={c.id}
            onClick={() => handleUpdate({ camiseta: c.id })}
            className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all aspect-[3/4] ${
              uniform.camiseta === c.id
                ? "border-primary bg-primary/10"
                : "border-border/30 hover:border-border/60 bg-secondary/20"
            }`}
          >
            <div className="flex-1 w-full relative overflow-hidden rounded-lg bg-white/5 flex items-center justify-center">
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium text-foreground mt-1.5">{c.name}</span>
            {uniform.camiseta === c.id && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        ))}

        {/* Pollera */}
        <div
          className="relative flex flex-col items-center p-2 rounded-xl border-2 border-primary bg-primary/10 aspect-[3/4]"
        >
          <div className="flex-1 w-full relative overflow-hidden rounded-lg bg-white/5 flex items-center justify-center">
            <img
              src={POLLERA.image}
              alt={POLLERA.name}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium text-foreground mt-1.5">{POLLERA.name}</span>
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </div>

        {/* Medias */}
        {MEDIAS.map(m => (
          <button
            key={m.id}
            onClick={() => handleUpdate({ medias: m.id })}
            className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all aspect-[3/4] ${
              uniform.medias === m.id
                ? "border-primary bg-primary/10"
                : "border-border/30 hover:border-border/60 bg-secondary/20"
            }`}
          >
            <div className="flex-1 w-full relative overflow-hidden rounded-lg bg-white/5 flex items-center justify-center">
              <img
                src={m.image}
                alt={m.name}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium text-foreground mt-1.5">{m.name}</span>
            {uniform.medias === m.id && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
