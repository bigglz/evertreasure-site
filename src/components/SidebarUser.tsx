'use client';

/**
 * 좌측 캐릭터 사이드바: 프로필 이미지 ↔ 모션 비디오 자동 교차 재생, SNS 링크, 인사말.
 * (원본 User Sidebar + profileVideoToggle 이식)
 *
 * 표시할 캐릭터는 접속한 도메인에 따라 자동으로 결정됩니다. (src/lib/character.ts)
 * 도메인 규칙과 기본 캐릭터는 content/site.config.ts 에서 수정하세요.
 */

import { useEffect, useRef, useState } from 'react';
import { siteConfig, characters, type CharacterId } from '@content/site.config';
import { resolveCharacterId } from '@/lib/character';
import { useI18n } from '@/lib/i18n';
import { ThemeImage } from '@/lib/theme';
import { asset } from '@/lib/basePath';
import AnimatedGreeting from '@/components/AnimatedGreeting';

const IMAGE_HOLD_MS = 2000; // 이미지가 표시되는 시간

export default function SidebarUser() {
  const { t, html } = useI18n();
  // 서버 렌더링 시점에는 도메인을 알 수 없으므로 기본 캐릭터로 그려두고,
  // 마운트 직후 실제 도메인에 맞는 캐릭터로 교체합니다. (다크모드 처리와 같은 방식)
  const [characterId, setCharacterId] = useState<CharacterId>(siteConfig.character);
  const character = characters[characterId];
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCharacterId(resolveCharacterId());
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const imageWrap = imageWrapRef.current;
    if (!video || !imageWrap) return;

    let cycleStarted = false;
    let disposed = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    // <source>의 src가 바뀌어도 load()를 호출하지 않으면 브라우저가 새 파일을 읽지 않습니다.
    // 캐릭터가 교체될 때 이전 캐릭터 영상이 그대로 재생되는 것을 막습니다.
    // (iOS Safari에서는 최초 로드에도 이 호출이 필요합니다 — 원본과 동일)
    video.muted = true;
    video.load();

    const playVideo = () => {
      if (disposed) return;
      video.classList.add('active');
      imageWrap.classList.add('video-playing');
      video.currentTime = 0;
      video.play().catch(() => hideVideo());
    };

    const hideVideo = () => {
      if (disposed) return;
      video.classList.remove('active');
      imageWrap.classList.remove('video-playing');
      video.pause();
      later(playVideo, IMAGE_HOLD_MS);
    };

    const startCycle = () => {
      if (cycleStarted || disposed) return;
      cycleStarted = true;
      later(playVideo, IMAGE_HOLD_MS);
    };

    video.addEventListener('canplaythrough', startCycle);
    video.addEventListener('loadeddata', startCycle);
    video.addEventListener('ended', hideVideo);
    // 3초 후에도 시작되지 않으면 강제 시작 (iOS fallback, 원본과 동일)
    later(startCycle, 3000);

    return () => {
      disposed = true;
      timers.forEach(clearTimeout);
      video.removeEventListener('canplaythrough', startCycle);
      video.removeEventListener('loadeddata', startCycle);
      video.removeEventListener('ended', hideVideo);
      // 재생 중에 캐릭터가 바뀌어도 정지 이미지 상태에서 다시 시작하도록 되돌립니다.
      video.pause();
      video.classList.remove('active');
      imageWrap.classList.remove('video-playing');
    };
    // 캐릭터가 바뀌면 새 영상으로 사이클을 다시 시작합니다.
  }, [characterId]);

  return (
    <div className="sidebar-user">
      <div className="wrap">
        <div className="user-image">
          <div className="image" ref={imageWrapRef}>
            <picture>
              <source srcSet={asset(character.image)} type="image/webp" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="user-profile-img" width={468} height={624} src={asset(character.image)} alt="Image" />
            </picture>
            <video
              ref={videoRef}
              className="user-profile-video"
              muted
              playsInline
              preload="metadata"
              width={468}
              height={624}
            >
              <source src={asset(character.video)} type="video/mp4" />
            </video>
          </div>
        </div>
        <div className="user-logo d-none d-lg-block">
          <ThemeImage
            className="image-switch"
            light="/assets/images/logo/logo-black.webp"
            dark="/assets/images/logo/logo-white.webp"
            loading="lazy"
            width={40}
            height={40}
          />
        </div>
        <ul className="tf-social-icon-2 user-social d-grid">
          <li>
            <a href={t('LINK_INSTAGRAM')} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset('/assets/images/logo/insta.svg')} alt="Instagram" className="icon" />
            </a>
          </li>
          {siteConfig.social.linkedin && (
            <li>
              <a href={siteConfig.social.linkedin} target="_blank" rel="noreferrer">
                <i className="icon icon-linkin"></i>
              </a>
            </li>
          )}
          {siteConfig.social.youtube && (
            <li>
              <a href={siteConfig.social.youtube} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset('/assets/images/logo/youtube.svg')} alt="YouTube" className="icon" />
              </a>
            </li>
          )}
        </ul>
        <div className="user-info">
          <p className="avaiable-dot text-body-3 fw-medium d-sm-none">
            <span className="dot"></span>
            <span>{t(character.titleKey)}</span>
          </p>
          <AnimatedGreeting key={characterId} helloKeys={character.helloKeys} />
          <p
            className="introduce text-white-56 letter-space--05 text-body-3"
            style={{ marginBottom: 10 }}
            dangerouslySetInnerHTML={html(character.greetingKey)}
          />
        </div>
      </div>
    </div>
  );
}
