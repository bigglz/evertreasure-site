# 배포 가이드 (로컬 빌드 → 압축 → SSH 전송 → 서버 배포)

로컬 맥에서 도커 이미지를 만들어 `tar.gz`로 묶고, SSH로 서버에 올려 실행합니다.
서버에는 **소스 코드도, Node.js도 필요 없습니다.** 도커만 있으면 됩니다.

## 구성

서버에는 이미 여러 서비스가 공용으로 쓰는 **`main-gateway`(Nginx)** 가 80/443 을
점유하고 있습니다. EverTreasure 는 포트를 열지 않고 같은 도커 네트워크에 붙어,
gateway 가 도메인으로 개발/상용을 갈라줍니다.

```
                    ┌─ main-gateway (nginx, 80/443) ──────┐
                    │  · TLS 종료                          │
   인터넷 ─────────▶│  · 도메인으로 dev/prod 분기          │
                    │  · certbot 인증서 발급·갱신          │
                    └──┬────────────────────┬──────────────┘
                       │                    │
   evertreasure-dev-*  │                    │  evertreasure-*
   (5개 도메인)         ▼                    ▼   (5개 도메인)
              evertreasure-site-dev   evertreasure-site-prod
                  (:80, expose)            (:80, expose)
                       └──── give-network ────┘
```

**이 구조의 핵심 3가지**

1. **80/443 을 잡는 건 main-gateway 하나뿐**입니다. 사이트 컨테이너는 호스트 포트를
   열지 않습니다.
2. **환경당 컨테이너 1개면 충분**합니다. 캐릭터는 브라우저가 `location.hostname` 으로
   판별하므로 도메인 5개가 컨테이너 하나를 공유합니다. (`src/lib/character.ts`)
3. **이미지도 하나**입니다. dev 에서 검증한 태그를 그대로 prod 에 올리는 것이 배포입니다.
   재빌드하면 "테스트한 것"과 "올린 것"이 달라집니다.

### 도메인

| 환경 | 도메인 | 컨테이너 | 인증서 |
|---|---|---|---|
| 개발 | `evertreasure-dev-{bella,lumi,nua,shiro,tenzo}.bigglz.com` | `evertreasure-site-dev` | `live/evertreasure-dev-shiro.bigglz.com/` |
| 상용 | `evertreasure-{bella,lumi,nua,shiro,tenzo}.bigglz.com` | `evertreasure-site-prod` | `live/evertreasure-bella.bigglz.com/` |

인증서 폴더 이름은 **발급할 때 첫 번째 `-d` 로 준 도메인**입니다. 캐릭터 이름과
일치하지 않아 보여도 정상입니다.

## 이 폴더의 파일

| 파일 | 역할 |
|---|---|
| `docker-compose.dev.yml` | 개발 사이트 컨테이너 |
| `docker-compose.prod.yml` | 상용 사이트 컨테이너 |
| `gateway/evertreasure.gateway.conf` | main-gateway 에 들어가는 설정 **레퍼런스** (서버 원본의 사본) |
| `scripts/build-and-package.sh` | 1단계: 로컬 빌드 + 압축 |
| `scripts/deploy-remote.sh` | 2단계: 전송 + 배포 + 헬스 체크 |
| `.env.deploy.example` | 서버 접속 정보 템플릿 |
| `standalone/` | **현재 미사용.** 사이트 전용 서버에 3컨테이너로 띄울 때의 구성 |

> `standalone/` 은 지금 서버에서 실행하면 **포트 충돌로 기존 서비스가 모두 죽습니다.**
> 자세한 내용은 [standalone/README.md](standalone/README.md).

---

## 1. 배포 (매번 반복하는 작업)

### 1-1. 빌드 + 압축 (로컬)

```bash
./deploy/scripts/build-and-package.sh 0.0002
```

- 태그를 생략하면 `연월일-시분` 이 됩니다. **의미 있는 버전을 직접 주는 쪽을 권합니다.**
- 결과물: `dist/evertreasure-site-0.0002.tar.gz`
- `.env.local` 의 `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` 를 자동으로 읽어 빌드에 넘깁니다
- `--platform linux/amd64` 가 기본값입니다. 서버가 ARM 이면 `PLATFORM=linux/arm64` 로 실행

### 1-2. 개발에 먼저 배포

```bash
./deploy/scripts/deploy-remote.sh dev 0.0002
```

브라우저로 개발 도메인을 열어 확인합니다. 캐릭터가 도메인별로 다르게 나오는지도 함께 보세요.

### 1-3. 검증되면 같은 태그를 상용으로 승격

```bash
./deploy/scripts/deploy-remote.sh prod 0.0002
```

이미지는 이미 서버에 있으므로 전송·로드를 건너뛰고 컨테이너만 교체합니다.

### 1-4. 롤백

이전 태그로 다시 실행하면 됩니다.

```bash
./deploy/scripts/deploy-remote.sh prod 0.0001
```

서버에 남아 있는 이미지 확인:

```bash
ssh 서버 'docker images evertreasure-site'
```

---

## 2. 최초 1회 설정

