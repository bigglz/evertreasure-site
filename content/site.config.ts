/**
 * ============================================================
 * 사이트 전역 설정 파일
 *
 * 이 파일만 수정하면 사이트의 기본 정보(제목, 캐릭터, SNS 링크 등)를
 * 바꿀 수 있습니다. 코드 지식이 없어도 값만 바꾸면 됩니다.
 * 수정 후 저장하면 개발 서버(npm run dev)에서 즉시 반영됩니다.
 * ============================================================
 */

/** 사이드바에 표시할 캐릭터. 아래 5개 중 하나를 골라 적으세요. */
export type CharacterId = 'lumi' | 'tenzo' | 'bella' | 'nua' | 'shiro';

export const siteConfig = {
  // ── 브라우저 탭 제목 & 검색엔진/SNS 공유 설명 ──────────────
  title: '에버트레져 | 글로벌 문화 금융의 리더',
  description: '에버트레져 | 글로벌 문화 금융의 리더',
  ogTitle: '에버트레져',
  ogDescription: '글로벌 문화 금융의 리더',
  /** SNS 공유 시 보이는 대표 이미지 (public 폴더 기준 경로) */
  ogImage: '/assets/images/og.jpg',

  // ── 좌측 사이드바에 표시할 캐릭터 ──────────────────────────
  // 'lumi'(북극여우) | 'tenzo'(바다거북) | 'bella'(핑크돌고래) | 'nua'(오랑우탄) | 'shiro'(코뿔소)
  //
  // 접속한 도메인(호스트명)에 따라 캐릭터가 자동으로 결정됩니다.
  //   https://evertreasure-bella.bigglz.com  → bella
  //   https://evertreasure-lumi.bigglz.com   → lumi
  // 규칙에 맞지 않는 주소(localhost, IP 직접 접속, 오타 도메인 등)에서는
  // 아래 character 값이 그대로 사용됩니다.

  /**
   * 호스트명에서 캐릭터 ID를 뽑아내는 규칙.
   * 첫 번째 괄호 ( ) 안에 잡힌 문자열을 캐릭터 ID로 사용하며,
   * 위 5개 ID 중 하나와 정확히 일치할 때만 적용됩니다.
   * 도메인 형식이 바뀌면 이 규칙만 수정하세요. (예: /^([a-z0-9]+)\.evertreasure\.com$/)
   */
  characterHostPattern: /^evertreasure-([a-z0-9]+)\./,

  /** 도메인 규칙에 맞지 않을 때 사용할 기본 캐릭터 (개발 서버에서도 이 값이 보입니다) */
  character: 'bella' as CharacterId,

  // ── SNS 링크 (비워두면("") 해당 아이콘이 숨겨집니다) ────────
  social: {
    // 인스타그램은 언어(KO/EN)별로 다른 링크를 쓰므로 번역 파일의 LINK_INSTAGRAM 키를 사용합니다.
    linkedin:
      'https://www.linkedin.com/company/evertreasure/?utm_source=linkedin&utm_medium=main_image_sns_icon&utm_campaign=company_nfc&utm_term=evertreasure',
    youtube:
      'https://www.youtube.com/@yeatu.global?utm_source=youtube&utm_medium=main_image_sns_icon&utm_campaign=company_nfc&utm_term=evertreasure',
  },

  // ── 문의(Contact) 폼 ───────────────────────────────────────
  contact: {
    /** 같은 브라우저에서 하루 1회만 전송 허용 (원본 사이트와 동일한 동작) */
    limitOncePerDay: true,
  },

  // ── 기타 표시 옵션 ─────────────────────────────────────────
  /** 좌측 상단 현재 날짜/시계 표시 여부 (원본 사이트는 꺼져 있음) */
  showClock: false,
  /** 마우스 휠 스크롤 부드럽게 보정 (원본 사이트와 동일하게 켜짐) */
  smoothScroll: true,
};

/**
 * 캐릭터별 이미지/비디오/문구 매핑.
 * 캐릭터 이미지를 교체하려면 public/assets/images/motion/ 폴더의 파일을
 * 같은 이름으로 덮어쓰거나, 아래 경로를 새 파일명으로 바꾸세요.
 * 문구를 바꾸려면 content/translations/ko.json, en.json에서 해당 키를 수정하세요.
 */
export const characters: Record<
  CharacterId,
  {
    /** 정지 이미지 (2초 표시 후 비디오 재생) */
    image: string;
    /** 모션 비디오 (재생 종료 후 다시 이미지로) */
    video: string;
    /** 캐릭터 이름/종 표기 번역 키 */
    titleKey: string;
    /** 인사말 첫 줄 번역 키 ("안녕하세요.") */
    helloKeys: [string, string, string];
    /** 소개 문구 번역 키 */
    greetingKey: string;
  }
> = {
  lumi: {
    image: '/assets/images/motion/Lumi_img_01.webp',
    video: '/assets/images/motion/Lumi_01.mp4',
    titleKey: 'TITLE',
    helloKeys: ['HELLO_ANI_01', 'HELLO_ANI_02', 'HELLO_ANI_03'],
    greetingKey: 'GREETING_LUMI',
  },
  tenzo: {
    image: '/assets/images/motion/Tenzo_img_01.webp',
    video: '/assets/images/motion/Tenzo_01.mp4',
    titleKey: 'TITLE_2',
    helloKeys: ['HELLO_TENZO_01', 'HELLO_TENZO_02', 'HELLO_TENZO_03'],
    greetingKey: 'GREETING_TENZO',
  },
  bella: {
    image: '/assets/images/motion/Bella_img_01.webp',
    video: '/assets/images/motion/Bella_01.mp4',
    titleKey: 'TITLE_3',
    helloKeys: ['HELLO_BELLA_01', 'HELLO_BELLA_02', 'HELLO_BELLA_03'],
    greetingKey: 'GREETING_BELLA',
  },
  nua: {
    image: '/assets/images/motion/Nua_img_01.webp',
    video: '/assets/images/motion/Nua_01.mp4',
    titleKey: 'TITLE_4',
    helloKeys: ['HELLO_NUA_01', 'HELLO_NUA_02', 'HELLO_NUA_03'],
    greetingKey: 'GREETING_NUA',
  },
  shiro: {
    image: '/assets/images/motion/Shiro_img_01.webp',
    video: '/assets/images/motion/Shiro_01.mp4',
    titleKey: 'TITLE_5',
    helloKeys: ['HELLO_SHIRO_01', 'HELLO_SHIRO_02', 'HELLO_SHIRO_03'],
    greetingKey: 'GREETING_SHIRO',
  },
};
