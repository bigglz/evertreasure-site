# EverTreasure 원페이지 사이트 (Next.js)

에버트레져 소개 원페이지 사이트입니다. 기존 정적 HTML/jQuery 사이트를 **Next.js + React + TypeScript**로 리팩토링한 버전으로, 코드를 잘 모르는 분도 문구·이미지·목록 데이터를 쉽게 수정하고 직접 배포할 수 있도록 구성되어 있습니다.

- **빌드 결과물이 순수 정적 파일**(HTML/CSS/JS)이라 어떤 호스팅에도 올릴 수 있습니다.
- 다국어(한국어/영어), 다크모드, 스크롤 애니메이션, 캐릭터 모션, 문의 폼 등 원본의 모든 기능을 그대로 제공합니다.
- 참고용 원본 사이트는 `origin/` 폴더에 있습니다. (빌드에는 사용되지 않음)

---

## 1. 준비물

| 항목 | 설명 |
|---|---|
| [Node.js](https://nodejs.org) 18.18 이상 | LTS 버전 설치를 권장합니다 |
| Web3Forms 액세스 키 | 문의 폼 메일 발송용 · 발급 방법은 [6번 항목](#6-문의-폼-설정-web3forms) 참고 |

## 2. 설치 및 실행

```bash
# 1) 의존성 설치 (최초 1회)
npm install

# 2) 환경 변수 파일 생성 후 값 채우기
cp .env.example .env.local

# 3) 개발 서버 실행 → 브라우저에서 http://localhost:3000 접속
npm run dev
```

파일을 수정하고 저장하면 개발 서버에 즉시 반영됩니다.

## 3. 폴더 구조 — 어디를 수정하면 되나요?

```
├── content/                    ★ 대부분의 수정은 이 폴더에서 합니다
│   ├── site.config.ts          사이트 제목, 캐릭터 선택, SNS 링크, 표시 옵션
│   ├── sections.ts             메뉴·아코디언·탐사대 카드·투자성과·파트너·연혁 목록
│   └── translations/
│       ├── ko.json             한국어 문구 전체
│       └── en.json             영어 문구 전체
├── public/assets/              ★ 이미지·비디오·폰트·CSS
│   ├── images/                 사이트에 쓰이는 모든 이미지/비디오
│   └── css/styles.css          원본 사이트의 스타일 (그대로 이식됨)
├── src/                        리액트 컴포넌트 소스 (기능 수정 시에만)
│   ├── app/                    페이지 구성 (layout.tsx, page.tsx)
│   ├── components/             섹션별 컴포넌트
│   ├── hooks/                  스크롤 감지 등 공용 훅
│   └── lib/                    다국어/테마/토스트 공통 모듈
├── docker/                     배포용 Nginx 설정
│   ├── nginx.conf              컨테이너 내부 (정적 파일 서빙)
│   └── nginx.host.conf.example 앞단 서버 (도메인 연결·TLS) 설정 예시
├── Dockerfile                  컨테이너 이미지 정의
├── docker-compose.yml          컨테이너 실행 설정
├── .env.example                환경 변수 템플릿 (복사해서 .env.local 생성)
└── origin/                     리팩토링 전 원본 사이트 (참고용)
```

## 4. 자주 하는 수정

### 4-1. 문구 수정

모든 문구는 `content/translations/ko.json`(한국어), `en.json`(영어)에 **키: 값** 형태로 들어 있습니다. 값만 바꾸면 됩니다.

```jsonc
"VISION": "우리의 핵심 가치<br />글로벌 문화 금융의 리더, 에버트레져",
```

- `<br/>`는 줄바꿈입니다. 일부 문구는 HTML 태그를 포함하므로 태그 구조는 유지한 채 텍스트만 바꾸세요.
- 한국어와 영어 파일에 **같은 키**가 있어야 합니다. 한쪽에만 있으면 한국어 값이 대신 표시됩니다.
- JSON 문법상 값 안에서 큰따옴표는 `\"`로 써야 합니다.

### 4-2. 이미지 교체

`public/assets/images/` 아래 파일을 **같은 이름으로 덮어쓰는 것**이 가장 간단합니다.

| 항목 | 위치 | 권장 규격 |
|---|---|---|
| 캐릭터 사진/모션 | `images/motion/{이름}_img_01.webp`, `{이름}_01.mp4` | 468×624 (3:4) |
| 가치탐사대 카드 | `images/section/hunters_*.webp` | 700×427 (원본 비율 유지) |
| 투자 성과 | `images/item/invest_01~07.webp` | 세로형 이미지 |
| 파트너 로고 | `images/partners/*.webp` | 높이 60px 내외, 투명 배경 권장 |
| 로고 | `images/logo/logo-black.webp`(라이트), `logo-white.webp`(다크), `logo-gray.webp`, `logo_icon.webp`(파비콘) | 정사각형 |
| 배경 비디오 | `images/overlay-2.mp4` | 다크모드 배경 |
| SNS 공유 이미지 | `images/og.jpg` | 1200×630 |

파일명을 바꾸고 싶다면 `content/sections.ts` 또는 `content/site.config.ts`에서 해당 경로도 함께 수정하세요.

### 4-3. 캐릭터 변경

**접속한 도메인에 따라 캐릭터가 자동으로 결정됩니다.** 빌드나 배포를 도메인마다 따로 할 필요가 없고, 컨테이너 하나로 5개 도메인을 모두 서비스합니다.

| 도메인 | 캐릭터 |
|---|---|
| `evertreasure-bella.bigglz.com` | 벨라 / 핑크 돌고래 |
| `evertreasure-lumi.bigglz.com` | 루미 / 북극여우 |
| `evertreasure-nua.bigglz.com` | 누아 / 오랑우탄 |
| `evertreasure-shiro.bigglz.com` | 시로 / 코뿔소 |
| `evertreasure-tenzo.bigglz.com` | 텐조 / 바다 거북이 |

규칙은 `content/site.config.ts`의 `characterHostPattern`에 있습니다. `evertreasure-` 뒤의 이름을 캐릭터 ID로 사용하므로, 위 형식의 도메인을 추가하면 **설정을 고치지 않아도** 자동으로 적용됩니다.

```ts
characterHostPattern: /^evertreasure-([a-z0-9]+)\./,
character: 'bella' as CharacterId,   // 규칙에 맞지 않을 때 쓰는 기본값
```

- 도메인 형식이 바뀌면 `characterHostPattern`만 수정하세요.
- `localhost`(개발 서버), IP 직접 접속, 오타 도메인에서는 항상 `character` 기본값이 보입니다.
**로컬에서 도메인 전환 테스트하기**

`*.localhost` 는 별도 설정 없이 자동으로 127.0.0.1 로 연결됩니다. 개발 서버(`npm run dev`)를 켠 뒤 아래 주소로 접속하면 실제 도메인 판별 로직을 그대로 확인할 수 있습니다.

```
http://evertreasure-bella.localhost:3000/
http://evertreasure-lumi.localhost:3000/
http://evertreasure-nua.localhost:3000/
http://evertreasure-shiro.localhost:3000/
http://evertreasure-tenzo.localhost:3000/
```

- 포트 번호는 판별에 영향을 주지 않습니다. 3000번이 사용 중이면 개발 서버가 3001 등으로 뜨니 터미널에 표시된 포트를 쓰세요.
- 더 간단하게는 주소 뒤에 `?character=캐릭터ID`를 붙여도 됩니다. 예) `http://localhost:3000/?character=shiro`
- 실제 운영 도메인(`.bigglz.com`)으로 확인하려면 `/etc/hosts`에 아래를 추가하세요. (관리자 권한 필요)

```
127.0.0.1  evertreasure-bella.bigglz.com evertreasure-lumi.bigglz.com evertreasure-nua.bigglz.com evertreasure-shiro.bigglz.com evertreasure-tenzo.bigglz.com
```

캐릭터별 이미지·비디오·인사말 매핑은 같은 파일의 `characters` 객체에 있습니다. 판별 로직은 `src/lib/character.ts`에 있습니다.

> 참고: 이 사이트는 정적 파일로 빌드되므로 `NEXT_PUBLIC_*` 환경 변수는 **빌드 시점에 값이 고정**됩니다. 그래서 캐릭터 판별은 환경 변수가 아니라 브라우저에서 주소를 읽는 방식으로 동작합니다. 덕분에 서버나 Nginx에 도메인별 설정을 넣을 필요가 없습니다.

### 4-4. 목록 추가/삭제 (연혁, 투자성과, 파트너, 탐사대 카드)

`content/sections.ts`의 배열에 항목을 추가/삭제하면 화면에 그대로 반영됩니다.

예) 연혁에 2026년 추가:

