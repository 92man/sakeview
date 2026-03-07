-- ============================================================
-- approved certifications를 안전하게 조회하는 RPC 함수
-- certifications 테이블의 RLS가 매 행마다 is_admin()을 호출하여
-- statement timeout을 유발하는 문제를 해결
--
-- Supabase 대시보드 > SQL Editor에서 실행
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_approved_certs()
RETURNS TABLE(user_id uuid, cert_type text)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT c.user_id, c.cert_type
  FROM public.certifications c
  WHERE c.status = 'approved';
$$;

-- 인증된 유저만 호출 가능
REVOKE ALL ON FUNCTION public.get_approved_certs() FROM public;
GRANT EXECUTE ON FUNCTION public.get_approved_certs() TO authenticated;
