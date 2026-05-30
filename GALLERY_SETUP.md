# 갤러리 설정 안내 (Supabase)

갤러리를 블로그처럼 쓰기 위한 1회 설정입니다. 10~15분이면 됩니다.
한 번 설정하면, 이후엔 admin.html 에서 비밀번호 넣고 사진만 올리면 됩니다.

---

## 1. Supabase 프로젝트 만들기

1. https://supabase.com 로그인 → "New Project"
2. 프로젝트 이름(예: paraestra), 비밀번호(DB용, 메모해두기), 지역(Northeast Asia - Seoul 추천) 선택 후 생성
3. 생성까지 1~2분 기다립니다.

## 2. 테이블 만들기

왼쪽 메뉴 "SQL Editor" → "New query" → 아래를 붙여넣고 RUN:

```sql
create table gallery_posts (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  title text not null,
  body text,
  images jsonb default '[]'::jsonb,
  password text
);

-- 누구나 읽기 가능, 쓰기/삭제는 비밀번호가 맞을 때만
alter table gallery_posts enable row level security;

create policy "누구나 읽기" on gallery_posts
  for select using (true);

create policy "비번 맞으면 쓰기" on gallery_posts
  for insert with check (password = '여기에_업로드_비밀번호');

create policy "비번 맞으면 삭제" on gallery_posts
  for delete using (password = '여기에_업로드_비밀번호');
```

위 SQL의 `여기에_업로드_비밀번호` 두 곳을, config.js에 적을 비밀번호와
**똑같은 값**으로 바꿔서 실행하세요. (예: paraestra1234)

## 3. 사진 저장소(Storage) 만들기

1. 왼쪽 메뉴 "Storage" → "New bucket"
2. 이름: `gallery` (config.js의 BUCKET 값과 같아야 함)
3. "Public bucket" 옵션을 **켜기** (사진이 홈페이지에 보여야 하므로)
4. 생성

그 다음 사진 업로드를 허용하는 정책을 추가합니다.
"Storage" → gallery 버킷 → "Policies" → "New policy" → "For full customization":

- 정책 이름: upload-allow
- Allowed operation: INSERT 체크
- USING/CHECK 식에 `true` 입력 → 저장

(읽기 정책은 Public bucket이면 자동으로 됩니다. 안 되면 같은 방식으로 SELECT에 true 추가)

## 4. 키 값 복사해서 config.js에 넣기

왼쪽 메뉴 "Project Settings" → "API" 에서:

- "Project URL" → config.js의 SUPABASE_URL 에 붙여넣기
- "Project API keys"의 `anon` `public` 키 → config.js의 SUPABASE_ANON_KEY 에 붙여넣기

config.js 최종 예시:

```js
window.PARAESTRA_CONFIG = {
  SUPABASE_URL: "https://abcdxyz.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOi...(긴 문자열)",
  UPLOAD_PASSWORD: "paraestra1234",
  BUCKET: "gallery"
};
```

UPLOAD_PASSWORD 는 2번 SQL에 넣은 비밀번호와 같아야 합니다.

---

## 사용 방법

- 사진 올리기: 사이트주소/admin.html 접속 → 비밀번호 입력 → 제목/사진/글 입력 → 올리기
- 보기: 사이트주소/gallery.html (또는 메뉴의 Gallery)
- 삭제: admin.html 하단 목록에서 삭제 버튼

## 보안 메모

- 보는 것은 누구나, 올리고 지우는 것은 비밀번호를 아는 사람만 가능합니다.
  (화면 비밀번호 + Supabase 정책 두 겹으로 보호됩니다)
- 비밀번호를 바꾸려면: config.js의 UPLOAD_PASSWORD 와
  2번 SQL 정책의 비밀번호를 둘 다 같은 새 값으로 바꾸세요.
- anon key 는 외부에 노출돼도 되는 공개용 키입니다. (정책으로 보호되므로 안전)

## 비용

무료 플랜으로 충분합니다. (DB 500MB, 저장소 1GB, 사진 수천 장 분량)
사진이 아주 많아지면 유료로 올리거나, 사진 용량을 줄여 올리세요.
