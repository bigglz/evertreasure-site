/**
 * ============================================================
 * 섹션별 목록 데이터
 *
 * 메뉴, 아코디언, 탐사대 카드, 투자 성과, 파트너 로고, 연혁 등
 * "반복되는 목록"은 전부 이 파일에서 관리합니다.
 * 항목을 추가/삭제/순서 변경하려면 아래 배열을 수정하세요.
 *
 * - textKey / titleKey 등 "~Key" 로 끝나는 값은 번역 키입니다.
 *   실제 문구는 content/translations/ko.json, en.json 에서 수정하세요.
 * - image 경로는 public 폴더 기준입니다. (예: /assets/images/...)
 * ============================================================
 */

/** 내비게이션 메뉴 (사이드바 + 모바일 메뉴 공용) */
export const navItems = [
  { href: '#home', icon: 'icon-home', labelKey: 'MENU_HOME', dividerAfter: true },
  { href: '#about', icon: 'icon-user-circle', labelKey: 'MENU_ABOUT' },
  { href: '#work', icon: 'icon-high-light', labelKey: 'MENU_VALUE_HUNTERS' },
  { href: '#investmentResult', icon: 'icon-tech-stack', labelKey: 'MENU_INVESTMENT_RESULTS' },
  { href: '#partners', icon: 'icon-service', labelKey: 'MENU_PARTNERS', dividerAfter: true },
  { href: '#contact', icon: 'icon-send', labelKey: 'MENU_CONTACT' },
];

/** 회사소개 해시태그 */
export const hashtagKeys = [
  'ABOUT_HASHTAG_FINTECH',
  'ABOUT_HASHTAG_FINANCE',
  'ABOUT_HASHTAG_AI',
  'ABOUT_HASHTAG_BLOCKCHAIN',
  'ABOUT_HASHTAG_VALIDATION',
  'ABOUT_HASHTAG_ART',
  'ABOUT_HASHTAG_FILM',
  'ABOUT_HASHTAG_MUSICAL',
  'ABOUT_HASHTAG_COMMUNITY',
  'ABOUT_HASHTAG_KCONTENT',
  'ABOUT_HASHTAG_STO',
  'ABOUT_HASHTAG_AI_VALUATION',
  'ABOUT_HASHTAG_GLOBAL_STANDARD',
];

/** 아코디언 항목 형태 (핵심기술 / 플랫폼 공용) */
export interface AccordionItemData {
  id: string;
  titleKey: string;
  image: string;
  /** 본문 문단 번역 키 목록 (없으면 생략 가능) */
  paragraphKeys?: string[];
  /** 불릿 목록 번역 키 목록 (없으면 생략 가능) */
  bulletKeys?: string[];
}

/** 핵심기술 아코디언 */
export const coreTechItems: AccordionItemData[] = [
  {
    id: 'core-tech-1',
    titleKey: 'CORE_TECH_EVERSEAL_TITLE',
    image: '/assets/images/section/everSeal.webp',
    paragraphKeys: ['CORE_TECH_EVERSEAL_CONCEPT', 'CORE_TECH_EVERSEAL_DESC'],
    bulletKeys: ['CORE_TECH_EVERSEAL_TAMPERPROOF', 'CORE_TECH_EVERSEAL_TRACKING', 'CORE_TECH_EVERSEAL_TARGET'],
  },
  {
    id: 'core-tech-2',
    titleKey: 'CORE_TECH_VALQ_TITLE',
    image: '/assets/images/section/VALQ.webp',
    paragraphKeys: ['CORE_TECH_VALQ_CONCEPT', 'CORE_TECH_VALQ_DESC'],
    bulletKeys: ['CORE_TECH_VALQ_DATA', 'CORE_TECH_VALQ_INVESTMENT_STANDARD'],
  },
];

/** 플랫폼 아코디언 */
export const platformItems: AccordionItemData[] = [
  {
    id: 'platform-1',
    titleKey: 'PLATFORM_YEATU_TITLE',
    image: '/assets/images/section/platform_yeatu.webp',
    paragraphKeys: ['PLATFORM_YEATU_DESC'],
  },
  {
    id: 'platform-2',
    titleKey: 'PLATFORM_EVERLYNQ_TITLE',
    image: '/assets/images/section/platform_everlynq.webp',
    paragraphKeys: ['PLATFORM_EVERLYNQ_DESC'],
  },
  {
    id: 'platform-3',
    titleKey: 'PLATFORM_OWNIT_TITLE',
    image: '/assets/images/section/platform_ownit.webp',
    paragraphKeys: ['PLATFORM_OWNIT_DESC'],
  },
];

/** 연혁 타임라인 (연도별) */
export const timelineItems = [
  {
    year: '2026',
    entryKeys: [
      'ABOUT_HISTORY_2026_TITLE',
      'ABOUT_HISTORY_2026_M08',
      'ABOUT_HISTORY_2026_M07',
      'ABOUT_HISTORY_2026_M06',
      'ABOUT_HISTORY_2026_M05',
      'ABOUT_HISTORY_2026_M04',
      'ABOUT_HISTORY_2026_M03',
      'ABOUT_HISTORY_2026_M02',
      'ABOUT_HISTORY_2026_M01',
    ],
  },
  {
    year: '2025',
    entryKeys: [
      'ABOUT_HISTORY_2025_TITLE',
      'ABOUT_HISTORY_2025_TIPS',
      'ABOUT_HISTORY_2025_KIBO',
      'ABOUT_HISTORY_2025_BNK',
      'ABOUT_HISTORY_2025_GLOBAL_ENTITY',
      'ABOUT_HISTORY_2025_PREA',
    ],
  },
  {
    year: '2024',
    entryKeys: [
      'ABOUT_HISTORY_2024_TITLE',
      'ABOUT_HISTORY_2024_YEATU_LAUNCH',
      'ABOUT_HISTORY_2024_SEED',
      'ABOUT_HISTORY_2024_MSIT_AWARD',
      'ABOUT_HISTORY_2024_MCST_AWARD',
    ],
  },
  {
    year: '2023',
    entryKeys: [
      'ABOUT_HISTORY_2023_TITLE',
      'ABOUT_HISTORY_2023_ESTABLISH',
      'ABOUT_HISTORY_2023_ANGEL',
      'ABOUT_HISTORY_2023_STO_PATENT',
      'ABOUT_HISTORY_2023_ICT_SPRING',
    ],
  },
];

