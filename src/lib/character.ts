/**
 * 접속한 도메인(호스트명)으로 표시할 캐릭터를 결정합니다.
 *
 *   https://evertreasure-bella.bigglz.com  → 'bella'
 *   https://evertreasure-lumi.bigglz.com   → 'lumi'
 *
 * 이 프로젝트는 정적 사이트(output: 'export')로 빌드되므로 NEXT_PUBLIC_* 환경 변수는
 * 빌드 시점에 값이 고정됩니다. 따라서 하나의 빌드/컨테이너로 여러 도메인을 서비스하려면
 * 캐릭터 판별을 브라우저(런타임)에서 해야 합니다. 서버·Nginx 설정은 전혀 필요 없습니다.
 *
 * 도메인 규칙은 content/site.config.ts 의 characterHostPattern 에서 수정하세요.
 */

import { siteConfig, characters, type CharacterId } from '@content/site.config';

/** 문자열이 실제로 등록된 캐릭터 ID인지 검사 (오타·없는 캐릭터 방어) */
function isCharacterId(value: string | null | undefined): value is CharacterId {
  return !!value && Object.prototype.hasOwnProperty.call(characters, value);
}

/**
 * 현재 브라우저 주소로부터 캐릭터 ID를 반환합니다.
 * 우선순위: ?character= 쿼리 > 도메인 규칙 > siteConfig.character(기본값)
 *
 * 서버 렌더링 중에는 주소를 알 수 없으므로 항상 기본값을 반환합니다.
 * (실제 캐릭터는 브라우저에서 마운트된 뒤 적용됩니다 — 프리로더가 그 사이를 덮습니다.)
 */
export function resolveCharacterId(): CharacterId {
  if (typeof window === 'undefined') return siteConfig.character;

  // 배포 전 미리보기·QA용 오버라이드 (예: ...bigglz.com/?character=shiro)
  const override = new URLSearchParams(window.location.search).get('character');
  if (isCharacterId(override)) return override;

  // hostname 에는 포트 번호가 포함되지 않습니다.
  const matched = window.location.hostname.toLowerCase().match(siteConfig.characterHostPattern);
  const id = matched?.[1];

  return isCharacterId(id) ? id : siteConfig.character;
}
