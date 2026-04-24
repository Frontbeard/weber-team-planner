-- =============================================
-- 007_enable_real_rls.sql
-- Fase 1 — Tarea 4: RLS real en Supabase
--
-- Ejecutar DESPUÉS de que:
--   - 006_add_multitenancy.sql esté aplicado
--   - El usuario de Camila exista en auth.users
--   - Exista la fila de Camila en `profiles` con team_id y club_id
--
-- Todas las sentencias son idempotentes (IF EXISTS / CREATE OR REPLACE).
-- Podés re-correr el script sin miedo.
-- =============================================

-- ---------------------------------------------
-- 1) Helper: devuelve el team_id del usuario autenticado
-- ---------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_team_id()
RETURNS UUID AS $$
  SELECT team_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- (Opcional) si querés controlar por club en el futuro
CREATE OR REPLACE FUNCTION public.get_user_club_id()
RETURNS UUID AS $$
  SELECT club_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ---------------------------------------------
-- 2) players
-- ---------------------------------------------
DROP POLICY IF EXISTS "Allow public read"   ON public.players;
DROP POLICY IF EXISTS "Allow public insert" ON public.players;
DROP POLICY IF EXISTS "Allow public update" ON public.players;
DROP POLICY IF EXISTS "Allow public delete" ON public.players;
DROP POLICY IF EXISTS "Players: solo el propio team" ON public.players;

CREATE POLICY "Players: solo el propio team"
  ON public.players FOR ALL
  USING      (team_id = public.get_user_team_id())
  WITH CHECK (team_id = public.get_user_team_id());

-- ---------------------------------------------
-- 3) fixtures
-- ---------------------------------------------
DROP POLICY IF EXISTS "Allow public read"   ON public.fixtures;
DROP POLICY IF EXISTS "Allow public insert" ON public.fixtures;
DROP POLICY IF EXISTS "Allow public update" ON public.fixtures;
DROP POLICY IF EXISTS "Allow public delete" ON public.fixtures;
DROP POLICY IF EXISTS "Fixtures: solo el propio team" ON public.fixtures;

CREATE POLICY "Fixtures: solo el propio team"
  ON public.fixtures FOR ALL
  USING      (team_id = public.get_user_team_id())
  WITH CHECK (team_id = public.get_user_team_id());

-- ---------------------------------------------
-- 4) match_info
-- ---------------------------------------------
DROP POLICY IF EXISTS "Allow public read"   ON public.match_info;
DROP POLICY IF EXISTS "Allow public insert" ON public.match_info;
DROP POLICY IF EXISTS "Allow public update" ON public.match_info;
DROP POLICY IF EXISTS "Allow public delete" ON public.match_info;
DROP POLICY IF EXISTS "Match info: solo el propio team" ON public.match_info;

CREATE POLICY "Match info: solo el propio team"
  ON public.match_info FOR ALL
  USING      (team_id = public.get_user_team_id())
  WITH CHECK (team_id = public.get_user_team_id());

-- ---------------------------------------------
-- 5) formation_boards
-- ---------------------------------------------
DROP POLICY IF EXISTS "Allow public read"   ON public.formation_boards;
DROP POLICY IF EXISTS "Allow public insert" ON public.formation_boards;
DROP POLICY IF EXISTS "Allow public update" ON public.formation_boards;
DROP POLICY IF EXISTS "Allow public delete" ON public.formation_boards;
DROP POLICY IF EXISTS "Formation boards: solo el propio team" ON public.formation_boards;

CREATE POLICY "Formation boards: solo el propio team"
  ON public.formation_boards FOR ALL
  USING      (team_id = public.get_user_team_id())
  WITH CHECK (team_id = public.get_user_team_id());

-- ---------------------------------------------
-- 6) corner_plays
-- ---------------------------------------------
DROP POLICY IF EXISTS "Allow public read"   ON public.corner_plays;
DROP POLICY IF EXISTS "Allow public insert" ON public.corner_plays;
DROP POLICY IF EXISTS "Allow public update" ON public.corner_plays;
DROP POLICY IF EXISTS "Allow public delete" ON public.corner_plays;
DROP POLICY IF EXISTS "Corner plays: solo el propio team" ON public.corner_plays;

CREATE POLICY "Corner plays: solo el propio team"
  ON public.corner_plays FOR ALL
  USING      (team_id = public.get_user_team_id())
  WITH CHECK (team_id = public.get_user_team_id());

-- ---------------------------------------------
-- 7) defensive_corner_plays
-- ---------------------------------------------
DROP POLICY IF EXISTS "Allow public read"   ON public.defensive_corner_plays;
DROP POLICY IF EXISTS "Allow public insert" ON public.defensive_corner_plays;
DROP POLICY IF EXISTS "Allow public update" ON public.defensive_corner_plays;
DROP POLICY IF EXISTS "Allow public delete" ON public.defensive_corner_plays;
DROP POLICY IF EXISTS "Defensive corner plays: solo el propio team" ON public.defensive_corner_plays;

