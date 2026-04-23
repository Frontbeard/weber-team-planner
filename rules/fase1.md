# Stick Planner — Plan de trabajo Fase 1
## Documento de contexto para agente de Cursor

---

## Prompt inicial para el agente

```
Sos un desarrollador senior trabajando en Stick Planner,
una aplicación Next.js + Supabase para DTs de hockey.
Este documento contiene el diagnóstico completo del proyecto
y las 4 tareas que tenés que implementar.

Reglas de trabajo:
- Leé el documento completo antes de tocar cualquier archivo
- Ejecutá las tareas en el orden indicado (1 → 2 → 3 → 4)
- Antes de pasar a la siguiente tarea, confirmame que la anterior está funcionando
- Si algo del documento entra en conflicto con lo que ves en el código,
  pausá y avisame antes de decidir
- No instales dependencias nuevas
- No cambies ningún estilo visual ni componente de UI
- Los share links (/share/*) deben seguir siendo públicos al finalizar

Empezá por leer el documento y contame qué entendiste
antes de escribir una sola línea de código.
```

---

## 1. Propósito de este documento

Este documento es el contexto completo que necesita un agente de Cursor para
trabajar en el proyecto Stick Planner. Contiene el diagnóstico del estado actual,
los problemas críticos a resolver, y las tareas de la Fase 1 con instrucciones
exactas de implementación.

El agente debe leer este documento completo antes de tocar cualquier archivo
del repositorio.

---

## 2. Contexto del proyecto

### 2.1 Qué es Stick Planner

Stick Planner es un panel de gestión para Directores Técnicos (DTs) de hockey
sobre césped en Argentina. Actualmente está en producción en
stick-planner.vercel.app y es utilizado por una sola DT: Camila Weber,
del Club Banco Hipotecario.

El objetivo es escalar la aplicación para múltiples DTs dentro de un club,
y eventualmente para múltiples clubes en Argentina.

### 2.2 Stack tecnológico

| Tecnología     | Detalle                                                        |
|----------------|----------------------------------------------------------------|
| Framework      | Next.js 16 (App Router)                                        |
| Base de datos  | Supabase (PostgreSQL)                                          |
| Auth           | Supabase Auth + @supabase/ssr (instalado pero no activado)     |
| UI             | Tailwind CSS v4 + shadcn/ui + Radix UI                         |
| Lenguaje       | TypeScript                                                     |
| Deploy         | Vercel                                                         |
| Package manager| pnpm                                                           |

### 2.3 Funcionalidades actuales que DEBEN preservarse

La siguiente funcionalidad existe y funciona. El agente NO debe romperla:

- Dashboard principal con fixture, plantel y anotaciones
- Vista de partido con 5 tabs: Jugadoras, Vestidor, Formación, Corners, Bloqueos
- Pizarra de formación con drag & drop de jugadoras
- Corners ofensivos y defensivos con canvas interactivo
- Bloqueos con canvas de dibujo libre
- Selección de vestimenta (camiseta, pollera, medias)
- Share link: generación de URL pública por partido (ej: /share/caa55318)
- Realtime subscriptions de Supabase para sincronización de datos

---

## 3. Diagnóstico del estado actual

### PROBLEMA 1 — Autenticación completamente falsa
**Archivo:** `lib/auth-context.tsx`

El login usa usuario y contraseña hardcodeados en el código fuente,
visibles en el repositorio público de GitHub. La sesión se guarda en
sessionStorage (no seguro, se pierde al cerrar el tab). El cliente de
Supabase SSR está correctamente instalado y configurado en el middleware
pero nunca se usa para autenticar.

```ts
const VALID_USERNAME = "camilaweberdt"
const VALID_PASSWORD = "hipotecarioweber"
```

### PROBLEMA 2 — TEAM_ID hardcodeado
**Archivo:** `lib/team-store.tsx`, línea 5

Cada query a Supabase filtra por un UUID fijo. No existe forma de agregar
un segundo DT o una segunda categoría sin reescribir toda la capa de datos.

```ts
const TEAM_ID = "00000000-0000-0000-0000-000000000001"
```

### PROBLEMA 3 — RLS activado pero sin protección real
**Archivo:** `scripts/001_create_tables.sql`

