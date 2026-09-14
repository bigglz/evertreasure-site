#!/usr/bin/env bash
# ============================================================
# 2단계 — 압축한 이미지를 SSH로 서버에 전달하고 배포합니다.
#
#   ./deploy/scripts/deploy-remote.sh dev  0.0002
#   ./deploy/scripts/deploy-remote.sh prod 0.0002
#
# 접속 정보는 deploy/.env.deploy 에서 읽습니다(.env.deploy.example 참고).
#
# 하는 일:
#   1) compose 파일을 서버로 동기화 (항상 저장소 기준으로 덮어씀)
#   2) tar.gz 를 서버로 scp (이미 있으면 생략)
#   3) 서버에서 docker load (이미 있으면 생략)
#   4) 해당 환경의 사이트 컨테이너만 교체
#   5) 앞단 gateway 를 통과하는 실제 HTTPS 헬스 체크
#   6) 오래된 아카이브 정리
#
# ⚠ 앞단 Nginx(main-gateway)와 인증서는 이 스크립트가 건드리지 않습니다.
#   도메인을 새로 추가할 때만 gateway 설정을 손대면 됩니다.
#   (deploy/gateway/evertreasure.gateway.conf 참고)
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/../.."

[ -f deploy/.env.deploy ] && . deploy/.env.deploy

ENV_NAME="${1:-}"
IMAGE_TAG="${2:-}"

IMAGE_NAME="${IMAGE_NAME:-evertreasure-site}"
SSH_HOST="${SSH_HOST:-}"
SSH_PORT="${SSH_PORT:-22}"
REMOTE_DIR="${REMOTE_DIR:-/opt/evertreasure}"
KEEP="${KEEP:-3}"            # 서버에 남겨둘 과거 아카이브 수(롤백용)
DOCKER="${DOCKER:-docker}"   # docker 그룹에 없으면 .env.deploy 에 DOCKER="sudo docker"

usage() {
  echo "사용법: $0 <dev|prod> <이미지태그>" >&2
  echo "  예:   $0 dev 0.0002" >&2
  exit 1
}

case "${ENV_NAME}" in
  dev)  HEALTH_HOST="evertreasure-dev-bella.bigglz.com" ;;
  prod) HEALTH_HOST="evertreasure-bella.bigglz.com" ;;
  *)    usage ;;
esac

[ -n "${IMAGE_TAG}" ] || usage
[ -n "${SSH_HOST}" ] || { echo "✖ SSH_HOST 가 없습니다. deploy/.env.deploy 를 만드세요." >&2; exit 1; }

COMPOSE_FILE="deploy/docker-compose.${ENV_NAME}.yml"
ARCHIVE="dist/${IMAGE_NAME}-${IMAGE_TAG}.tar.gz"
[ -f "${COMPOSE_FILE}" ] || { echo "✖ 파일 없음: ${COMPOSE_FILE}" >&2; exit 1; }
[ -f "${ARCHIVE}" ] || { echo "✖ 파일 없음: ${ARCHIVE} (먼저 build-and-package.sh 실행)" >&2; exit 1; }

SSH="ssh -p ${SSH_PORT} ${SSH_HOST}"

echo "▶ 대상: ${ENV_NAME}  이미지: ${IMAGE_NAME}:${IMAGE_TAG}"

# ── 1) compose 파일 동기화 ─────────────────────────────────
# 서버에 옛 compose 가 남아 실제 구성과 어긋나는 사고를 막기 위해 매번 덮어씁니다.
${SSH} "mkdir -p ${REMOTE_DIR}/deploy ${REMOTE_DIR}/images"
scp -P "${SSH_PORT}" "${COMPOSE_FILE}" "${SSH_HOST}:${REMOTE_DIR}/deploy/"

# ── 2) 이미지 전송 ─────────────────────────────────────────
# dev 로 올린 이미지를 prod 로 승격할 때는 이미 서버에 있으므로 다시 보내지 않습니다.
if ${SSH} "[ -f ${REMOTE_DIR}/images/${IMAGE_NAME}-${IMAGE_TAG}.tar.gz ]"; then
  echo "▶ 전송 생략 (서버에 이미 있음)"
else
  echo "▶ 전송: ${ARCHIVE} → ${SSH_HOST}:${REMOTE_DIR}/images/"
  scp -P "${SSH_PORT}" "${ARCHIVE}" "${SSH_HOST}:${REMOTE_DIR}/images/"
fi

# ── 3~4) 로드 + 교체 ───────────────────────────────────────
echo "▶ 서버에서 배포"
${SSH} bash -s <<REMOTE
set -euo pipefail
cd "${REMOTE_DIR}"

if ${DOCKER} image inspect "${IMAGE_NAME}:${IMAGE_TAG}" >/dev/null 2>&1; then
  echo "  · 이미지 이미 있음 (load 생략)"
else
  echo "  · docker load"
  gunzip -c "images/${IMAGE_NAME}-${IMAGE_TAG}.tar.gz" | ${DOCKER} load
fi

echo "  · ${ENV_NAME} 컨테이너 교체"
# 환경변수 대신 --env-file 을 쓰는 이유: DOCKER 가 "sudo docker" 인 경우
# IMAGE_TAG=x sudo docker ... 형태로는 변수가 전달되지 않습니다(sudo 가 환경을 지움).
# 부수효과로 "지금 이 환경에 뭐가 올라가 있는지"가 서버에 파일로 남습니다.
printf 'IMAGE_NAME=%s\nIMAGE_TAG=%s\n' "${IMAGE_NAME}" "${IMAGE_TAG}" > "deploy/.env.${ENV_NAME}"
${DOCKER} compose --env-file "deploy/.env.${ENV_NAME}" -f "${COMPOSE_FILE}" up -d

echo "  · 정리 (최근 ${KEEP}개 아카이브 유지)"
ls -1t images/${IMAGE_NAME}-*.tar.gz 2>/dev/null | tail -n +$((${KEEP} + 1)) | xargs -r rm -f

${DOCKER} compose --env-file "deploy/.env.${ENV_NAME}" -f "${COMPOSE_FILE}" ps
REMOTE

# ── 5) 헬스 체크 ───────────────────────────────────────────
# 앞단 gateway → 사이트 컨테이너까지 실제 경로를 그대로 확인합니다.
# (80 번은 301 리다이렉트가 정상이므로 HTTPS 로 확인해야 의미가 있습니다)
echo "▶ 헬스 체크: https://${HEALTH_HOST}"
CODE="$(curl -sS -o /dev/null -w '%{http_code}' "https://${HEALTH_HOST}/" || echo 000)"
echo "  HTTP ${CODE}"

if [ "${CODE}" != "200" ]; then
  echo "✖ 헬스 체크 실패 (${CODE}). 아래를 확인하세요:" >&2
  echo "    ${SSH} '${DOCKER} logs --tail 30 evertreasure-site-${ENV_NAME}'" >&2
  echo "    ${SSH} '${DOCKER} exec main-gateway nginx -t'" >&2
  exit 1
fi

echo
echo "✔ 배포 완료: ${ENV_NAME} ← ${IMAGE_NAME}:${IMAGE_TAG}"
if [ "${ENV_NAME}" = "dev" ]; then
  echo "  검증 후 상용 승격: ./deploy/scripts/deploy-remote.sh prod ${IMAGE_TAG}"
fi