/** 가치 탐사대 캐릭터 카드 (스크롤 시 순서대로 고정되는 카드들) */
export const hunterCards = [
  {
    image: '/assets/images/section/hunters_lumi.webp',
    nameKey: 'VALUE_HUNTERS_LUMI_NAME',
    descKey: 'VALUE_HUNTERS_LUMI_DESC',
  },
  {
    image: '/assets/images/section/hunters_tenzo.webp',
    nameKey: 'VALUE_HUNTERS_TENZO_NAME',
    descKey: 'VALUE_HUNTERS_TENZO_DESC',
  },
  {
    image: '/assets/images/section/hunters_bella.webp',
    nameKey: 'VALUE_HUNTERS_BELLA_NAME',
    descKey: 'VALUE_HUNTERS_BELLA_DESC',
  },
  {
    image: '/assets/images/section/hunters_nua.webp',
    nameKey: 'VALUE_HUNTERS_NUA_NAME',
    descKey: 'VALUE_HUNTERS_NUA_DESC',
  },
  {
    image: '/assets/images/section/hunters_shiro.webp',
    nameKey: 'VALUE_HUNTERS_SHIRO_NAME',
    descKey: 'VALUE_HUNTERS_SHIRO_DESC',
  },
];

/** 투자 성과 카드 */
export const investmentItems = [
  { image: '/assets/images/item/invest_01.webp', nameKey: 'RESULT_ITEM_01', statusKey: 'RESULT_STATUS_FUNDED' },
  { image: '/assets/images/item/invest_02.webp', nameKey: 'RESULT_ITEM_02', statusKey: 'RESULT_STATUS_FUNDED' },
  { image: '/assets/images/item/invest_03.webp', nameKey: 'RESULT_ITEM_03', statusKey: 'RESULT_STATUS_FUNDED' },
  { image: '/assets/images/item/invest_04.webp', nameKey: 'RESULT_ITEM_04', statusKey: 'RESULT_STATUS_FUNDED' },
  { image: '/assets/images/item/invest_05.webp', nameKey: 'RESULT_ITEM_05', statusKey: 'RESULT_STATUS_FUNDED' },
  { image: '/assets/images/item/invest_06.webp', nameKey: 'RESULT_ITEM_06', statusKey: 'RESULT_STATUS_FUNDED' },
  { image: '/assets/images/item/invest_07.webp', nameKey: 'RESULT_ITEM_07', statusKey: 'RESULT_STATUS_FUNDED' },
  { image: '/assets/images/item/invest_08.webp', nameKey: 'RESULT_ITEM_08', statusKey: 'RESULT_STATUS_FUNDED' },
  { image: '/assets/images/item/invest_09.webp', nameKey: 'RESULT_ITEM_09', statusKey: 'RESULT_STATUS_FUNDED' },
];

/** 파트너 로고 (그룹별 무한 롤링 슬라이드) */
export const partnerGroups = [
  {
    titleKey: 'PARTNER_FINANCE',
    logos: [
      '/assets/images/partners/p1.webp',
      '/assets/images/partners/p2.webp',
      '/assets/images/partners/p3.webp',
      '/assets/images/partners/p4.webp',
      '/assets/images/partners/p5.webp',
      '/assets/images/partners/p6.webp',
      '/assets/images/partners/p7.webp',
      '/assets/images/partners/p8.webp',
      '/assets/images/partners/p9.webp',
      '/assets/images/partners/p10.webp',
      '/assets/images/partners/p11.webp',
      '/assets/images/partners/p12.webp',
      '/assets/images/partners/p13.webp',
      '/assets/images/partners/p14.webp',
    ],
  },
  {
    titleKey: 'PARTNER_PUBLIC',
    logos: [
      '/assets/images/partners/pp1.webp',
      '/assets/images/partners/pp2.webp',
      '/assets/images/partners/pp3.webp',
      '/assets/images/partners/pp4.webp',
      '/assets/images/partners/pp5.webp',
      '/assets/images/partners/pp6.webp',
      '/assets/images/partners/pp7.webp',
      '/assets/images/partners/pp8.webp',
      '/assets/images/partners/pp9.webp',
      '/assets/images/partners/pp10.webp',
      '/assets/images/partners/pp11.webp',
    ],
  },
  {
    titleKey: 'PARTNER_ACADEMIC',
    logos: [
      '/assets/images/partners/ppp1.webp',
      '/assets/images/partners/ppp2.webp',
      '/assets/images/partners/ppp3.webp',
      '/assets/images/partners/ppp4.webp',
      '/assets/images/partners/ppp5.webp',
      '/assets/images/partners/ppp6.webp',
    ],
  },
  {
    titleKey: 'PARTNER_GALLERY',
    logos: [
      '/assets/images/partners/pppp1.webp',
      '/assets/images/partners/pppp2.webp',
      '/assets/images/partners/pppp3.webp',
      '/assets/images/partners/pppp4.webp',
      '/assets/images/partners/pppp5.webp',
    ],
  },
];