이미 끝나 있는 작업입니다. 서버를 새로 만들거나 도메인을 추가할 때만 보세요.

### 2-1. DNS

모든 도메인의 A 레코드를 서버 공인 IP로 지정합니다. 인증서 발급(HTTP-01)이
도메인 → 서버 연결을 확인하는 방식이라 **이게 먼저 되어 있어야 합니다.**

```bash
for d in bella lumi nua shiro tenzo; do echo -n "dev-$d: "; dig +short evertreasure-dev-$d.bigglz.com; echo -n "$d: "; dig +short evertreasure-$d.bigglz.com; done
```

### 2-2. 접속 정보

```bash
cp deploy/.env.deploy.example deploy/.env.deploy
```

`SSH_HOST` 를 실제 값으로 바꿉니다. 서버에서 `sudo` 없이 `docker` 가 안 되면
`DOCKER="sudo docker"` 주석도 해제하세요. 이 파일은 커밋되지 않습니다.

### 2-3. 사이트 컨테이너 기동

`give-network` 는 gateway 가 이미 만들어 둔 외부 네트워크입니다.

```bash
IMAGE_TAG=0.0001 docker compose -f deploy/docker-compose.dev.yml up -d
```

```bash
IMAGE_TAG=0.0001 docker compose -f deploy/docker-compose.prod.yml up -d
```

gateway 에서 양쪽이 보이는지 확인:

```bash
docker exec main-gateway wget -qO- http://evertreasure-site-dev:80/ | head -3
```

### 2-4. gateway 설정

`gateway/evertreasure.gateway.conf` 의 내용을 gateway 프로젝트
(`/home/bigglz/containers/gateway`)의 `conf/nginx.conf` 안 `http { }` 블록에 넣습니다.

> ⚠ **인증서를 발급하기 전에는 443 블록을 넣지 마세요.** Nginx 는 기동할 때
> 인증서 파일을 읽으므로, 파일이 없으면 컨테이너가 바로 죽습니다.
> 80 블록(ACME 챌린지 경로 포함)부터 넣고 → 발급하고 → 443 블록을 넣는 순서입니다.

> ⚠ `conf/nginx.conf` 는 **단일 파일 바인드 마운트**라 inode 에 고정됩니다.
> `vi`·`nano`·`mv` 처럼 파일을 교체하면 컨테이너는 옛 파일을 계속 읽습니다.
> `sudo tee` 같은 제자리 덮어쓰기를 쓰세요.

### 2-5. 인증서 발급

gateway 폴더에서 실행합니다. **반드시 `--dry-run` 으로 먼저 검증하세요** —
Let's Encrypt 는 주당 발급 횟수 제한이 있어 실패를 반복하면 일주일간 막힙니다.

개발:

```bash
docker compose run --rm --entrypoint certbot certbot certonly --webroot -w /var/www/certbot --cert-name evertreasure-dev-shiro.bigglz.com -d evertreasure-dev-shiro.bigglz.com -d evertreasure-dev-tenzo.bigglz.com -d evertreasure-dev-bella.bigglz.com -d evertreasure-dev-lumi.bigglz.com -d evertreasure-dev-nua.bigglz.com --expand --email ethan@bigglz.com --agree-tos --no-eff-email
```

상용:

```bash
docker compose run --rm --entrypoint certbot certbot certonly --webroot -w /var/www/certbot --cert-name evertreasure-bella.bigglz.com -d evertreasure-bella.bigglz.com -d evertreasure-lumi.bigglz.com -d evertreasure-nua.bigglz.com -d evertreasure-shiro.bigglz.com -d evertreasure-tenzo.bigglz.com --email ethan@bigglz.com --agree-tos --no-eff-email
```

확인:

```bash
docker compose run --rm --entrypoint certbot certbot certificates
```

---

## 3. 도메인을 추가할 때

캐릭터나 환경을 늘리면 **4곳을 함께 고쳐야 합니다.** 하나라도 빠지면 그 도메인만
조용히 실패합니다.

1. **DNS** — A 레코드 추가
2. **gateway 80 블록** — `server_name` 에 추가 (안 하면 인증서 발급 실패)
3. **인증서** — 해당 환경 인증서를 `--expand` 로 확장
4. **gateway 443 블록** — 해당 환경 블록의 `server_name` 에 추가

그리고 `gateway/evertreasure.gateway.conf` 사본도 같이 갱신하세요. 서버에만 반영하면
변경 이력이 남지 않습니다.

---

## 4. 운영 명령어

| 목적 | 명령어 |
|---|---|
| 사이트 컨테이너 상태 | `docker ps --filter name=evertreasure` |
| 개발 로그 | `docker logs -f evertreasure-site-dev` |
| 상용 로그 | `docker logs -f evertreasure-site-prod` |
| gateway 설정 검사 | `docker exec main-gateway nginx -t` |
| gateway 설정 반영 | `docker exec main-gateway nginx -s reload` |
| gateway 로그 | `docker logs -f main-gateway` |
| 인증서 목록·만료일 | `docker compose run --rm --entrypoint certbot certbot certificates` |
| 갱신 테스트 | `docker compose run --rm --entrypoint certbot certbot renew --dry-run` |
| 전체 도메인 확인 | 아래 참고 |
| 디스크 정리 | `docker image prune -f` |