Todas las tablas tienen `ENABLE ROW LEVEL SECURITY`, pero las políticas son
`USING (true)`. Cualquier persona con la anon key puede leer, escribir y
borrar datos de cualquier equipo. La seguridad es solo aparente.

---

## 4. Estructura de archivos relevante

| Archivo / Carpeta              | Función                                        |
|-------------------------------|------------------------------------------------|
| `lib/auth-context.tsx`        | Auth falso — REEMPLAZAR COMPLETO en Tarea 2    |
| `lib/team-store.tsx`          | Store principal — MODIFICAR en Tarea 3         |
| `lib/supabase/client.ts`      | Cliente Supabase para componentes client       |
| `lib/supabase/server.ts`      | Cliente Supabase para Server Components        |
| `lib/supabase/middleware.ts`  | Sesión SSR — NO TOCAR, está bien               |
| `middleware.ts`               | Redireccionamiento — MODIFICAR en Tarea 2      |
| `app/page.tsx`                | Entry point — MODIFICAR en Tarea 2             |
| `components/login-form.tsx`   | Formulario de login — MODIFICAR en Tarea 2     |
| `scripts/001_create_tables.sql` | Schema base — REFERENCIA                     |
| `scripts/002 al 005`          | Seeds y migraciones — REFERENCIA               |

---

## 5. Tareas de la Fase 1

Las tareas deben ejecutarse en el orden indicado.
No avanzar a la siguiente sin validar la anterior.

---

### Tarea 1 — Migración de base de datos

Crear el archivo `scripts/006_add_multitenancy.sql` y ejecutarlo
en el editor SQL de Supabase. Este script NO elimina datos existentes.

```sql
-- =============================================
-- 006_add_multitenancy.sql
-- Fase 1: Multitenancy + Auth real
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Tabla de clubes
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar Banco Hipotecario como primer club
INSERT INTO clubs (id, name, slug, logo)
VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'Club Banco Hipotecario',
  'bhipotecario',
  '/escudo.png'
) ON CONFLICT (id) DO NOTHING;

-- 3. Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'dt', 'pf')),
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Agregar club_id a la tabla teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE;

-- 5. Asociar el equipo actual al club Hipotecario
UPDATE teams
SET club_id = 'c1000000-0000-0000-0000-000000000001'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 6. Habilitar RLS en nuevas tablas
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Política de clubs (lectura pública)
CREATE POLICY "Clubs: lectura pública"
  ON clubs FOR SELECT USING (true);

-- 8. Políticas de profiles
CREATE POLICY "Profiles: solo el propio usuario"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Profiles: insertar el propio"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 9. NOTA: Las políticas de RLS por club_id se implementan
-- en la Tarea 4, una vez que el auth real esté funcionando.
```

---

### Tarea 2 — Reemplazar autenticación falsa por Supabase Auth

#### Paso 2.1 — Crear usuario de Camila en Supabase

- Ir al dashboard de Supabase → Authentication → Users
- Crear usuario con email: `camila@bhipotecario.com`
- Asignar contraseña segura (mínimo 12 caracteres)
- Luego correr en SQL Editor:

```sql
INSERT INTO profiles (user_id, club_id, team_id, role, display_name)
SELECT
  id,
  'c1000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'dt',
  'Camila Weber'
FROM auth.users
WHERE email = 'camila@bhipotecario.com';
```

#### Paso 2.2 — Reemplazar lib/auth-context.tsx

Eliminar el archivo `lib/auth-context.tsx` completamente.
Crear uno nuevo con el siguiente contenido:

```ts
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => { setUser(session?.user ?? null) }
    )
    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => { await supabase.auth.signOut() }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
```

#### Paso 2.3 — Actualizar components/login-form.tsx

Solo cambiar la función `handleSubmit`. Mantener todo el UI igual:

```ts
// Agregar al inicio del archivo:
import { createClient } from "@/lib/supabase/client"

// Reemplazar handleSubmit por:
const supabase = createClient()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError("")
  setLoading(true)
  const { error } = await supabase.auth.signInWithPassword({
    email: username,  // el campo "usuario" pasa a ser email
    password,
  })
  if (error) setError("Usuario o contraseña incorrecta")
  setLoading(false)
}
```

> Nota: el label del campo puede quedarse como "Usuario" o cambiarse
> a "Email". Lo decide el dueño del proyecto.

#### Paso 2.4 — Actualizar middleware.ts raíz

