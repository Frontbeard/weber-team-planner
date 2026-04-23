"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

export interface Player {
  id: string
  firstName: string
  lastName: string
  dorsalNumber: number
  position?: string
  isCited: boolean
  isInjured?: boolean
}

export interface MatchInfo {
  date: string
  time: string
  opponent: string
  opponentLogo?: string
  location: "local" | "visitante"
  matchday: string
  tournament: string
  round: string
}

export interface PlayerPosition {
  playerId: string
  x: number
  y: number
}

export interface FormationBoard {
  id: string
  name: string
  positions: PlayerPosition[]
}

export interface FormationPreset {
  name: string
  positions: { x: number; y: number }[]
}

export interface CornerPlay {
  id: string
  name: string
  description: string
  tokens: CornerToken[]
  drawings: DrawingPath[]
  shapes: DrawingShape[]
  }
  
  export interface CornerToken {
  id: string
  x: number
  y: number
  label: string
  type: "attacker" | "defender" | "ball" | "opponent"
}

export interface DefensiveCornerPlay {
  id: string
  name: string
  description: string
  tokens: CornerToken[]
  drawings: DrawingPath[]
  shapes: DrawingShape[]
}

export interface BlockPlay {
  id: string
  name: string
  description: string
  tokens: CornerToken[]
  drawings: DrawingPath[]
  shapes: DrawingShape[]
}

export interface DrawingPath {
  id: string
  points: { x: number; y: number }[]
  color: string
  strokeWidth: number
}

export type ShapeType = "rectangle" | "circle" | "triangle" | "line" | "arrow" | "banana" | "ball"

export interface DrawingShape {
  id: string
  type: ShapeType
  x: number
  y: number
  width: number
  height: number
  color: string
  opacity: number
  rotation?: number
}

export interface ScoutingNote {
  id: string
  fixtureId: string
  content: string
  createdAt: string
  updatedAt: string
}

export type UniformColor = "blue-fuchsia" | "blue-yellow"

export type CamisetaType = "oficial" | "alternativa"
export type PolleraType = "pollera"
export type MediasType = "oficial" | "fucsia" | "azul"

export interface MatchUniform {
  camiseta: CamisetaType
  pollera: PolleraType
  medias: MediasType
}

export interface Fixture {
  id: string
  date: string
  time: string
  opponent: string
  opponentLogo?: string
  location: "local" | "visitante"
  matchday: string
  tournament: string
  mapUrl?: string
  isBye?: boolean
  uniform?: MatchUniform
}

interface TeamStoreContextType {
  players: Player[]
  matchInfo: MatchInfo
  formationBoards: FormationBoard[]
  cornerPlays: CornerPlay[]
  uniformColor: UniformColor
  fixtures: Fixture[]
  bwMode: boolean
  selectedFixtureId: string | null
  defensiveCornerPlays: DefensiveCornerPlay[]
  blockPlays: BlockPlay[]
  scoutingNotes: ScoutingNote[]
  isLoading: boolean

  updatePlayer: (id: string, updates: Partial<Player>) => void
  addPlayer: (player: Omit<Player, "id">) => void
  removePlayer: (id: string) => void
  updateMatchInfo: (updates: Partial<MatchInfo>) => void

  addFormationBoard: () => void
  removeFormationBoard: (id: string) => void
  cloneFormationBoard: (id: string) => void
  updateBoardPositions: (boardId: string, positions: PlayerPosition[]) => void
  applyPresetToBoard: (boardId: string, preset: FormationPreset) => void
  renameBoardLabel: (boardId: string, name: string) => void

  addCornerPlay: (play: Omit<CornerPlay, "id">) => void
  updateCornerPlay: (id: string, updates: Partial<CornerPlay>) => void
  removeCornerPlay: (id: string) => void

  addDefensiveCornerPlay: (play: Omit<DefensiveCornerPlay, "id">) => void
  updateDefensiveCornerPlay: (id: string, updates: Partial<DefensiveCornerPlay>) => void
  removeDefensiveCornerPlay: (id: string) => void

