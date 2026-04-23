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

