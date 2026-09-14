# ============================================================
# EverTreasure 사이트 컨테이너 이미지
#
# 이 프로젝트는 정적 사이트로 빌드되므로(next.config.mjs 의 output: 'export')
# 1단계에서 out/ 폴더를 만들고, 2단계에서 Nginx가 그 폴더를 서빙합니다.
# Node.js 런타임은 최종 이미지에 포함되지 않습니다.
#
# 빌드:
#   docker build --platform linux/amd64 -t evertreasure-site:0.0002 .
#
#   환경 변수는 같은 폴더의 .env.local 을 Next.js 가 빌드 시점에 직접 읽습니다.
#   특정 값만 덮어쓰고 싶을 때만 --build-arg 를 붙이세요.
#     docker build --build-arg NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=다른-키 .
#
# 실행:
#   docker run -d --name evertreasure-site -p 8080:80 evertreasure-site
#
# ⚠ 캐릭터는 이미지를 다시 빌드하지 않아도 도메인에 따라 자동으로 바뀝니다.
#   (evertreasure-bella.bigglz.com → bella) 이미지 하나로 5개 도메인을 모두
#   서비스하세요. 자세한 내용은 src/lib/character.ts 참고.
# ============================================================

# ---- 1단계: 정적 사이트 빌드 ------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# 의존성만 먼저 복사해 Docker 레이어 캐시를 활용합니다.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# ⚠ NEXT_PUBLIC_BASE_PATH 는 설정하지 마세요.
#   GitHub Pages(하위 경로 배포) 전용 값이며, 자체 도메인 배포에서 이 값이 들어가면
#   모든 이미지·CSS 경로에 /저장소명 이 붙어 404가 납니다.

# ── 환경 변수 ────────────────────────────────────────────────
# 우선순위:  --build-arg  >  .env.local  >  아래 기본값
#
# .env.local 은 빌드 컨텍스트에 포함되므로(.dockerignore 참고) Next.js 가
# 빌드 시점에 알아서 읽습니다. --build-arg 없이도 키가 들어갑니다.
#
# ⚠ Next.js 는 "빈 문자열"도 설정된 값으로 취급해 .env.local 을 덮어씁니다.
#   ARG 는 기본값이 있으면 RUN 의 환경변수로 그대로 전달되므로,
#   --build-arg 가 비어 있을 때는 아래에서 변수를 unset 해야 .env.local 이 쓰입니다.

# SNS 공유 미리보기 이미지의 절대 URL 생성에 사용됩니다.
# 도메인이 5개지만 빌드는 하나이므로 대표 도메인 하나를 지정합니다.
ARG NEXT_PUBLIC_SITE_URL=""

# 문의 폼(Web3Forms) 액세스 키.
# 이 키는 브라우저에 노출되도록 설계된 공개 키이지만, --build-arg 로 넘기면
# docker history 에 남으므로 진짜 비밀값은 이 방식으로 전달하지 마세요.
ARG NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=""

ENV NEXT_TELEMETRY_DISABLED=1

# RUN 안에서 하는 일 (주석은 셸 문법 충돌을 피하려고 밖에 둡니다)
#  1) 비어 있는 --build-arg 를 unset — 안 그러면 .env.local 을 빈 값으로 덮어씁니다
#  2) --build-arg 도 .env.local 도 없을 때만 대표 도메인을 기본값으로 사용
#  3) 문의 폼 키가 어디에도 없으면 크게 경고 (빌드는 계속 — 사이트 자체는 정상)
RUN set -eu; \
    [ -n "${NEXT_PUBLIC_SITE_URL:-}" ] || unset NEXT_PUBLIC_SITE_URL; \
    [ -n "${NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:-}" ] || unset NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY; \
    if [ -z "${NEXT_PUBLIC_SITE_URL:-}" ] && ! grep -qs '^NEXT_PUBLIC_SITE_URL=.' .env.local; then \
      export NEXT_PUBLIC_SITE_URL=https://evertreasure-bella.bigglz.com; \
    fi; \
    if [ -z "${NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:-}" ] && ! grep -qs '^NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=.' .env.local; then \
      echo '=============================================================='; \
      echo '!!  NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY 가 없습니다.'; \
      echo '    .env.local 을 만들거나 --build-arg 로 넘기세요.'; \
      echo '    이대로 빌드하면 문의 폼이 동작하지 않습니다.'; \
      echo '=============================================================='; \
    fi; \
    npm run build

# ---- 2단계: 정적 파일 서빙 --------------------------------------------------
FROM nginx:alpine

COPY --from=build /app/out /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
