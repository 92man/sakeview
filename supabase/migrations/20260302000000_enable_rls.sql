-- ============================================================
-- SakeView RLS (Row Level Security) 정책
-- 적용일: 2026-03-02
--
-- 테이블 목록:
--   tasting_notes  : 테이스팅 노트 (핵심 데이터)
--   certifications : 자격증 인증 (민감 데이터)
--   admins         : 관리자 권한
--   custom_sakes   : 사용자 추가 사케 DB
--   sake_specs     : 사케 스펙 정보
-- ============================================================

-- ────────────────────────────────────────────────
-- 1. tasting_notes: 읽기 공개, 쓰기는 본인만
-- ────────────────────────────────────────────────
ALTER TABLE tasting_notes ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 (재실행 안전성)
DROP POLICY IF EXISTS "tasting_notes_select_all" ON tasting_notes;
DROP POLICY IF EXISTS "tasting_notes_insert_own" ON tasting_notes;
DROP POLICY IF EXISTS "tasting_notes_update_own" ON tasting_notes;
DROP POLICY IF EXISTS "tasting_notes_delete_own" ON tasting_notes;

-- 커뮤니티 피드, 검색 등을 위해 모든 인증 사용자가 읽기 가능
CREATE POLICY "tasting_notes_select_all"
  ON tasting_notes FOR SELECT
  USING (true);

-- 본인 user_id로만 삽입 가능
CREATE POLICY "tasting_notes_insert_own"
  ON tasting_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 본인 노트만 수정 가능
CREATE POLICY "tasting_notes_update_own"
  ON tasting_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 본인 노트만 삭제 가능
CREATE POLICY "tasting_notes_delete_own"
  ON tasting_notes FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- 2. certifications: 민감 데이터, 접근 제한
-- ────────────────────────────────────────────────
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "certifications_select_own" ON certifications;
DROP POLICY IF EXISTS "certifications_select_approved" ON certifications;
DROP POLICY IF EXISTS "certifications_insert_own" ON certifications;
DROP POLICY IF EXISTS "certifications_update_admin" ON certifications;
DROP POLICY IF EXISTS "certifications_select_admin" ON certifications;

-- 본인 인증 정보 조회
CREATE POLICY "certifications_select_own"
  ON certifications FOR SELECT
  USING (auth.uid() = user_id);

-- 승인된 자격증은 공개 (배지 표시용, cert_photo 제외는 앱 레벨에서 처리)
CREATE POLICY "certifications_select_approved"
  ON certifications FOR SELECT
  USING (status = 'approved');

-- 관리자는 모든 인증 조회 가능
CREATE POLICY "certifications_select_admin"
  ON certifications FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- 본인만 인증 신청 가능
CREATE POLICY "certifications_insert_own"
  ON certifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 관리자만 인증 상태 변경 가능 (승인/반려)
CREATE POLICY "certifications_update_admin"
  ON certifications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ────────────────────────────────────────────────
-- 3. admins: 최소 권한, 쓰기 완전 차단
-- ────────────────────────────────────────────────
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_select_self" ON admins;

-- 본인이 관리자인지 확인만 가능 (다른 관리자 목록 조회 불가)
CREATE POLICY "admins_select_self"
  ON admins FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE 정책 없음 = anon/authenticated 역할로는 쓰기 불가
-- 관리자 추가/제거는 Supabase Dashboard 또는 service_role로만 가능

-- ────────────────────────────────────────────────
-- 4. custom_sakes: 읽기 공개, 쓰기는 관리자만
-- ────────────────────────────────────────────────
ALTER TABLE custom_sakes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_sakes_select_all" ON custom_sakes;
DROP POLICY IF EXISTS "custom_sakes_insert_admin" ON custom_sakes;
DROP POLICY IF EXISTS "custom_sakes_update_admin" ON custom_sakes;
DROP POLICY IF EXISTS "custom_sakes_delete_admin" ON custom_sakes;

-- 모든 사용자가 사케 DB 조회 가능
CREATE POLICY "custom_sakes_select_all"
  ON custom_sakes FOR SELECT
  USING (true);

-- 관리자만 사케 추가/수정/삭제 가능
CREATE POLICY "custom_sakes_insert_admin"
  ON custom_sakes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

CREATE POLICY "custom_sakes_update_admin"
  ON custom_sakes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

CREATE POLICY "custom_sakes_delete_admin"
  ON custom_sakes FOR DELETE
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ────────────────────────────────────────────────
-- 5. sake_specs: 읽기 공개, 쓰기는 관리자만
-- ────────────────────────────────────────────────
ALTER TABLE sake_specs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sake_specs_select_all" ON sake_specs;
DROP POLICY IF EXISTS "sake_specs_insert_admin" ON sake_specs;
DROP POLICY IF EXISTS "sake_specs_update_admin" ON sake_specs;
DROP POLICY IF EXISTS "sake_specs_delete_admin" ON sake_specs;

CREATE POLICY "sake_specs_select_all"
  ON sake_specs FOR SELECT
  USING (true);

CREATE POLICY "sake_specs_insert_admin"
  ON sake_specs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

CREATE POLICY "sake_specs_update_admin"
  ON sake_specs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

CREATE POLICY "sake_specs_delete_admin"
  ON sake_specs FOR DELETE
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));
