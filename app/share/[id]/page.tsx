"use client"

import React, { ReactNode, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import SharePageContent from "../content"

// Error boundary para capturar errores de renderizado
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4 p-6">
            <p className="text-lg font-semibold text-foreground">Error al mostrar la convocatoria</p>
            <p className="text-sm text-muted-foreground">{this.state.error?.message || "Algo salio mal"}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Recargar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function SharePage() {
  const params = useParams()
  const id = params?.id as string
  const [exportData, setExportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchExport = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/exports/${id}`)
        
        if (!response.ok) {
          throw new Error("Export not found")
        }

        const data = await response.json()
        
        // Validar que los datos tengan la estructura esperada
        if (!data || typeof data !== "object") {
          throw new Error("Datos invalidos")
        }
        
        setExportData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar")
      } finally {
        setLoading(false)
      }
    }

    fetchExport()
  }, [id])

  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-foreground">No se pudo cargar la convocatoria</p>
          <p className="text-sm text-muted-foreground">ID no encontrado</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Cargando convocatoria...</p>
        </div>
      </div>
    )
  }

  if (error || !exportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-foreground">No se pudo cargar la convocatoria</p>
          <p className="text-sm text-muted-foreground">{error || "El link puede haber expirado"}</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <SharePageContent exportData={exportData} />
    </ErrorBoundary>
  )
}
