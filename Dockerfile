# ============================================================
# EverTreasure 사이트 컨테이너 이미지
#
# 이 프로젝트는 정적 사이트로 빌드되므로(next.config.mjs 의 output: 'export')
# 1단계에서 out/ 폴더를 만들고, 2단계에서 Nginx가 그 폴더를 서빙합니다.
# Node.js 런타임은 최종 이미지에 포함되지 않습니다.
#
# 빌드:
#   docker build -t evertreasure-site \
#     --build-arg NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=발급받은-키 .
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

# SNS 공유 미리보기 이미지의 절대 URL 생성에 사용됩니다.
# 도메인이 5개지만 빌드는 하나이므로 대표 도메인 하나를 지정합니다.
ARG NEXT_PUBLIC_SITE_URL=https://evertreasure-bella.bigglz.com

# 문의 폼(Web3Forms) 액세스 키.
# 이 키는 브라우저에 노출되도록 설계된 공개 키이지만, docker history 에 남으므로
# 진짜 비밀값은 이 방식으로 전달하지 마세요.
ARG NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=""

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=$NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- 2단계: 정적 파일 서빙 --------------------------------------------------
FROM nginx:alpine

COPY --from=build /app/out /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
