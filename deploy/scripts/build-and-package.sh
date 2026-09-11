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
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://evertreasure-bella.bigglz.com}"
OUT_DIR="dist"

# 문의 폼 키: .env.local 에 있으면 자동으로 읽어옵니다.
if [ -z "${NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:-}" ] && [ -f .env.local ]; then
  NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY="$(grep -E '^NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=' .env.local | tail -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
fi
if [ -z "${NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:-}" ]; then
  echo "⚠  NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY 가 비어 있습니다. 문의 폼이 동작하지 않습니다." >&2
fi

ARCHIVE="${OUT_DIR}/${IMAGE_NAME}-${IMAGE_TAG}.tar.gz"

echo "▶ 빌드: ${IMAGE_NAME}:${IMAGE_TAG} (${PLATFORM})"
docker build \
  --platform "${PLATFORM}" \
  --provenance=false --sbom=false \
  -t "${IMAGE_NAME}:${IMAGE_TAG}" \
  --build-arg "NEXT_PUBLIC_SITE_URL=${SITE_URL}" \
  --build-arg "NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=${NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY:-}" \
  .

echo "▶ 압축: ${ARCHIVE}"
mkdir -p "${OUT_DIR}"
docker save "${IMAGE_NAME}:${IMAGE_TAG}" | gzip -9 > "${ARCHIVE}"

echo
echo "✔ 완료  $(du -h "${ARCHIVE}" | cut -f1)  ${ARCHIVE}"
echo "  다음: ./deploy/scripts/deploy-remote.sh ${IMAGE_TAG}"
