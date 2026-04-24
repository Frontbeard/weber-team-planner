"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useTeamStore, type BlockPlay, type CornerToken, type DrawingPath, type DrawingShape, type ShapeType } from "@/lib/team-store"
import { Copy, Trash2, Plus, Pencil, Check, RotateCcw, Users, Square, Circle, Triangle, Minus, ArrowRight, Move } from "lucide-react"

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
function BlockBoardPanel({ board, canDelete, bw }: { board: BlockPlay; canDelete: boolean; bw: boolean }) {
  const {
    players, citedPlayers,
    updateBlockPlay, removeBlockPlay,
    blockPlays,
  } = useTeamStore()

  const [isEditing, setIsEditing] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(board.name)
  const [descVal, setDescVal] = useState(board.description)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [currentDrawing, setCurrentDrawing] = useState<{ x: number; y: number }[]>([])
  const [drawColor, setDrawColor] = useState("#ffff00") // Yellow by default
  const [strokeWidth, setStrokeWidth] = useState(3) // Default stroke width
  const [drawMode, setDrawMode] = useState<"freehand" | ShapeType>("freehand")
  const [shapeOpacity, setShapeOpacity] = useState(0.5)
  const [shapeRotation, setShapeRotation] = useState(0)
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null)
  const [shapePreview, setShapePreview] = useState<{ x: number; y: number } | null>(null)
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
  const [resizingShape, setResizingShape] = useState<{ id: string; corner: string } | null>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  const localIdRef = useRef(0)
  const nextLocalId = () => {
    localIdRef.current += 1
    return localIdRef.current
  }

  const STROKE_WIDTHS = [
    { value: 2, name: "Fino" },
    { value: 3, name: "Normal" },
    { value: 5, name: "Grueso" },
    { value: 8, name: "Extra" },
  ]
  
  const DRAW_COLORS = [
    { color: "#ffff00", name: "Amarillo" },
    { color: "#ff0000", name: "Rojo" },
    { color: "#00ff00", name: "Verde" },
    { color: "#ffffff", name: "Blanco" },
    { color: "#ff00ff", name: "Fucsia" },
    { color: "#00ffff", name: "Celeste" },
  ]

  const SHAPE_TOOLS: { type: ShapeType | "freehand"; icon: React.ReactNode; name: string }[] = [
    { type: "freehand", icon: <Pencil className="w-3.5 h-3.5" />, name: "Libre" },
    { type: "rectangle", icon: <Square className="w-3.5 h-3.5" />, name: "Rectángulo" },
    { type: "circle", icon: <Circle className="w-3.5 h-3.5" />, name: "Círculo" },
    { type: "triangle", icon: <Triangle className="w-3.5 h-3.5" />, name: "Triángulo" },
    { type: "line", icon: <Minus className="w-3.5 h-3.5" />, name: "Línea" },
    { type: "arrow", icon: <ArrowRight className="w-3.5 h-3.5" />, name: "Flecha" },
    { type: "ball", icon: <Circle className="w-3 h-3 fill-white stroke-gray-500" />, name: "Bocha" },
    { type: "banana", icon: <img src="/banana.png" alt="" className="w-4 h-4 object-contain" />, name: "Banana" },
  ]

  const ROTATION_OPTIONS = [
    { value: 0, name: "0°" },
    { value: 45, name: "45°" },
    { value: 90, name: "90°" },
    { value: 135, name: "135°" },
    { value: 180, name: "180°" },
    { value: -45, name: "-45°" },
    { value: -90, name: "-90°" },
  ]

  const OPACITY_OPTIONS = [
    { value: 0.3, name: "30%" },
    { value: 0.5, name: "50%" },
    { value: 0.7, name: "70%" },
    { value: 1, name: "100%" },
  ]

  const onFieldIds = board.tokens.map(p => p.id)
  const tokensOnField = board.tokens
  const availablePlayers = citedPlayers.filter(p => !tokensOnField.some(t => t.label === String(p.dorsalNumber)))

  const getPlayer = (dorsal: string) => players.find(p => String(p.dorsalNumber) === dorsal)

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
    updateBlockPlay(board.id, {
      tokens: board.tokens.map(t => t.id === draggingId ? { ...t, ...pos } : t)
    })
  }, [draggingId, calcPos, board, updateBlockPlay])

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

  const addToField = (pid: string, dorsal: number) => {
    const newToken: CornerToken = {
      id: `token-${nextLocalId()}`,
      x: 50,
      y: 50,
      label: String(dorsal),
      type: "attacker"
    }
    updateBlockPlay(board.id, { tokens: [...board.tokens, newToken] })
  }

  const addOpponent = () => {
    const opponentCount = board.tokens.filter(t => t.type === "opponent").length
    const newToken: CornerToken = {
      id: `opp-${nextLocalId()}`,
      x: 60,
      y: 40,
      label: String(opponentCount + 1),
      type: "opponent"
    }
    updateBlockPlay(board.id, { tokens: [...board.tokens, newToken] })
  }

  const removeFromField = (tokenId: string) => {
    updateBlockPlay(board.id, { tokens: board.tokens.filter(t => t.id !== tokenId) })
  }

  const saveName = () => {
    updateBlockPlay(board.id, { name: nameVal || board.name, description: descVal })
    setEditingName(false)
  }

  const handleDrawStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !fieldRef.current) return
    e.preventDefault()
    const pos = calcPos(
      'touches' in e ? e.touches[0].clientX : e.clientX,
      'touches' in e ? e.touches[0].clientY : e.clientY
    )
    if (pos) setCurrentDrawing([pos])
  }

  const handleDrawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || currentDrawing.length === 0 || !fieldRef.current) return
    e.preventDefault()
    const pos = calcPos(
      'touches' in e ? e.touches[0].clientX : e.clientX,
      'touches' in e ? e.touches[0].clientY : e.clientY
    )
    if (pos) setCurrentDrawing(prev => [...prev, pos])
  }

  const handleDrawEnd = () => {
    if (drawMode === "freehand" && currentDrawing.length > 1) {
      const newPath: DrawingPath = {
        id: `path-${nextLocalId()}`,
        points: currentDrawing,
        color: drawColor,
        strokeWidth: strokeWidth
      }
      updateBlockPlay(board.id, { drawings: [...board.drawings, newPath] })
    }
    setCurrentDrawing([])
  }

  // Shape handling
  const handleShapeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || drawMode === "freehand" || !fieldRef.current) return
    e.preventDefault()
    const pos = calcPos(
      'touches' in e ? e.touches[0].clientX : e.clientX,
      'touches' in e ? e.touches[0].clientY : e.clientY
    )
    if (pos) {
      setShapeStart(pos)
      setShapePreview(pos)
    }
  }

  const handleShapeMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!shapeStart || !fieldRef.current) return
    const pos = calcPos(
      'touches' in e ? e.touches[0].clientX : e.clientX,
      'touches' in e ? e.touches[0].clientY : e.clientY
    )
    if (pos) setShapePreview(pos)
  }

  const handleShapeEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!shapeStart || !fieldRef.current) {
      setShapeStart(null)
      setShapePreview(null)
      return
    }
    const pos = calcPos(
      'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX,
      'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY
    )
    if (!pos) { 
      setShapeStart(null)
      setShapePreview(null)
      return 
    }

    const width = Math.abs(pos.x - shapeStart.x)
    const height = Math.abs(pos.y - shapeStart.y)
    
    if (width < 2 && height < 2) { 
      setShapeStart(null)
      setShapePreview(null)
      return 
    }

    const newShape: DrawingShape = {
      id: `shape-${nextLocalId()}`,
      type: drawMode as ShapeType,
      x: Math.min(shapeStart.x, pos.x),
      y: Math.min(shapeStart.y, pos.y),
      width: Math.max(width, 5),
      height: drawMode === "ball" ? Math.max(width, 5) : Math.max(height, 5), // ball keeps aspect ratio
      color: drawColor,
      opacity: drawMode === "ball" ? 1 : shapeOpacity,
      rotation: shapeRotation,
    }
    updateBlockPlay(board.id, { shapes: [...(board.shapes || []), newShape] })
    setShapeStart(null)
    setShapePreview(null)
  }

  const removeShape = (shapeId: string) => {
    updateBlockPlay(board.id, { shapes: (board.shapes || []).filter(s => s.id !== shapeId) })
    setSelectedShapeId(null)
  }

  const updateShape = (shapeId: string, updates: Partial<DrawingShape>) => {
    updateBlockPlay(board.id, {
      shapes: (board.shapes || []).map(s => s.id === shapeId ? { ...s, ...updates } : s)
    })
  }

  const clearDrawings = () => {
    updateBlockPlay(board.id, { drawings: [], shapes: [] })
  }

  const canClone = blockPlays.length < 5

  const tokenBg = (isOpponent: boolean) => {
    if (bw) return isOpponent ? "#333" : "#666"
    return isOpponent ? "#000000" : "#3b82f6"
  }

  return (
    <div className="bento-card shadow-xl flex flex-col">
      {/* Board header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/5 bg-card/60">
        <div className="flex items-center gap-2 min-w-0 order-1 sm:order-none">
          {editingName ? (
            <div className="flex items-center gap-1.5 flex-1">
              <input
                autoFocus
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveName()}
                className="bg-secondary text-foreground text-xs sm:text-sm font-semibold rounded-lg px-2 py-1 border border-primary/50 outline-none w-24 sm:w-36"
                placeholder="Nombre"
              />
              <button onClick={saveName} className="p-1 rounded-lg bg-success text-success-foreground hover:opacity-80 shrink-0">
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setNameVal(board.name); setDescVal(board.description); setEditingName(true) }}
              className="flex items-center gap-1 group min-w-0"
            >
              <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[100px] sm:max-w-[140px]">{board.name}</span>
              <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 order-2 sm:order-none">
          {canDelete && (
            <button
              onClick={() => removeBlockPlay(board.id)}
              className="p-1 sm:p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
          <button
            onClick={() => { setIsEditing(e => !e); setIsDrawing(false); setDraggingId(null) }}
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

      {/* Mode bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-secondary/20 border-b border-border/20">
        <div className="flex bg-secondary/60 rounded-xl p-0.5 gap-0.5">
          <button
            onClick={() => { setIsDrawing(false) }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              !isDrawing ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Fichas
          </button>
          <button
            onClick={() => { setIsDrawing(true); setIsEditing(false) }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              isDrawing ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dibujar
          </button>
        </div>
        {isDrawing && (
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Shape tools */}
            <div className="flex items-center gap-0.5 bg-secondary/40 rounded-lg p-0.5">
              {SHAPE_TOOLS.map(tool => (
                <button
                  key={tool.type}
                  onClick={() => setDrawMode(tool.type)}
                  className={`p-1.5 sm:p-2 rounded-md transition-all ${
                    drawMode === tool.type ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                  title={tool.name}
                >
                  {tool.icon}
                </button>
              ))}
            </div>

            {/* Colors */}
            <div className="flex items-center gap-1">
              {DRAW_COLORS.map(c => (
                <button
                  key={c.color}
                  onClick={() => setDrawColor(c.color)}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all ${
                    drawColor === c.color ? "border-white scale-110 shadow-lg" : "border-white/30 hover:border-white/60"
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>

            {/* Stroke width (for freehand/line/arrow) */}
            {(drawMode === "freehand" || drawMode === "line" || drawMode === "arrow") && (
              <div className="flex items-center gap-1 border-l border-border/30 pl-2">
                <span className="text-[10px] text-muted-foreground mr-1">Grosor:</span>
                {STROKE_WIDTHS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setStrokeWidth(s.value)}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center transition-all ${
                      strokeWidth === s.value ? "bg-white text-black shadow-lg" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                    }`}
                    title={s.name}
                  >
                    <div className="rounded-full bg-current" style={{ width: s.value * 1.2, height: s.value * 1.2 }} />
                  </button>
                ))}
              </div>
            )}

            {/* Opacity (for shapes except ball) */}
            {drawMode !== "freehand" && drawMode !== "ball" && (
              <div className="flex items-center gap-1 border-l border-border/30 pl-2">
                <span className="text-[10px] text-muted-foreground mr-1">Opacidad:</span>
                {OPACITY_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setShapeOpacity(o.value)}
                    className={`px-1.5 py-0.5 text-[10px] rounded-md transition-all ${
                      shapeOpacity === o.value ? "bg-white text-black shadow-lg" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                    }`}
                    title={o.name}
                  >
                    {o.name}
                  </button>
                ))}
              </div>
            )}

            {/* Rotation (for shapes that support it) */}
            {drawMode !== "freehand" && drawMode !== "ball" && (
              <div className="flex items-center gap-1 border-l border-border/30 pl-2">
                <span className="text-[10px] text-muted-foreground mr-1">Rotación:</span>
                {ROTATION_OPTIONS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setShapeRotation(r.value)}
                    className={`px-1.5 py-0.5 text-[10px] rounded-md transition-all ${
                      shapeRotation === r.value ? "bg-white text-black shadow-lg" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                    }`}
                    title={r.name}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            )}

            {/* Clear button */}
            {(board.drawings.length > 0 || (board.shapes || []).length > 0) && (
              <button
                onClick={clearDrawings}
                className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10"
              >
                <RotateCcw className="w-3 h-3" /> Borrar todo
              </button>
            )}
          </div>
        )}
        {isEditing && !isDrawing && (
          <button
            onClick={() => updateBlockPlay(board.id, { tokens: [] })}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10"
          >
            <RotateCcw className="w-3 h-3" /> Limpiar fichas
          </button>
        )}
      </div>

      {/* Description */}
      {editingName && (
        <div className="px-3 sm:px-4 py-2 bg-secondary/10 border-b border-border/20">
          <textarea
            value={descVal}
            onChange={e => setDescVal(e.target.value)}
            placeholder="Descripción del bloqueo..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-border/30 bg-secondary/30 text-xs resize-none"
          />
        </div>
      )}
      {!editingName && board.description && (
        <div className="px-3 sm:px-4 py-2 bg-secondary/10 border-b border-border/20">
          <p className="text-xs text-muted-foreground">{board.description}</p>
        </div>
      )}

      {/* Field + bench */}
      <div className="flex flex-1">
        {/* Field */}
        <div className="flex-1 p-1 sm:p-1.5 max-w-md mx-auto">
          <div
            ref={fieldRef}
            className={`relative w-full overflow-hidden select-none ${isDrawing ? "cursor-crosshair" : ""}`}
            style={{ aspectRatio: "91/150" }}
            onMouseDown={e => { drawMode === "freehand" ? handleDrawStart(e) : handleShapeStart(e) }}
            onMouseMove={e => { drawMode === "freehand" ? handleDrawMove(e) : handleShapeMove(e) }}
            onMouseUp={e => { drawMode === "freehand" ? handleDrawEnd() : handleShapeEnd(e) }}
            onMouseLeave={e => { drawMode === "freehand" ? handleDrawEnd() : (setShapeStart(null), setShapePreview(null)) }}
            onTouchStart={e => { drawMode === "freehand" ? handleDrawStart(e) : handleShapeStart(e) }}
            onTouchMove={e => { drawMode === "freehand" ? handleDrawMove(e) : handleShapeMove(e) }}
            onTouchEnd={e => { drawMode === "freehand" ? handleDrawEnd() : handleShapeEnd(e) }}
          >
            <HockeyField />

            {/* Drawings SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {board.drawings.map(drawing => (
                <polyline
                  key={drawing.id}
                  points={drawing.points.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke={drawing.color}
                  strokeWidth={drawing.strokeWidth || 3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {currentDrawing.length > 0 && (
                <polyline
                  points={currentDrawing.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke={drawColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </svg>

            {/* Shapes */}
            {(board.shapes || []).map(shape => (
              <div
                key={shape.id}
                className={`absolute cursor-move ${selectedShapeId === shape.id ? "ring-2 ring-white" : ""}`}
                style={{
                  left: `${shape.x}%`,
                  top: `${shape.y}%`,
                  width: `${shape.width}%`,
                  height: `${shape.height}%`,
                  opacity: shape.opacity,
                  transform: `rotate(${shape.rotation || 0}deg)`,
                }}
                onClick={e => { e.stopPropagation(); if (isDrawing) setSelectedShapeId(shape.id) }}
              >
                {shape.type === "rectangle" && (
                  <div className="w-full h-full rounded-sm" style={{ backgroundColor: shape.color }} />
                )}
                {shape.type === "circle" && (
                  <div className="w-full h-full rounded-full" style={{ backgroundColor: shape.color }} />
                )}
                {shape.type === "triangle" && (
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,0 100,100 0,100" fill={shape.color} />
                  </svg>
                )}
                {shape.type === "line" && (
                  <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    <line x1="0" y1="50" x2="100" y2="50" stroke={shape.color} strokeWidth={strokeWidth} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  </svg>
                )}
                {shape.type === "arrow" && (
                  <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <marker id={`arrowhead-${shape.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill={shape.color} />
                      </marker>
                    </defs>
                    <line x1="0" y1="50" x2="90" y2="50" stroke={shape.color} strokeWidth={strokeWidth} markerEnd={`url(#arrowhead-${shape.id})`} vectorEffect="non-scaling-stroke" />
                  </svg>
                )}
                {shape.type === "ball" && (
                  <div className="w-full h-full rounded-full bg-white border-2 border-gray-400 shadow-md" />
                )}
                {shape.type === "banana" && (
                  <img src="/banana.png" alt="Banana" className="w-full h-full object-contain" draggable={false} />
                )}
                {/* Delete button when selected */}
                {selectedShapeId === shape.id && isDrawing && (
                  <button
                    onClick={e => { e.stopPropagation(); removeShape(shape.id) }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg hover:scale-110 transition-transform"
                  >
                    ×
                  </button>
                )}
                {/* Resize handles when selected */}
                {selectedShapeId === shape.id && isDrawing && (
                  <>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-black rounded-sm cursor-se-resize"
                      onMouseDown={e => { e.stopPropagation(); setResizingShape({ id: shape.id, corner: "se" }) }}
                    />
                  </>
                )}
              </div>
            ))}

            {/* Shape preview while drawing - muestra la forma real en tiempo real */}
            {shapeStart && shapePreview && drawMode !== "freehand" && (() => {
              const previewW = Math.max(Math.abs(shapePreview.x - shapeStart.x), 2)
              const previewH = drawMode === "ball" ? previewW : Math.max(Math.abs(shapePreview.y - shapeStart.y), 2)
              return (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${Math.min(shapeStart.x, shapePreview.x)}%`,
                  top: `${Math.min(shapeStart.y, shapePreview.y)}%`,
                  width: `${previewW}%`,
                  height: `${previewH}%`,
                  opacity: drawMode === "ball" ? 1 : shapeOpacity,
                  transform: `rotate(${shapeRotation}deg)`,
                }}
              >
                {drawMode === "rectangle" && (
                  <div className="w-full h-full rounded-sm border-2 border-dashed border-white/70" style={{ backgroundColor: `${drawColor}80` }} />
                )}
                {drawMode === "circle" && (
                  <div className="w-full h-full rounded-full border-2 border-dashed border-white/70" style={{ backgroundColor: `${drawColor}80` }} />
                )}
                {drawMode === "triangle" && (
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,0 100,100 0,100" fill={`${drawColor}80`} stroke="white" strokeWidth="2" strokeDasharray="5,5" />
                  </svg>
                )}
                {drawMode === "line" && (
                  <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    <line x1="0" y1="50" x2="100" y2="50" stroke={drawColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray="5,5" vectorEffect="non-scaling-stroke" />
                  </svg>
                )}
                {drawMode === "arrow" && (
                  <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <marker id="arrowhead-preview" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill={drawColor} />
                      </marker>
                    </defs>
                    <line x1="0" y1="50" x2="90" y2="50" stroke={drawColor} strokeWidth={strokeWidth} markerEnd="url(#arrowhead-preview)" strokeDasharray="5,5" vectorEffect="non-scaling-stroke" />
                  </svg>
                )}
                {drawMode === "ball" && (
                  <div className="w-full h-full rounded-full bg-white/80 border-2 border-dashed border-gray-400" />
                )}
                {drawMode === "banana" && (
                  <img src="/banana.png" alt="" className="w-full h-full object-contain opacity-70" draggable={false} />
                )}
              </div>
            )})()}

            {/* Tokens */}
            {board.tokens.map(token => {
              const player = token.type !== "opponent" ? getPlayer(token.label) : null
              const isOpponent = token.type === "opponent"
              const isDragging = draggingId === token.id
              const bg = tokenBg(isOpponent)

              return (
                <div
                  key={token.id}
                  className={`absolute flex flex-col items-center transition-transform duration-75 ${
                    isEditing && !isDrawing ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                  } ${isDragging ? "scale-110 z-50" : "z-10"}`}
                  style={{ left: `${token.x}%`, top: `${token.y}%`, transform: "translate(-50%,-50%)" }}
                  onMouseDown={e => { if (!isEditing || isDrawing) return; e.preventDefault(); e.stopPropagation(); setDraggingId(token.id) }}
                  onTouchStart={e => { if (!isEditing || isDrawing) return; e.stopPropagation(); setDraggingId(token.id) }}
                >
                  {/* Circle token */}
                  <div
                    className="relative w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white/50"
                    style={{ backgroundColor: bg }}
                  >
                    <span className={`text-[10px] sm:text-xs font-bold ${isOpponent ? "text-white" : "text-black"}`}>{token.label}</span>
                    {isEditing && !isDrawing && (
                      <button
                        onMouseDown={e => e.stopPropagation()}
                        onClick={() => removeFromField(token.id)}
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-bold shadow hover:opacity-80"
                      >
                        x
                      </button>
                    )}
                  </div>
                  {/* Name label below */}
                  {player && (
                    <span 
                      className="mt-0.5 sm:mt-1 px-1 sm:px-1.5 py-0.5 text-[7px] sm:text-[9px] md:text-[10px] font-bold text-white whitespace-nowrap uppercase tracking-wide max-w-[50px] sm:max-w-[70px] truncate"
                      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)" }}
                    >
                      {player.firstName || player.lastName}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            {board.tokens.filter(t => t.type !== "opponent").length} jugadoras | {board.tokens.filter(t => t.type === "opponent").length} rivales
          </p>
        </div>

        {/* Bench (only in edit mode) */}
        {isEditing && !isDrawing && (
          <div className="w-28 sm:w-36 md:w-44 border-l border-border/30 bg-secondary/10 flex flex-col">
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 border-b border-border/20">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold text-foreground">Citadas</span>
              <span className="ml-auto text-[10px] sm:text-xs text-muted-foreground bg-secondary px-1 sm:px-1.5 py-0.5 rounded-full">{availablePlayers.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1 sm:space-y-1.5 max-h-64 sm:max-h-80">
              {/* Add opponent button */}
              <button
                onClick={addOpponent}
                className="w-full flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-black/20 hover:bg-black/30 rounded-lg sm:rounded-xl border border-transparent hover:border-black/30 transition-all group"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full shrink-0 border-2 border-white/30 bg-black flex items-center justify-center">
                  <span className="text-white text-[8px] sm:text-[10px] font-bold">+</span>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-semibold text-foreground">Rival</p>
                </div>
              </button>
              
              <div className="h-px bg-border/30 my-1" />
              
              {availablePlayers.length === 0 ? (
                <p className="text-[10px] sm:text-xs text-muted-foreground text-center py-4">{citedPlayers.length === 0 ? "Cita jugadoras primero" : "Todas en cancha"}</p>
              ) : availablePlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => addToField(player.id, player.dorsalNumber)}
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
export function BlockPlaysCard() {
  const { blockPlays, addBlockPlay, bwMode } = useTeamStore()
  const [activeIdx, setActiveIdx] = useState(0)

  const handleAddBlock = () => {
    const newPlay: Omit<BlockPlay, "id"> = {
      name: `Bloqueo ${blockPlays.length + 1}`,
      description: "",
      tokens: [],
      drawings: [],
      shapes: [],
    }
    addBlockPlay(newPlay)
  }

  const idx = Math.min(activeIdx, blockPlays.length - 1)

  return (
    <div className="space-y-4">
      {/* Board tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap overflow-x-auto pb-1">
        {blockPlays.map((b, i) => (
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
        {blockPlays.length < 5 && (
          <button
            onClick={handleAddBlock}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground border border-dashed border-border/50 hover:border-primary/50 hover:text-primary transition-all whitespace-nowrap"
          >
            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Nuevo bloqueo</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        )}
        {blockPlays.length >= 5 && (
          <span className="text-xs text-muted-foreground px-2">Máximo 5 bloqueos</span>
        )}
      </div>

      {/* Active board */}
      {blockPlays[idx] ? (
        <BlockBoardPanel
          board={blockPlays[idx]}
          canDelete={blockPlays.length > 1}
          bw={bwMode}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-border/40 bg-secondary/10 p-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">No hay bloqueos creados</p>
          <button
            onClick={handleAddBlock}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Crear primer bloqueo
          </button>
        </div>
      )}
    </div>
  )
}