  addBlockPlay: (play: Omit<BlockPlay, "id">) => void
  updateBlockPlay: (id: string, updates: Partial<BlockPlay>) => void
  removeBlockPlay: (id: string) => void

  addScoutingNote: (note: Omit<ScoutingNote, "id" | "createdAt" | "updatedAt">) => void
  updateScoutingNote: (id: string, content: string) => void
  removeScoutingNote: (id: string) => void
  getScoutingNote: (fixtureId: string) => ScoutingNote | undefined

  setUniformColor: (color: UniformColor) => void
  setBwMode: (val: boolean) => void
  setSelectedFixtureId: (id: string | null) => void
  updateFixtureUniform: (fixtureId: string, uniform: MatchUniform) => void
  getFixtureUniform: (fixtureId: string) => MatchUniform

  citedPlayers: Player[]
  teamLogo: string
}

const TeamStoreContext = createContext<TeamStoreContextType | undefined>(undefined)

const initialMatchInfo: MatchInfo = {
  date: "2026-03-21",
  time: "15:00",
  opponent: "LICEO",
  location: "local",
  matchday: "FECHA 2",
  tournament: "METROPOLITANO A",
  round: "RUEDA 1",
}

export const FORMATION_PRESETS: FormationPreset[] = [
  {
    name: "4-3-3",
    positions: [
      { x: 50, y: 88 },
      { x: 20, y: 70 }, { x: 40, y: 70 }, { x: 60, y: 70 }, { x: 80, y: 70 },
      { x: 28, y: 48 }, { x: 50, y: 48 }, { x: 72, y: 48 },
      { x: 20, y: 22 }, { x: 50, y: 18 }, { x: 80, y: 22 },
    ],
  },
  {
    name: "4-4-2",
    positions: [
      { x: 50, y: 88 },
      { x: 15, y: 70 }, { x: 38, y: 70 }, { x: 62, y: 70 }, { x: 85, y: 70 },
      { x: 15, y: 48 }, { x: 38, y: 48 }, { x: 62, y: 48 }, { x: 85, y: 48 },
      { x: 35, y: 22 }, { x: 65, y: 22 },
    ],
  },
  {
    name: "3-4-3",
    positions: [
      { x: 50, y: 88 },
      { x: 25, y: 70 }, { x: 50, y: 70 }, { x: 75, y: 70 },
      { x: 15, y: 50 }, { x: 38, y: 50 }, { x: 62, y: 50 }, { x: 85, y: 50 },
      { x: 20, y: 22 }, { x: 50, y: 18 }, { x: 80, y: 22 },
    ],
  },
  {
    name: "3-3-4",
    positions: [
      { x: 50, y: 88 },
      { x: 25, y: 70 }, { x: 50, y: 70 }, { x: 75, y: 70 },
      { x: 25, y: 50 }, { x: 50, y: 50 }, { x: 75, y: 50 },
      { x: 15, y: 22 }, { x: 38, y: 18 }, { x: 62, y: 18 }, { x: 85, y: 22 },
    ],
  },
]