```ts
export const timelineItems = [
  {
    year: '2026',
    entryKeys: ['ABOUT_HISTORY_2026_TITLE', 'ABOUT_HISTORY_2026_IPO'],
  },
  // ... 기존 항목
];
```

그리고 `ko.json`/`en.json`에 새 키의 문구를 추가하세요:

```jsonc
"ABOUT_HISTORY_2026_TITLE": "2026 (상장 준비)",
"ABOUT_HISTORY_2026_IPO": "코스닥 상장 예비심사 청구",
```

### 4-5. 기타 옵션 (`content/site.config.ts`)

| 옵션 | 설명 | 기본값 |
|---|---|---|
| `title`, `description` | 브라우저 탭 제목 / 검색엔진 설명 | 에버트레져 |
| `social.linkedin`, `social.youtube` | SNS 링크 (빈 문자열이면 아이콘 숨김) | |
| `contact.limitOncePerDay` | 문의 폼 1일 1회 제한 | `true` |
| `showClock` | 좌측 상단 날짜/시계 표시 | `false` |
| `smoothScroll` | 마우스 휠 스크롤 보정 | `true` |

## 5. 색상/스타일 수정

사이트의 스타일은 원본에서 그대로 이식한 `public/assets/css/styles.css`에 있습니다. 색상 변수(`--black-56` 등)와 섹션별 스타일을 이 파일에서 수정하면 됩니다. 리팩토링 과정에서 추가된 보조 스타일은 `src/app/globals.css`에 있습니다(파트너 로고 롤링 슬라이드 등).

