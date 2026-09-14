#!/usr/bin/env bash
# ============================================================
# 1단계 — 로컬에서 도커 이미지를 빌드하고 tar.gz 로 압축합니다.
#
#   ./deploy/scripts/build-and-package.sh
#   ./deploy/scripts/build-and-package.sh v2          # 태그 직접 지정
#
# 결과물: dist/evertreasure-site-<태그>.tar.gz
#
# ⚠ Apple Silicon(arm64) 맥에서 빌드한 이미지는 x86_64 서버에서 실행되지 않습니다.
#   기본값으로 linux/amd64 를 지정합니다. 서버가 ARM(예: AWS Graviton, Oracle
#   Ampere)이면 PLATFORM=linux/arm64 로 실행하세요.
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/../.."   # 프로젝트 루트로 이동

# ── 설정 ────────────────────────────────────────────────────
IMAGE_NAME="${IMAGE_NAME:-evertreasure-site}"
IMAGE_TAG="${1:-$(date +%Y%m%d-%H%M)}"
PLATFORM="${PLATFORM:-linux/amd64}"
OUT_DIR="dist"

# NEXT_PUBLIC_* 값은 Dockerfile 안에서 .env.local 을 읽어 처리합니다.
# 여기서는 "환경변수로 덮어쓴 경우"에만 --build-arg 로 전달합니다.
#   NEXT_PUBLIC_SITE_URL=https://... ./deploy/scripts/build-and-package.sh 0.0002
BUILD_ARGS=()
if [ -n "${NEXT_PUBLIC_SITE_URL:-}" ]; then
  BUILD_ARGS+=(--build-arg "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}")
fi
if [ -n "${NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:-}" ]; then
  BUILD_ARGS+=(--build-arg "NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=${NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY}")
fi

ARCHIVE="${OUT_DIR}/${IMAGE_NAME}-${IMAGE_TAG}.tar.gz"

echo "▶ 빌드: ${IMAGE_NAME}:${IMAGE_TAG} (${PLATFORM})"
docker build \
  --platform "${PLATFORM}" \
  --provenance=false --sbom=false \
  -t "${IMAGE_NAME}:${IMAGE_TAG}" \
  ${BUILD_ARGS+"${BUILD_ARGS[@]}"} \
  .

echo "▶ 압축: ${ARCHIVE}"
mkdir -p "${OUT_DIR}"
docker save "${IMAGE_NAME}:${IMAGE_TAG}" | gzip -9 > "${ARCHIVE}"

echo
echo "✔ 완료  $(du -h "${ARCHIVE}" | cut -f1)  ${ARCHIVE}"
echo "  다음: ./deploy/scripts/deploy-remote.sh ${IMAGE_TAG}"