```bash
for d in bella lumi nua shiro tenzo; do echo -n "dev-$d: "; curl -sI https://evertreasure-dev-$d.bigglz.com | head -1; echo -n "$d: "; curl -sI https://evertreasure-$d.bigglz.com | head -1; done
```

---

## 5. 자주 막히는 지점

| 증상 | 원인 / 해결 |
|---|---|
| `nginx -t` 가 `host not found in upstream` | ① 사이트 컨테이너가 안 떠 있음 → 먼저 `up -d` ② 설정을 고쳤는데 컨테이너가 옛 파일을 읽는 중 → 아래 항목 참고 |
| 설정을 고쳤는데 gateway 에 반영 안 됨 | 단일 파일 바인드 마운트의 inode 고정. 호스트 파일과 `docker exec main-gateway cat /etc/nginx/nginx.conf` 내용이 다르면 확정. `docker compose up -d --force-recreate gateway` 로 재생성 |
| `sudo cat > 파일` 이 권한 거부 | 리다이렉트는 sudo 가 아닌 일반 쉘이 처리합니다. `sudo tee 파일 > /dev/null <<'EOF'` 를 쓰세요 |
| `no alternative certificate subject name matches` | 인증서에 그 도메인이 없음. `certbot certificates` 로 확인하고 `--cert-name ... --expand` 로 추가 |
| 502 Bad Gateway | 사이트 컨테이너 중지·삭제됨 → `docker logs evertreasure-site-dev` |
| 컨테이너가 `exec format error` | 맥(arm64) 이미지를 x86_64 서버에 올림 → `--platform linux/amd64` 로 재빌드 |
| certbot `Invalid response ... 404` | ① DNS 미전파 ② 80번 포트 막힘 ③ gateway 80 블록 `server_name` 에 해당 도메인이 없음 |
| certbot `too many requests` | 발급 제한. 반드시 `--dry-run` 으로 먼저 검증 |
| 챌린지 경로 테스트가 404 | 테스트 파일 위치가 틀렸습니다. `root` 지시어라 URI 전체가 붙습니다 → `certbot/www/.well-known/acme-challenge/` 아래에 두세요 |
| 수정했는데 반영 안 됨 | HTML 은 `no-cache` 라 서버 캐시 문제는 아닙니다. 이미지를 다시 빌드했는지, `IMAGE_TAG` 가 바뀌었는지 확인 |
| 이미지·CSS가 전부 404 | 빌드에 `NEXT_PUBLIC_BASE_PATH` 가 들어감. **이 값은 GitHub Pages 전용이므로 설정하지 마세요** |
| 캐릭터가 전부 bella | 도메인이 `evertreasure-[환경-]{캐릭터}.bigglz.com` 형식인지 확인. IP 직접 접속 시엔 기본값이 나옵니다 |
| 문의 폼 전송 오류 | `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` 없이 빌드됨. 키는 **빌드 시점에 고정**되므로 재빌드 필요 |

---

## 6. 알아두면 좋은 것

### 인증서 자동 갱신

gateway 스택의 `certbot` 컨테이너가 12시간마다 `certbot renew` 를 돌립니다
(만료 30일 전부터 실제 갱신).

> ⚠ **갱신만으로는 반영되지 않습니다.** Nginx 는 기동 시점에 읽은 인증서를 메모리에
> 들고 있어서, 리로드하지 않으면 갱신 후에도 옛 인증서를 계속 서빙하다 만료됩니다.
> gateway 서비스에 주기적 리로드 루프가 들어 있는지 확인하세요:
>
> ```yaml
> command: "/bin/sh -c 'while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g \"daemon off;\"'"
> ```

### 검색엔진 색인

10개 도메인이 완전히 동일한 HTML 을 서빙하므로, 중복 콘텐츠를 피하려고
`map $host $et_robots` 로 **`evertreasure-bella.bigglz.com` 하나만 색인**시키고
나머지는 `noindex, nofollow` 입니다. 상용 443 블록의
`add_header X-Robots-Tag $et_robots always;` 와 세트로 동작합니다.

확인:

```bash
curl -sI https://evertreasure-lumi.bigglz.com | grep -i x-robots-tag
```

### og:image 호스트

`NEXT_PUBLIC_SITE_URL` 은 **빌드 시점에 고정**됩니다. 현재 값이
`https://evertreasure-bella.bigglz.com` 이라, 개발 도메인에서도 SNS 공유 미리보기의
이미지 호스트는 상용을 가리킵니다. 개발은 어차피 `noindex` 이고, 이미지 하나를
그대로 승격하는 이점이 더 크므로 **의도된 동작**입니다.

### GitHub Pages 워크플로

`.github/workflows/deploy-pages.yml` 이 `main` push 마다 돌아 **별개 사이트**를
배포합니다. 도커 배포만 쓸 거라면 비활성화하세요. 둘 다 유지하면 같은 소스가
두 곳에 배포됩니다.