## 6. 문의 폼 설정 (Web3Forms)

문의 폼은 [Web3Forms](https://web3forms.com) 무료 서비스로 이메일을 발송합니다. **서버가 필요 없으며 회원가입 없이 1분 안에 설정됩니다.**

1. https://web3forms.com 접속
2. "Create your Access Key"에 **문의 메일을 수신할 이메일 주소** 입력
3. 메일로 도착한 Access Key 복사
4. 프로젝트 루트의 `.env.local` 파일에 붙여넣기:

```
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=발급받은-액세스-키
```

- 무료 플랜은 **월 250건**까지 발송할 수 있습니다.
- 수신 주소를 바꾸려면 새 주소로 키를 다시 발급받아 교체하면 됩니다.
- 키를 바꾼 뒤에는 개발 서버 재시작(`npm run dev`) 또는 재빌드가 필요합니다.

> 참고: `NEXT_PUBLIC_` 변수는 브라우저에 노출됩니다. Web3Forms 액세스 키는 공개되어도 무방하게 설계된 키이므로 문제 없습니다. 다만 스팸 발송 방지를 위해 Web3Forms 대시보드에서 도메인 제한을 걸어두는 것을 권장합니다.

## 7. 빌드 및 배포

```bash
npm run build
```

빌드가 끝나면 **`out/` 폴더에 완성된 정적 사이트**가 생성됩니다. 이 폴더의 내용물을 통째로 호스팅에 올리면 배포 완료입니다.

로컬에서 빌드 결과 미리 보기:

```bash
npm start        # http://localhost:3000 에서 out/ 폴더 서빙
```

### 배포처별 안내

- **일반 웹호스팅 (닷홈, 카페24 등)**: `out/` 폴더 안의 모든 파일을 FTP로 웹 루트(`public_html` 등)에 업로드합니다.
- **Netlify / Vercel**: GitHub 저장소를 연결하면 자동으로 빌드·배포됩니다. 빌드 명령 `npm run build`, 출력 디렉터리 `out`. 환경 변수(`NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`)를 대시보드에서 등록하세요.
- **AWS S3 / CloudFront**: `out/` 폴더를 S3 버킷에 업로드하고 정적 웹사이트 호스팅을 활성화합니다.
- **GitHub Pages**: 아래 [7-1](#7-1-github-pages-자동-배포) 참고.

배포 후 `.env.local`(또는 호스팅 대시보드)의 `NEXT_PUBLIC_SITE_URL`을 실제 도메인으로 설정하면 카카오톡/SNS 공유 미리보기 이미지가 올바르게 나옵니다.

### 7-1. GitHub Pages 자동 배포

이 저장소에는 [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)이 포함되어 있어, **`main` 브랜치에 push할 때마다 자동으로 빌드되어 GitHub Pages에 배포**됩니다.

**최초 1회 설정:**

1. 저장소 → **Settings → Pages** → "Build and deployment" 항목의 Source를 **"GitHub Actions"**로 선택
2. 문의 폼을 쓰려면 저장소 → **Settings → Secrets and variables → Actions** → "New repository secret"에서 이름 `WEB3FORMS_ACCESS_KEY`로 액세스 키 등록 (등록 전에는 사이트는 정상 동작하되 문의 폼만 에러가 납니다)
3. `main` 브랜치에 push하면 **Actions** 탭에서 진행 상황을 볼 수 있고, 완료되면 `https://<계정명>.github.io/<저장소명>/` 에서 확인 가능합니다.

GitHub Pages는 저장소 이름이 URL 경로에 포함되는 하위 경로 배포(예: `/evertreasure-site/`)이므로, 이 프로젝트는 `src/lib/basePath.ts`를 통해 모든 이미지·스타일시트 경로에 자동으로 이 경로를 붙이도록 되어 있습니다. 별도로 신경 쓸 필요는 없습니다.

### 7-2. 도커 + Nginx 배포 (캐릭터별 도메인)

`evertreasure-{캐릭터}.bigglz.com` 5개 도메인을 **컨테이너 하나**로 서비스하는 구성입니다. 캐릭터는 접속 도메인에 따라 브라우저에서 결정되므로([4-3](#4-3-캐릭터-변경) 참고), 도메인별로 빌드하거나 Nginx에 도메인별 설정을 넣을 필요가 없습니다.

**1) 컨테이너 실행**

```bash
docker compose up -d --build
```

`http://localhost:8080` 에서 확인할 수 있습니다. 문의 폼 키는 `.env.local`의 `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`를 읽어갑니다.

`docker compose` 없이 직접 실행하려면:

```bash
docker build -t evertreasure-site --build-arg NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=발급받은-키 .
docker run -d --name evertreasure-site -p 8080:80 --restart unless-stopped evertreasure-site
```

**2) 앞단 Nginx 설정**

`docker/nginx.host.conf.example`을 서버의 Nginx 설정 폴더(예: `/etc/nginx/sites-available/`)로 복사하고 인증서 경로만 맞추면 됩니다. 5개 도메인을 하나의 서버 블록에 나열하고 `127.0.0.1:8080`으로 프록시하는 구성입니다.

**3) TLS 인증서**

서브도메인이 5개이므로 와일드카드 인증서를 권장합니다. (와일드카드는 DNS-01 챌린지가 필요합니다)

```bash
certbot certonly --manual --preferred-challenges dns -d '*.bigglz.com' -d bigglz.com
```

**주의할 점**

| 항목 | 내용 |
|---|---|
| `NEXT_PUBLIC_BASE_PATH` | **설정하지 마세요.** GitHub Pages(하위 경로 배포) 전용 값이며, 자체 도메인에서 설정하면 모든 이미지·CSS 경로가 404가 됩니다 |
| `NEXT_PUBLIC_SITE_URL` | 5개 도메인이 같은 빌드를 공유하므로 **대표 도메인 하나**만 지정합니다. SNS 공유 미리보기는 5개 도메인 모두에서 정상 동작합니다 |
| Web3Forms 도메인 제한 | 대시보드에서 도메인을 제한해뒀다면 **5개 도메인을 모두** 허용 목록에 넣어야 합니다 |
| 검색엔진 중복 색인 | 5개 도메인이 동일한 내용을 서빙하므로, 예시 설정처럼 대표 도메인 1개만 색인하고 나머지는 `X-Robots-Tag: noindex`로 제외합니다 |
| GitHub Pages 워크플로 | 도커로 옮긴 뒤에도 `main` push마다 계속 실행되어 별개 사이트를 배포합니다. 불필요하면 워크플로를 비활성화하세요 |

**캐시 정책** (`docker/nginx.conf`에 설정됨)

| 대상 | 캐시 |
|---|---|
| `/_next/static/` | 1년 (파일명에 해시가 있어 영구 캐시 가능) |
| `/assets/` | 1주일 (이미지·영상·폰트) |
| HTML | `no-cache` — 문구나 설정을 수정해 재배포하면 즉시 반영됩니다 |

## 8. 원본(origin)과의 차이점

| 항목 | 원본 | 리팩토링 버전 |
|---|---|---|
| 스택 | 정적 HTML + jQuery + Bootstrap JS | Next.js 15 + React 19 + TypeScript |
| 문의 메일 발송 | 사내 API(bigglz) 하드코딩 | Web3Forms (누구나 키 발급 가능) |
| 문구/데이터 관리 | HTML과 JS에 흩어져 있음 | `content/` 폴더에 일원화 |
| 이미지 | 미사용 템플릿 이미지 다수 포함(135MB) | 사용분만 선별(76MB) |
| 애니메이션 | GSAP + 여러 jQuery 플러그인 | GSAP(React 통합) + 경량 React 구현 |
| 시각적 결과물 | — | 원본과 동일 (스크린샷 비교 검증 완료) |

## 9. 문제 해결

- **문의 폼에서 "전송 중 오류" 토스트가 뜹니다** → `.env.local`에 `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`가 설정됐는지, 설정 후 서버를 재시작했는지 확인하세요. 브라우저 개발자도구 콘솔에 자세한 원인이 출력됩니다.
- **문의 폼이 "이미 메시지를 전달했습니다"라고 합니다** → 같은 브라우저에서 하루 1회만 전송되도록 제한되어 있습니다(원본과 동일). 테스트 시에는 브라우저 개발자도구 → Application → Local Storage에서 `evertreasure_contact_sent` 항목을 삭제하거나, `content/site.config.ts`에서 `limitOncePerDay: false`로 바꾸세요.
- **수정했는데 화면에 반영이 안 됩니다** → 개발 서버(`npm run dev`)가 켜져 있는지 확인하고, 브라우저 강력 새로고침(Cmd/Ctrl+Shift+R)을 해보세요. `.env.local` 수정은 서버 재시작이 필요합니다.
- **빌드가 실패합니다** → 대부분 JSON 문법 오류(쉼표 누락, 따옴표 미이스케이프)입니다. 에러 메시지에 표시된 파일을 확인하세요.