CREATE POLICY "Defensive corner plays: solo el propio team"
  ON public.defensive_corner_plays FOR ALL
  USING      (team_id = public.get_user_team_id())
  WITH CHECK (team_id = public.get_user_team_id());

-- ---------------------------------------------
-- 8) block_plays
-- ---------------------------------------------
DROP POLICY IF EXISTS "Allow public read"   ON public.block_plays;
DROP POLICY IF EXISTS "Allow public insert" ON public.block_plays;
DROP POLICY IF EXISTS "Allow public update" ON public.block_plays;
DROP POLICY IF EXISTS "Allow public delete" ON public.block_plays;
DROP POLICY IF EXISTS "Block plays: solo el propio team" ON public.block_plays;

CREATE POLICY "Block plays: solo el propio team"
  ON public.block_plays FOR ALL
  USING      (team_id = public.get_user_team_id())
  WITH CHECK (team_id = public.get_user_team_id());

-- ---------------------------------------------
-- 9) fixture_uniforms
-- ---------------------------------------------
DROP POLICY IF EXISTS "Allow public read"   ON public.fixture_uniforms;
DROP POLICY IF EXISTS "Allow public insert" ON public.fixture_uniforms;
DROP POLICY IF EXISTS "Allow public update" ON public.fixture_uniforms;
DROP POLICY IF EXISTS "Allow public delete" ON public.fixture_uniforms;
DROP POLICY IF EXISTS "Fixture uniforms: solo el propio team" ON public.fixture_uniforms;

CREATE POLICY "Fixture uniforms: solo el propio team"
  ON public.fixture_uniforms FOR ALL
  USING      (team_id = public.get_user_team_id())
  WITH CHECK (team_id = public.get_user_team_id());

-- ---------------------------------------------
-- 10) scouting_notes
-- ---------------------------------------------
DROP POLICY IF EXISTS "Allow public read"   ON public.scouting_notes;
DROP POLICY IF EXISTS "Allow public insert" ON public.scouting_notes;
DROP POLICY IF EXISTS "Allow public update" ON public.scouting_notes;
DROP POLICY IF EXISTS "Allow public delete" ON public.scouting_notes;
DROP POLICY IF EXISTS "Scouting notes: solo el propio team" ON public.scouting_notes;

CREATE POLICY "Scouting notes: solo el propio team"
  ON public.scouting_notes FOR ALL
  USING      (team_id = public.get_user_team_id())
  WITH CHECK (team_id = public.get_user_team_id());

-- ---------------------------------------------
-- 11) user_settings
-- ---------------------------------------------
DROP POLICY IF EXISTS "Allow public read"   ON public.user_settings;
DROP POLICY IF EXISTS "Allow public insert" ON public.user_settings;
DROP POLICY IF EXISTS "Allow public update" ON public.user_settings;
DROP POLICY IF EXISTS "Allow public delete" ON public.user_settings;
DROP POLICY IF EXISTS "User settings: solo el propio team" ON public.user_settings;

CREATE POLICY "User settings: solo el propio team"
  ON public.user_settings FOR ALL
  USING      (team_id = public.get_user_team_id())
  WITH CHECK (team_id = public.get_user_team_id());

-- ---------------------------------------------
-- 12) teams (lectura solo del propio team)
-- ---------------------------------------------
DROP POLICY IF EXISTS "Allow public read"   ON public.teams;
DROP POLICY IF EXISTS "Teams: solo el propio" ON public.teams;

CREATE POLICY "Teams: solo el propio"
  ON public.teams FOR SELECT
  USING (id = public.get_user_team_id());

-- ---------------------------------------------
-- 13) shared_exports — PÚBLICO por diseño (share links sin login)
-- ---------------------------------------------
-- No tocamos las policies existentes. Si necesitás forzar el estado
-- permisivo, descomentá lo siguiente:
-- DROP POLICY IF EXISTS "Shared exports: lectura pública" ON public.shared_exports;
-- DROP POLICY IF EXISTS "Shared exports: inserción pública" ON public.shared_exports;
-- CREATE POLICY "Shared exports: lectura pública"   ON public.shared_exports FOR SELECT USING (true);
-- CREATE POLICY "Shared exports: inserción pública" ON public.shared_exports FOR INSERT WITH CHECK (true);

-- ---------------------------------------------
-- 14) match_cited_players — PÚBLICO por diseño (share links sin login)
-- ---------------------------------------------
-- Igual que arriba: dejamos las policies permisivas si existen.

-- ---------------------------------------------
-- Fin.
-- Para verificar que funciona:
--   1. Iniciá sesión como Camila en la app — el dashboard debe cargar igual.
--   2. En Supabase Table Editor, abrí `players` con role `anon`
--      (sin loguearte como Camila): no deberías ver filas.
--   3. Si tenés acceso al endpoint REST de Supabase sin auth,
--      GET /rest/v1/players debería devolver [].
-- =============================================
