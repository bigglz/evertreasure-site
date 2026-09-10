'use client';

/**
 * 아코디언 (핵심기술 / 플랫폼 섹션 공용).
 * 원본의 Bootstrap collapse 동작(한 번에 하나만 열림, 높이 애니메이션)을 React로 재현했습니다.
 * 항목 데이터는 content/sections.ts 에서 수정하세요.
 */

import { Fragment, useEffect, useRef, useState } from 'react';
import type { AccordionItemData } from '@content/sections';
import { useI18n } from '@/lib/i18n';
import { asset } from '@/lib/basePath';

function CollapsePanel({ open, marginBottom, children }: { open: boolean; marginBottom?: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (first.current) {
      // 첫 렌더링에서는 애니메이션 없이 상태만 반영
      el.style.height = open ? 'auto' : '0px';
      first.current = false;
      return;
    }
    if (open) {
      el.style.height = `${el.scrollHeight}px`;
      const done = () => {
        el.style.height = 'auto';
        el.removeEventListener('transitionend', done);
      };
      el.addEventListener('transitionend', done);
    } else {
      el.style.height = `${el.scrollHeight}px`;
      // 강제 리플로우 후 0으로 접기
      void el.offsetHeight;
      el.style.height = '0px';
    }
  }, [open]);

  return (
    <div
      ref={ref}
      style={{ overflow: 'hidden', transition: 'height 0.35s ease', marginBottom: open ? marginBottom : 0 }}
      aria-hidden={!open}
    >
      {children}
    </div>
  );
}

export default function Accordion({
  items,
  panelMarginBottom,
  variant = 'coreTech',
}: {
  items: AccordionItemData[];
  /** 원본에서 core-tech 패널에만 있던 margin-bottom(px) */
  panelMarginBottom?: number;
  /** 본문 단락 스타일: 핵심기술(coreTech)과 플랫폼(platform)의 원본 마크업이 다릅니다 */
  variant?: 'coreTech' | 'platform';
}) {
  const { t, html, lang } = useI18n();
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div>
      {items.map((item, index) => {
        const open = openId === item.id;
        // 언어별 이미지를 지정한 항목은 현재 언어에 맞는 경로를 씁니다.
        const imageSrc = typeof item.image === 'string' ? item.image : item.image[lang];
        return (
          <Fragment key={item.id}>
            {index > 0 && (
              <div className="overflow-hidden">
                <div className="br-line effectFade fadeUp"></div>
              </div>
            )}
            <div className="overflow-hidden">
              <div className="service-accordion_item effectFade fadeUp" role="presentation">
                <div
                  className={`accordion-action ${open ? '' : 'collapsed'}`}
                  role="button"
                  aria-expanded={open}
                  aria-controls={item.id}
                  style={{ gap: 24, marginBottom: 24, paddingTop: 10 }}
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  <h5
                    className="text letter-space--2 text-black-72"
                    style={{ color: 'var(--black-56)', fontWeight: 700, lineHeight: '30px' }}
                  >
                    {t(item.titleKey)}
                  </h5>
                  <div className="ic-wrap">
                    <span className="ic-accordion-custom"></span>
                  </div>
                </div>
                <CollapsePanel open={open} marginBottom={panelMarginBottom}>
                  <div className="accordion-content">
                    <div className="tf-grid-layout sm-col-1">
                      <div className="service-image">
                        <div className="wrap_image">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img width={340} height={206} src={asset(imageSrc)} alt="Image" />
                        </div>
                      </div>
                    </div>
                    {item.paragraphKeys?.map((key) =>
                      variant === 'platform' ? (
                        <p
                          key={key}
                          className="service-desc text-black-56"
                          style={{ marginBottom: 18 }}
                          dangerouslySetInnerHTML={html(key)}
                        />
                      ) : (
                        <p key={key} style={{ color: 'rgba(0, 0, 0, 0.72)' }} dangerouslySetInnerHTML={html(key)} />
                      ),
                    )}
                    {item.bulletKeys && (
                      <ul className="bullet-list">
                        {item.bulletKeys.map((key) => (
                          <li key={key} dangerouslySetInnerHTML={html(key)} />
                        ))}
                      </ul>
                    )}
                  </div>
                </CollapsePanel>
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
