"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Lock, User, Eye, EyeOff } from "lucide-react"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    })
    if (error) setError("Usuario o contraseña incorrecta")
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background accents — water-pitch gradients */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,102,255,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 30% at 100% 100%, rgba(0,238,252,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-3xl overflow-hidden mb-5 shadow-2xl glow-primary-soft">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/stickplanner-bH4F1wYyJg3tj1ECSKyuG7xPoQa1Hb.png"
              alt="Stick Planner"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight text-center">Stick Planner</h1>
          <p className="text-sm font-semibold text-primary-soft mt-1">Club Banco Hipotecario</p>
          <p className="label-caps text-muted-foreground mt-2">Panel de Dirección Técnica</p>
        </div>

        {/* Card — glassmorphism */}
        <div className="glass-strong rounded-3xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="label-caps text-muted-foreground mb-2 block">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ingresá tu usuario"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  className="w-full bg-input text-foreground placeholder:text-muted-foreground/60 text-sm rounded-xl pl-10 pr-4 py-3 border border-border/40 outline-none input-glow transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label-caps text-muted-foreground mb-2 block">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Ingresá tu contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-input text-foreground placeholder:text-muted-foreground/60 text-sm rounded-xl pl-10 pr-11 py-3 border border-border/40 outline-none input-glow transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs font-semibold text-destructive bg-destructive/10 rounded-xl px-3 py-2 text-center border border-destructive/20">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold tracking-tight font-display transition-all hover:opacity-90 hover:shadow-[0_0_28px_rgba(0,102,255,0.45)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </span>
              ) : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Acceso exclusivo para cuerpo técnico
        </p>
      </div>
    </div>
  )
}
