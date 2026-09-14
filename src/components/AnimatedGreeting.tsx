'use client';

/**
 * 인사말 텍스트 클립 애니메이션. (원본 animation-change-text.js의 "clip" 타입 이식)
 * 동작: 단어 표시 → 1.5초 대기 → 너비를 2px로 접기 → 단어 교체 → 다시 펼치기 → 반복
 */

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';

const REVEAL_DURATION = 600; // 접히고 펼쳐지는 시간(ms)
const INITIAL_DELAY = 2500; // 첫 애니메이션까지 대기(ms)
const HOLD_DELAY = 1500; // 단어가 펼쳐진 뒤 유지 시간(ms)

export default function AnimatedGreeting({ helloKeys }: { helloKeys: [string, string, string] }) {
  const { t } = useI18n();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const words = [t(helloKeys[1]), t(helloKeys[2])];

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let cancelled = false;
    let raf = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    const measure = () => {
      const visible = wrapper.querySelector<HTMLElement>('.item-text.is-visible');
      return (visible?.offsetWidth ?? 0) + 10;
    };

    const animateWidth = (to: number) =>
      new Promise<void>((resolve) => {
        const from = wrapper.offsetWidth;
        const start = performance.now();
        const step = (now: number) => {
          if (cancelled) return;
          const progress = Math.min((now - start) / REVEAL_DURATION, 1);
          // jQuery.animate의 기본 easing(swing)과 유사한 곡선
          const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
          wrapper.style.width = `${from + (to - from) * eased}px`;
          if (progress < 1) raf = requestAnimationFrame(step);
          else resolve();
        };
        raf = requestAnimationFrame(step);
      });

    const run = async () => {
      wrapper.style.width = `${measure()}px`;
      await wait(INITIAL_DELAY);
      while (!cancelled) {
        await animateWidth(2);
        if (cancelled) break;
        setVisibleIndex((prev) => (prev + 1) % 2);
        // 상태 반영(단어 교체) 후 다음 프레임에서 새 단어 너비로 펼치기
        await wait(30);
        await animateWidth(measure());
        await wait(HOLD_DELAY);
      }
    };

    run();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
    // 언어가 바뀌면 단어 너비가 달라지므로 다시 시작합니다.
  }, [words[0], words[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <h5
      className="greeting letter-space--2 text-white animationtext clip"
      style={{ fontWeight: 900, fontSize: 26 }}
    >
      {/* <h5>는 phrasing content만 허용하므로 <p> 대신 block span을 씁니다.
          (전역 리셋으로 p의 margin이 0이라 display:block span과 렌더링 결과가 동일합니다) */}
      <span style={{ display: 'block' }}>{t(helloKeys[0])}</span>
      <span className="cd-words-wrapper" ref={wrapperRef}>
        {words.map((word, i) => (
          <span key={i} className={`item-text ${visibleIndex === i ? 'is-visible' : 'is-hidden'}`}>
            {word}
          </span>
        ))}
      </span>
    </h5>
  );
}
