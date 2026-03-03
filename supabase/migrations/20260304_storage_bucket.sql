-- ============================================================
-- sakeview Storage: sake-photos 버킷 생성 + RLS
-- Supabase 대시보드 > SQL Editor에서 실행
-- ============================================================

-- 버킷 생성 (public: 누구나 URL로 이미지 조회 가능)
INSERT INTO storage.buckets (id, name, public)
VALUES ('sake-photos', 'sake-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 인증 유저: 자기 폴더(user_id/)에만 업로드 가능
CREATE POLICY "auth_users_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'sake-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 인증 유저: 자기 파일만 삭제 가능
CREATE POLICY "auth_users_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'sake-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 인증 유저: 자기 파일 덮어쓰기(upsert) 가능
CREATE POLICY "auth_users_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'sake-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 공개 읽기 (public bucket이므로 누구나 조회 가능)
CREATE POLICY "public_read_sake_photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'sake-photos');
