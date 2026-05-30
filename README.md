# PARAESTRA 청주 홈페이지 (멀티페이지)

파라에스트라 코리아 총본관(청주) 소개 홈페이지입니다.
페이지별로 분리된 멀티페이지 구조라, 추후 사진 페이지 등을 별도 URL로 확장하기 좋습니다.

## 폴더 구성

```
paraestra/
├── index.html      ← 홈 (인트로 + ENTER + 영상 → 히어로 + 메뉴 카드)
├── about.html      ← 관장 소개(전용재) + 계보(나카이 유키)
├── program.html    ← 프로그램 (주짓수 / MMA)
├── schedule.html   ← 시간표 + 체육관 특징
├── gallery.html    ← 갤러리 (추후 사진 페이지로 확장)
├── contact.html    ← 오시는 길 (지도 + SNS)
├── style.css       ← 모든 페이지 공통 디자인 (여기만 고치면 전체 반영)
├── script.js       ← 공통 동작 + 홈 인트로/영상 로직
├── intro.mp4       ← [넣어야 함] ENTER 후 재생되는 소리 있는 인트로 영상
├── hero.mp4        ← [선택] 홈 첫 화면 배경 영상 (음소거·반복)
├── master.jpg      ← [선택] 전용재 관장님 사진
└── README.md       ← 이 안내 파일
```

## 핵심 구조 설명

- 디자인은 style.css 한 파일에 모여 있어, 색/폰트/여백을 바꾸면 6개 페이지에 한 번에 반영됩니다.
- 동작(메뉴, 스크롤, 영상)은 script.js 한 파일에 모여 있습니다.
- 인트로 + ENTER + 영상 연출은 홈(index.html)에서만 1회 나오고,
  상단 메뉴로 다른 페이지를 이동하면 인트로 없이 바로 해당 페이지가 열립니다.

## 영상·사진 넣는 법

index.html 과 같은 폴더에 아래 이름 그대로 넣으면 자동 적용됩니다.

- intro.mp4 : CapCut으로 편집한 빈티지 ADCC 인트로 영상 (소리 포함).
  홈에서 ENTER를 누르면 전체화면으로 소리와 함께 재생됩니다.
  파일이 없으면 ENTER 후 바로 홈으로 넘어갑니다.
- hero.mp4 : 홈 첫 화면 배경 영상 (음소거·자동반복). 없으면 다크 배경 표시.
- master.jpg : about.html 관장 소개 사진. (현재는 자리표시 박스)

## 갤러리 사진 교체

gallery.html 의 `<div class="gal-item">...PHOTO...</div>` 를 실제 이미지로 바꾸세요.

  <div class="gal-item"><img src="g1.jpg" style="width:100%;height:100%;object-fit:cover"></div>

## 추후 사진 페이지 별도 URL 만들기

gallery.html 을 복사해서 예: gallery-2024.html 처럼 새 파일로 만들고,
상단 nav(각 html 파일의 `<nav id="nav">` 부분)에 링크 한 줄을 추가하면 됩니다.
멀티페이지 구조라 페이지마다 고유 주소(.../gallery-2024.html)가 생겨 따로 공유·검색 노출됩니다.

## 배포

별도 서버 없이 폴더를 그대로 올릴 수 있습니다.
- Netlify : 폴더를 끌어다 놓기만 하면 됨
- GitHub Pages / Cloudflare Pages

## 음악 저작권

인트로 영상 음악은 상업적 사용 가능(로열티 프리) 곡인지 확인하세요.
출처 표기가 필요한 곡이면 각 페이지 하단 푸터에 작곡가·곡명을 적어두면 됩니다.

## 로고 (금속 메달)

고대 그리스 금속 메달 형태의 PARAESTRA 로고를 상징적으로 사용합니다.
검정 배경을 투명 처리해서 어디에 얹어도 자연스럽게 보입니다.

- logo.png : 인트로/ENTER/헤더/푸터에 쓰는 메인 로고 (투명 배경, 420px)
- logo_watermark.png : 홈 히어로 배경에 은은하게 깔리는 워터마크용
- logo_original.png : 원본 고해상도 백업 (배포에는 불필요, 보관용)

적용 위치:
- 인트로 화면 — 메달이 페이드인되며 골드 글로우 (홈 첫 진입)
- ENTER 게이트 — 메달 + PARAESTRA 텍스트
- 모든 페이지 헤더 좌측 / 푸터 중앙
- 홈 히어로 배경 — 큰 워터마크 (opacity 6%)

로고를 더 크게/작게 하려면 style.css 의 LOGO 섹션에서
.intro-logo, .gate-logo, .footer-medal 의 width 값을 조정하세요.
워터마크 농도는 .hero-watermark 의 opacity 값(현재 .06)을 조정하면 됩니다.

## 갤러리 (블로그형, 호스팅 후에도 업데이트 가능)

갤러리는 Supabase로 연동되어, 사이트가 배포된 뒤에도 사진·글을 계속 추가할 수 있습니다.

- gallery.html : 방문자용 갤러리 (사진 그리드 + 클릭 시 확대 보기)
- admin.html : 관리자 업로드 페이지 (비밀번호 보호) — 메뉴에 없으며 주소로 직접 접속
- config.js : Supabase 주소/키/비밀번호 설정 (직접 채워야 함)
- gallery.js / admin.js : 갤러리 동작 로직
- GALLERY_SETUP.md : Supabase 설정 단계별 안내 (필독)

설정 방법은 GALLERY_SETUP.md 를 따라 한 번만 하면 됩니다.
이후 사진 추가는 "사이트주소/admin.html" 접속 → 비밀번호 → 사진 올리기.

배포(Vercel)는 GitHub 저장소에 이 폴더를 올리고 Vercel에 연결하면 됩니다.
config.js 도 함께 올라가는데, anon key는 공개용이라 노출돼도 정책으로 보호됩니다.