```ts
import { updateSession } from "@/lib/supabase/middleware"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas: share links y auth
  if (pathname.startsWith("/share") || pathname.startsWith("/auth")) {
    return NextResponse.next({ request })
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

---

### Tarea 3 — Eliminar TEAM_ID hardcodeado de team-store.tsx

```ts
// ELIMINAR (línea 5):
const TEAM_ID = "00000000-0000-0000-0000-000000000001"

// AGREGAR al estado del provider:
const [teamId, setTeamId] = useState<string | null>(null)
const [clubId, setClubId] = useState<string | null>(null)

// AGREGAR al inicio de loadData():
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
const TEAM_ID = profile.team_id  // local a esta ejecución

// El resto de las queries usan TEAM_ID normalmente.
```

> IMPORTANTE: El useEffect de subscriptions debe tener `teamId` como
> dependencia y hacer early return si `teamId` es null. Verificar que
> no queden referencias a la constante eliminada en ningún archivo.

---

### Tarea 4 — Activar RLS real en Supabase

Ejecutar una vez que las Tareas 1, 2 y 3 estén funcionando y Camila
pueda ingresar con su email real.

```sql
-- Función helper para obtener el team_id del usuario autenticado
CREATE OR REPLACE FUNCTION get_user_team_id()
RETURNS UUID AS $$
  SELECT team_id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Eliminar políticas permisivas (repetir para cada tabla)
DROP POLICY IF EXISTS "Allow public read" ON players;
DROP POLICY IF EXISTS "Allow public insert" ON players;
DROP POLICY IF EXISTS "Allow public update" ON players;
DROP POLICY IF EXISTS "Allow public delete" ON players;

-- Crear políticas reales (ejemplo para players)
CREATE POLICY "Players: solo el propio team"
  ON players FOR ALL
  USING (team_id = get_user_team_id())
  WITH CHECK (team_id = get_user_team_id());

-- Repetir DROP + CREATE POLICY para:
-- fixtures, match_info, formation_boards, corner_plays,
-- defensive_corner_plays, block_plays, fixture_uniforms,
-- scouting_notes, user_settings

-- shared_exports y match_cited_players son públicos por diseño
-- (son los share links) — mantener USING (true) en esos.
```

---

## 6. Checklist de validación

| Tarea | Criterio de éxito |
|-------|-------------------|
| Tarea 1 — SQL | Las tablas `clubs` y `profiles` existen en Supabase. El equipo de Camila tiene `club_id` asignado. |
| Tarea 2 — Auth | Camila puede ingresar con email y contraseña real. Al cerrar y reabrir el browser, la sesión se mantiene. Los share links (`/share/*`) siguen funcionando sin login. |
| Tarea 3 — TEAM_ID | El dashboard carga los mismos datos que antes. No quedan referencias a la UUID fija en ningún archivo. |
| Tarea 4 — RLS | Desde el Table Editor de Supabase, usando la anon key, no se pueden ver datos de `players` sin estar autenticado. |

---

## 7. Reglas para el agente

- No instalar dependencias nuevas. Todo lo necesario ya está en `package.json`.
- No crear rutas nuevas en `app/` salvo que una tarea lo especifique.
- No modificar ningún archivo en `components/` salvo `login-form.tsx`.
- No modificar `lib/supabase/middleware.ts`, `lib/supabase/client.ts` ni `lib/supabase/server.ts`.
- No cambiar el diseño visual de ninguna pantalla.
- Si una tarea entra en conflicto con estas reglas, pausar y consultar.
- El share link (`/share/[id]`) debe seguir siendo público al finalizar la Fase 1.

---

## 8. Datos reales del proyecto

| Campo | Valor |
|-------|-------|
| URL de producción | https://stick-planner.vercel.app |
| Repositorio GitHub | https://github.com/Frontbeard/weber-team-planner |
| Proyecto Supabase | eqztjotyfhhhcbjzqfjt.supabase.co |
| Club actual | Club Banco Hipotecario |
| DT actual | Camila Weber |
| Team ID actual (hardcoded) | 00000000-0000-0000-0000-000000000001 |
| Club ID a asignar (Tarea 1) | c1000000-0000-0000-0000-000000000001 |
| Deploy | Vercel (auto-deploy desde main) |

---

*Stick Planner — Fase 1 — Documento para agente Cursor*