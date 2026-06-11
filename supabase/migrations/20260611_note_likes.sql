-- ============================================================
-- 좋아요(note_likes) 테이블 + 인기 노트/톱 리뷰어 RPC
-- Supabase 대시보드 > SQL Editor 에서 실행
-- ============================================================

-- 1. 좋아요 테이블
create table if not exists public.note_likes (
    note_id    uuid not null references public.tasting_notes(id) on delete cascade,
    user_id    uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (note_id, user_id)
);

create index if not exists idx_note_likes_note on public.note_likes(note_id);
create index if not exists idx_note_likes_user on public.note_likes(user_id);

-- 2. RLS
alter table public.note_likes enable row level security;

drop policy if exists "note_likes_select_all" on public.note_likes;
create policy "note_likes_select_all"
    on public.note_likes for select
    using (true);

drop policy if exists "note_likes_insert_own" on public.note_likes;
create policy "note_likes_insert_own"
    on public.note_likes for insert
    with check (auth.uid() = user_id);

drop policy if exists "note_likes_delete_own" on public.note_likes;
create policy "note_likes_delete_own"
    on public.note_likes for delete
    using (auth.uid() = user_id);

-- 3. 노트별 좋아요 수 조회 (피드 표시용)
create or replace function public.get_like_counts(note_ids uuid[])
returns table(note_id uuid, like_count bigint)
language sql stable security definer
set search_path = public
as $$
    select nl.note_id, count(*)::bigint
    from note_likes nl
    where nl.note_id = any(note_ids)
    group by nl.note_id;
$$;

-- 4. 인기 테이스팅 노트 (좋아요 많은 순, 동률이면 최신순)
create or replace function public.get_top_liked_notes(limit_count int default 3)
returns table(note_id uuid, like_count bigint)
language sql stable security definer
set search_path = public
as $$
    select nl.note_id, count(*)::bigint as like_count
    from note_likes nl
    join tasting_notes t on t.id = nl.note_id
    group by nl.note_id, t.created_at
    order by count(*) desc, t.created_at desc
    limit limit_count;
$$;

-- 5. 톱 리뷰어 (받은 좋아요 합산 → 노트 수 순)
create or replace function public.get_top_reviewers(limit_count int default 3)
returns table(user_id uuid, display_name text, note_count bigint, like_count bigint)
language sql stable security definer
set search_path = public
as $$
    select t.user_id,
           coalesce(p.display_name, '') as display_name,
           count(distinct t.id)::bigint as note_count,
           count(nl.user_id)::bigint as like_count
    from tasting_notes t
    left join note_likes nl on nl.note_id = t.id
    left join profiles p on p.user_id = t.user_id
    where t.user_id is not null
    group by t.user_id, p.display_name
    order by count(nl.user_id) desc, count(distinct t.id) desc
    limit limit_count;
$$;

-- 6. 실행 권한 (비로그인 방문자도 인기 노트/리뷰어 열람 가능)
grant execute on function public.get_like_counts(uuid[]) to anon, authenticated;
grant execute on function public.get_top_liked_notes(int) to anon, authenticated;
grant execute on function public.get_top_reviewers(int) to anon, authenticated;