export function TeamStoreProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([])
  const [matchInfo, setMatchInfo] = useState<MatchInfo>(initialMatchInfo)
  const [formationBoards, setFormationBoards] = useState<FormationBoard[]>([])
  const [cornerPlays, setCornerPlays] = useState<CornerPlay[]>([])
  const [uniformColor, setUniformColorState] = useState<UniformColor>("blue-fuchsia")
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [bwMode, setBwModeState] = useState(false)
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null)
  const [defensiveCornerPlays, setDefensiveCornerPlays] = useState<DefensiveCornerPlay[]>([])
  const [blockPlays, setBlockPlays] = useState<BlockPlay[]>([])
  const [scoutingNotes, setScoutingNotes] = useState<ScoutingNote[]>([])
  const [fixtureUniforms, setFixtureUniforms] = useState<Record<string, MatchUniform>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [clubId, setClubId] = useState<string | null>(null)

  const teamLogo = "/escudo.png"
  const supabase = createClient()

  // Load initial data from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("team_id, club_id")
        .eq("user_id", user.id)
        .single()

      if (!profile?.team_id) { setIsLoading(false); return }
      setTeamId(profile.team_id)
      setClubId(profile.club_id)
      const TEAM_ID = profile.team_id

      // Load players
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", TEAM_ID)
        .order("dorsal_number")
      
      if (playersData) {
        setPlayers(playersData.map(p => ({
          id: p.id,
          firstName: p.first_name,
          lastName: p.last_name,
          dorsalNumber: p.dorsal_number,
          position: p.position || undefined,
          isCited: p.is_cited || false,
        })))
      }

      // Load fixtures
      const { data: fixturesData, error: fixturesError } = await supabase
        .from("fixtures")
        .select("*")
        .eq("team_id", TEAM_ID)
        .order("date")
      
      if (fixturesData) {
        setFixtures(fixturesData.map(f => ({
          id: f.id,
          date: f.date,
          time: f.time,
          opponent: f.opponent,
          opponentLogo: f.opponent_logo || undefined,
          location: f.location as "local" | "visitante",
          matchday: f.matchday || "",
          tournament: "METROPOLITANO A",
          mapUrl: f.maps_url || undefined,
          isBye: f.is_bye || false,
        })))
      }

      // Load formation boards
      const { data: boardsData, error: boardsError } = await supabase
        .from("formation_boards")
        .select("*")
        .eq("team_id", TEAM_ID)
        .order("sort_order")
      
      if (boardsData && boardsData.length > 0) {
        setFormationBoards(boardsData.map(b => ({
          id: b.id,
          name: b.name,
          positions: (b.positions as PlayerPosition[]) || [],
        })))
      } else {
        // Create default board
        const { data: newBoard } = await supabase
          .from("formation_boards")
          .insert({ team_id: TEAM_ID, name: "Formación 1", positions: [], sort_order: 0 })
          .select()
          .single()
        
        if (newBoard) {
          setFormationBoards([{ id: newBoard.id, name: newBoard.name, positions: [] }])
        }
      }

      // Load corner plays
      const { data: cornersData, error: cornersError } = await supabase
        .from("corner_plays")
        .select("*")
        .eq("team_id", TEAM_ID)
        .order("sort_order")
      
  if (cornersData) {
    setCornerPlays(cornersData.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || "",
      tokens: (c.tokens as CornerToken[]) || [],
      drawings: (c.drawings as DrawingPath[]) || [],
      shapes: (c.shapes as DrawingShape[]) || [],
    })))
  }

      // Load defensive corner plays
      const { data: defCornersData } = await supabase
        .from("defensive_corner_plays")
        .select("*")
        .eq("team_id", TEAM_ID)
        .order("sort_order")
      
  if (defCornersData) {
    setDefensiveCornerPlays(defCornersData.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || "",
      tokens: (c.tokens as CornerToken[]) || [],
      drawings: (c.drawings as DrawingPath[]) || [],
      shapes: (c.shapes as DrawingShape[]) || [],
    })))
  }

      // Load block plays
      const { data: blocksData } = await supabase
        .from("block_plays")
        .select("*")
        .eq("team_id", TEAM_ID)
        .order("sort_order")
      
      if (blocksData) {
        setBlockPlays(blocksData.map(b => ({
          id: b.id,
          name: b.name,
          description: b.description || "",
          tokens: (b.tokens as CornerToken[]) || [],
          drawings: (b.drawings as DrawingPath[]) || [],
          shapes: (b.shapes as DrawingShape[]) || [],
        })))
      }

      // Load scouting notes
      const { data: notesData } = await supabase
        .from("scouting_notes")
        .select("*")
        .eq("team_id", TEAM_ID)
      
      if (notesData) {
        setScoutingNotes(notesData.map(n => ({
          id: n.id,
          fixtureId: n.fixture_id,
          content: n.content || "",
          createdAt: n.created_at,
          updatedAt: n.updated_at,
        })))
      }

      // Load fixture uniforms
      const { data: uniformsData } = await supabase
        .from("fixture_uniforms")
        .select("*")
        .eq("team_id", TEAM_ID)
      
      if (uniformsData) {
        const uniforms: Record<string, MatchUniform> = {}
        uniformsData.forEach(u => {
          uniforms[u.fixture_id] = {
            camiseta: u.camiseta as CamisetaType,
            pollera: u.pollera as PolleraType,
            medias: u.medias as MediasType,
          }
        })
        setFixtureUniforms(uniforms)
      }

    } catch (error) {
      console.error("[Stick Planner] Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Initial load
  useEffect(() => {
    const id = window.setTimeout(() => { void loadData() }, 0)
    return () => window.clearTimeout(id)
  }, [loadData])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!teamId) return

    const channel = supabase
      .channel("team-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `team_id=eq.${teamId}` }, () => {
        loadData()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "formation_boards", filter: `team_id=eq.${teamId}` }, () => {
        loadData()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "corner_plays", filter: `team_id=eq.${teamId}` }, () => {
        loadData()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "defensive_corner_plays", filter: `team_id=eq.${teamId}` }, () => {
        loadData()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "block_plays", filter: `team_id=eq.${teamId}` }, () => {
        loadData()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "fixture_uniforms", filter: `team_id=eq.${teamId}` }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, loadData, teamId])

  // Player operations
  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    
    const dbUpdates: Record<string, unknown> = {}
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName
    if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName
    if (updates.dorsalNumber !== undefined) dbUpdates.dorsal_number = updates.dorsalNumber
    if (updates.position !== undefined) dbUpdates.position = updates.position
    if (updates.isCited !== undefined) dbUpdates.is_cited = updates.isCited
    
    await supabase.from("players").update(dbUpdates).eq("id", id)
  }

  const addPlayer = async (player: Omit<Player, "id">) => {
    if (!teamId) return
    const { data } = await supabase
      .from("players")
      .insert({
        team_id: teamId,
        first_name: player.firstName,
        last_name: player.lastName,
        dorsal_number: player.dorsalNumber,
        position: player.position,
        is_cited: player.isCited,
      })
      .select()
      .single()
    
    if (data) {
      setPlayers(prev => [...prev, {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        dorsalNumber: data.dorsal_number,
        position: data.position || undefined,
        isCited: data.is_cited || false,
      }])
    }
  }

  const removePlayer = async (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id))
    setFormationBoards(prev => prev.map(b => ({
      ...b,
      positions: b.positions.filter(p => p.playerId !== id)
    })))
    await supabase.from("players").delete().eq("id", id)
  }

  const updateMatchInfo = (updates: Partial<MatchInfo>) => {
    setMatchInfo(prev => ({ ...prev, ...updates }))
  }

  // Formation board operations
  const addFormationBoard = async () => {
    if (formationBoards.length >= 5) return
    if (!teamId) return
    
    const { data } = await supabase
      .from("formation_boards")
      .insert({
        team_id: teamId,
        name: `Formación ${formationBoards.length + 1}`,
        positions: [],
        sort_order: formationBoards.length,
      })
      .select()
      .single()
    
    if (data) {
      setFormationBoards(prev => [...prev, { id: data.id, name: data.name, positions: [] }])
    }
  }

  const removeFormationBoard = async (id: string) => {
    if (formationBoards.length <= 1) return
    setFormationBoards(prev => prev.filter(b => b.id !== id))
    await supabase.from("formation_boards").delete().eq("id", id)
  }

  const cloneFormationBoard = async (id: string) => {
    if (formationBoards.length >= 5) return
    if (!teamId) return
    const source = formationBoards.find(b => b.id === id)
    if (!source) return
    
    const { data } = await supabase
      .from("formation_boards")
      .insert({
        team_id: teamId,
        name: `${source.name} (copia)`,
        positions: source.positions,
        sort_order: formationBoards.length,
      })
      .select()
      .single()
    
    if (data) {
      setFormationBoards(prev => [...prev, { id: data.id, name: data.name, positions: source.positions }])
    }
  }

  const updateBoardPositions = async (boardId: string, positions: PlayerPosition[]) => {
    setFormationBoards(prev => prev.map(b => b.id === boardId ? { ...b, positions } : b))
    await supabase.from("formation_boards").update({ positions }).eq("id", boardId)
  }

  const applyPresetToBoard = (boardId: string, preset: FormationPreset) => {
    const cited = players.filter(p => p.isCited)
    const positions: PlayerPosition[] = preset.positions.map((pos, i) =>
      cited[i] ? { playerId: cited[i].id, x: pos.x, y: pos.y } : null
    ).filter(Boolean) as PlayerPosition[]
    updateBoardPositions(boardId, positions)
  }

  const renameBoardLabel = async (boardId: string, name: string) => {
    setFormationBoards(prev => prev.map(b => b.id === boardId ? { ...b, name } : b))
    await supabase.from("formation_boards").update({ name }).eq("id", boardId)
  }

  // Corner play operations
  const addCornerPlay = async (play: Omit<CornerPlay, "id">) => {
    if (!teamId) return
    const { data } = await supabase
      .from("corner_plays")
      .insert({
        team_id: teamId,
        name: play.name,
        description: play.description,
        tokens: play.tokens,
        drawings: play.drawings || [],
        shapes: play.shapes || [],
        sort_order: cornerPlays.length,
      })
      .select()
      .single()
    
    if (data) {
      setCornerPlays(prev => [...prev, { id: data.id, name: data.name, description: data.description || "", tokens: (data.tokens as CornerToken[]) || [], drawings: (data.drawings as DrawingPath[]) || [], shapes: (data.shapes as DrawingShape[]) || [] }])
    }
  }

  const updateCornerPlay = async (id: string, updates: Partial<CornerPlay>) => {
    setCornerPlays(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    await supabase.from("corner_plays").update(updates).eq("id", id)
  }

  const removeCornerPlay = async (id: string) => {
    setCornerPlays(prev => prev.filter(p => p.id !== id))
    await supabase.from("corner_plays").delete().eq("id", id)
  }

  // Defensive corner play operations
  const addDefensiveCornerPlay = async (play: Omit<DefensiveCornerPlay, "id">) => {
    if (!teamId) return
    const { data } = await supabase
      .from("defensive_corner_plays")
      .insert({
        team_id: teamId,
        name: play.name,
        description: play.description,
        tokens: play.tokens,
        drawings: play.drawings || [],
        shapes: play.shapes || [],
        sort_order: defensiveCornerPlays.length,
      })
      .select()
      .single()
    
    if (data) {
      setDefensiveCornerPlays(prev => [...prev, { id: data.id, name: data.name, description: data.description || "", tokens: (data.tokens as CornerToken[]) || [], drawings: (data.drawings as DrawingPath[]) || [], shapes: (data.shapes as DrawingShape[]) || [] }])
    }
  }

  const updateDefensiveCornerPlay = async (id: string, updates: Partial<DefensiveCornerPlay>) => {
    setDefensiveCornerPlays(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    await supabase.from("defensive_corner_plays").update(updates).eq("id", id)
  }

  const removeDefensiveCornerPlay = async (id: string) => {
    setDefensiveCornerPlays(prev => prev.filter(p => p.id !== id))
    await supabase.from("defensive_corner_plays").delete().eq("id", id)
  }

  // Block play operations
  const addBlockPlay = async (play: Omit<BlockPlay, "id">) => {
    if (!teamId) return
    const { data } = await supabase
      .from("block_plays")
      .insert({
        team_id: teamId,
        name: play.name,
        description: play.description,
        tokens: play.tokens,
        drawings: play.drawings,
        shapes: play.shapes || [],
        sort_order: blockPlays.length,
      })
      .select()
      .single()
    
    if (data) {
      setBlockPlays(prev => [...prev, {
        id: data.id,
        name: data.name,
        description: data.description || "",
        tokens: (data.tokens as CornerToken[]) || [],
        drawings: (data.drawings as DrawingPath[]) || [],
        shapes: (data.shapes as DrawingShape[]) || [],
      }])
    }
  }

  const updateBlockPlay = async (id: string, updates: Partial<BlockPlay>) => {
    setBlockPlays(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    await supabase.from("block_plays").update(updates).eq("id", id)
  }

  const removeBlockPlay = async (id: string) => {
    setBlockPlays(prev => prev.filter(p => p.id !== id))
    await supabase.from("block_plays").delete().eq("id", id)
  }

  // Scouting notes operations
  const addScoutingNote = async (note: Omit<ScoutingNote, "id" | "createdAt" | "updatedAt">) => {
    if (!teamId) return
    const { data } = await supabase
      .from("scouting_notes")
      .insert({
        team_id: teamId,
        fixture_id: note.fixtureId,
        content: note.content,
      })
      .select()
      .single()
    
    if (data) {
      setScoutingNotes(prev => [...prev, {
        id: data.id,
        fixtureId: data.fixture_id,
        content: data.content || "",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }])
    }
  }

  const updateScoutingNote = async (id: string, content: string) => {
    setScoutingNotes(prev => prev.map(n => n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n))
    await supabase.from("scouting_notes").update({ content }).eq("id", id)
  }

  const removeScoutingNote = async (id: string) => {
    setScoutingNotes(prev => prev.filter(n => n.id !== id))
    await supabase.from("scouting_notes").delete().eq("id", id)
  }

  const getScoutingNote = (fixtureId: string) =>
    scoutingNotes.find(n => n.fixtureId === fixtureId)

  const setUniformColor = (color: UniformColor) => setUniformColorState(color)
  const setBwMode = (val: boolean) => setBwModeState(val)

  const defaultUniform: MatchUniform = { camiseta: "oficial", pollera: "pollera", medias: "oficial" }

  const updateFixtureUniform = async (fixtureId: string, uniform: MatchUniform) => {
    if (!teamId) return
    setFixtureUniforms(prev => ({ ...prev, [fixtureId]: uniform }))
    
    // Upsert the uniform
    await supabase
      .from("fixture_uniforms")
      .upsert({
        team_id: teamId,
        fixture_id: fixtureId,
        camiseta: uniform.camiseta,
        pollera: uniform.pollera,
        medias: uniform.medias,
      }, { onConflict: "team_id,fixture_id" })
  }

  const getFixtureUniform = (fixtureId: string): MatchUniform => {
    return fixtureUniforms[fixtureId] || defaultUniform
  }

  const citedPlayers = players.filter(p => p.isCited)

  return (
    <TeamStoreContext.Provider value={{
      players, matchInfo, formationBoards, cornerPlays, uniformColor, fixtures, bwMode, selectedFixtureId,
      defensiveCornerPlays, blockPlays, scoutingNotes, isLoading,
      updatePlayer, addPlayer, removePlayer, updateMatchInfo,
      addFormationBoard, removeFormationBoard, cloneFormationBoard,
      updateBoardPositions, applyPresetToBoard, renameBoardLabel,
      addCornerPlay, updateCornerPlay, removeCornerPlay,
      addDefensiveCornerPlay, updateDefensiveCornerPlay, removeDefensiveCornerPlay,
      addBlockPlay, updateBlockPlay, removeBlockPlay,
      addScoutingNote, updateScoutingNote, removeScoutingNote, getScoutingNote,
      setUniformColor, setBwMode, setSelectedFixtureId,
      updateFixtureUniform, getFixtureUniform,
      citedPlayers, teamLogo,
    }}>
      {children}
    </TeamStoreContext.Provider>
  )
}

export function useTeamStore() {
  const ctx = useContext(TeamStoreContext)
  if (!ctx) throw new Error("useTeamStore must be used within TeamStoreProvider")
  return ctx
}
