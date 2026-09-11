# 독립 스택 (현재 서버에서는 사용하지 않습니다)

이 폴더는 **사이트 전용 서버**에 배포할 때 쓰는 구성입니다.
site + proxy(Nginx) + certbot 3개 컨테이너를 직접 띄우며, 80/443 을 스스로 점유합니다.

## ⚠ 현재 운영 서버에서는 실행하지 마세요

지금 서버(`ethan-dev-server`)에는 이미 여러 서비스가 공용으로 쓰는
`main-gateway` 가 80/443 을 점유하고 있습니다. 이 스택을 띄우면 **포트 충돌로
기존 서비스가 모두 죽습니다.**

실제 배포 방법은 상위 폴더의 [README.md](../README.md) 를 보세요.

## 이 폴더를 쓰는 경우

EverTreasure 만 올라가는 새 서버를 따로 만들 때입니다. 그때는 이 안의 파일들을
서버로 옮기고 `docker-compose.server.yml` 로 기동합니다.

| 파일 | 역할 |
|---|---|
| `docker-compose.server.yml` | site + proxy + certbot 3개 컨테이너 |
| `nginx/conf.d/` | 앞단 Nginx — 상용 도메인 5개 |
| `nginx-dev/conf.d/` | 앞단 Nginx — 개발 도메인용 |

### ⚠ 내용이 최신이 아닙니다

- `nginx-dev/conf.d/` 는 개발 도메인 **2개**(shiro·tenzo) 기준입니다.
  현재 개발 도메인은 5개(bella·lumi·nua·shiro·tenzo)이므로 그대로 쓰면
  나머지 3개는 인증서도 라우팅도 되지 않습니다.
- `docker-compose.server.yml` 의 certbot·proxy 구성 자체는 유효합니다.

실제로 쓸 일이 생기면 `../gateway/evertreasure.gateway.conf` 의
도메인 목록·`map $host $et_robots` 를 옮겨와 갱신하세요.
