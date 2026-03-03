-- ============================================================
-- sakeview RLS (Row Level Security) 정책
-- Supabase 대시보드 > SQL Editor에서 실행
-- ============================================================

-- ── 헬퍼: admin 여부 확인 함수 ──
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
$$;

-- ============================================================
-- 1. admins 테이블
--    - 인증된 유저: 자기 자신의 레코드만 SELECT 가능
-- ============================================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_select_own"
  ON public.admins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 2. tasting_notes 테이블
--    - 인증된 유저: 전체 SELECT (커뮤니티 피드)
--    - INSERT/UPDATE/DELETE: 자기 것만
-- ============================================================
ALTER TABLE public.tasting_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasting_notes_select_all"
  ON public.tasting_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "tasting_notes_insert_own"
  ON public.tasting_notes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasting_notes_update_own"
  ON public.tasting_notes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "tasting_notes_delete_own"
  ON public.tasting_notes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 3. custom_sakes 테이블
--    - 인증된 유저: SELECT (사케 DB 병합용)
--    - Admin만: INSERT, UPDATE, DELETE
-- ============================================================
ALTER TABLE public.custom_sakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "custom_sakes_select_all"
  ON public.custom_sakes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "custom_sakes_insert_admin"
  ON public.custom_sakes FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "custom_sakes_update_admin"
  ON public.custom_sakes FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "custom_sakes_delete_admin"
  ON public.custom_sakes FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- 4. sake_specs 테이블
--    - 인증된 유저: SELECT (스펙 조회)
--    - Admin만: INSERT, UPDATE, DELETE
-- ============================================================
ALTER TABLE public.sake_specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sake_specs_select_all"
  ON public.sake_specs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "sake_specs_insert_admin"
  ON public.sake_specs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "sake_specs_update_admin"
  ON public.sake_specs FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "sake_specs_delete_admin"
  ON public.sake_specs FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- 5. certifications 테이블
--    - 인증된 유저: INSERT (신청), SELECT (자기 것만)
--    - Admin만: UPDATE (승인/거절), 전체 SELECT
-- ============================================================
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certifications_select_own_or_admin"
  ON public.certifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "certifications_insert_own"
  ON public.certifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "certifications_update_admin"
  ON public.certifications FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- 6. pending_sakes 테이블
--    - 인증된 유저: INSERT (제출), SELECT/UPDATE (자기 것만)
--    - Admin: 전체 SELECT
-- ============================================================
ALTER TABLE public.pending_sakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pending_sakes_select_own_or_admin"
  ON public.pending_sakes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "pending_sakes_insert_own"
  ON public.pending_sakes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pending_sakes_update_own_or_admin"
  ON public.pending_sakes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
