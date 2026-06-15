"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const SCROLL_TRIGGER_TIME = 2.5;
const SMOOTH_SCROLL_DURATION = 1000;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function useHeroScrollTrigger() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [triggered, setTriggered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const triggerRef = useRef(false);

  const triggerPlay = useCallback(() => {
    if (triggerRef.current) return;
    triggerRef.current = true;
    setTriggered(true);
    setPlaying(true);
    
    const video = videoRef.current;
    if (video) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(err => {
          console.warn('Video play blocked:', err);
          forceProceed();
        });
      }
    }
    
    setTimeout(forceProceed, 3500);
  }, []);

  const forceProceed = useCallback(() => {
    // Definimos dummy forceProceed que luego se sobreescribe en useEffect
    // o simplemente accedemos a autoScrollStarted globalmente.
    // Usaremos un CustomEvent o similar para evitar cierres asíncronos complejos.
    window.dispatchEvent(new Event('force-proceed'));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let autoScrollStarted = false;
    let scrollUnlocked = reducedMotion;
    let videoReady = false;

    const hardLockMobile = !reducedMotion && window.matchMedia('(hover: none)').matches;

    function setScrollLock(on: boolean) {
      if (on && hardLockMobile) {
        document.documentElement.classList.add('locked');
      } else {
        document.documentElement.classList.remove('locked');
      }
    }

    function unlockScroll() {
      scrollUnlocked = true;
      setScrollLock(false);
    }

    setScrollLock(true);

    const onLoadedData = () => {
      videoReady = true;
      if (!triggerRef.current) {
        video.pause();
        video.currentTime = 0;
      }
    };

    const onTimeUpdate = () => {
      if (video.duration && !isNaN(video.duration)) {
        window.dispatchEvent(new CustomEvent("video-progress", {
          detail: { progress: (video.currentTime / video.duration) * 100 }
        }));
      }
      if (!autoScrollStarted && !reducedMotion && video.currentTime >= SCROLL_TRIGGER_TIME) {
        autoScrollStarted = true;
        startAutoScroll();
      }
    };

    const onEnded = () => {
      window.dispatchEvent(new CustomEvent("video-progress", {
        detail: { progress: 100 }
      }));
    };

    function startAutoScroll() {
      setScrollLock(false);
      window.scrollTo(0, 0);
      const startY = window.scrollY;
      const targetY = window.innerHeight;
      const distance = targetY - startY;
      const startTime = performance.now();

      function step(now: number) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / SMOOTH_SCROLL_DURATION, 1);
        window.scrollTo(0, startY + distance * easeInOutCubic(t));
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          unlockScroll();
        }
      }
      requestAnimationFrame(step);
    }

    const actualForceProceed = () => {
      if (autoScrollStarted) {
        unlockScroll();
        return;
      }
      autoScrollStarted = true;
      startAutoScroll();
      setTimeout(unlockScroll, SMOOTH_SCROLL_DURATION + 600);
    };

    const onError = () => unlockScroll();
    
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);
    window.addEventListener('force-proceed', actualForceProceed);

    const videoSource = video.querySelector('source');
    if (videoSource) {
      videoSource.addEventListener('error', onError);
    }

    function isLocked() { return !scrollUnlocked; }

    function onWheel(e: WheelEvent) {
      if (isLocked()) {
        e.preventDefault();
        if (!triggerRef.current && e.deltaY > 0) triggerPlay();
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (isLocked()) e.preventDefault();
    }

    function onTouchEnd() {
      if (isLocked() && !triggerRef.current) triggerPlay();
    }

    function onKeyDown(e: KeyboardEvent) {
      const downKeys = ['ArrowDown', 'PageDown', ' ', 'Spacebar'];
      if (isLocked() && downKeys.includes(e.key)) {
        e.preventDefault();
        if (!triggerRef.current) triggerPlay();
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    const readyTimeout = setTimeout(() => {
      if (!videoReady && video.readyState >= 1) videoReady = true;
    }, 1000);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('force-proceed', actualForceProceed);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
      if (videoSource) videoSource.removeEventListener('error', onError);
      clearTimeout(readyTimeout);
      setScrollLock(false);
    };
  }, [triggerPlay]);

  return { videoRef, triggered, playing, triggerPlay };
}
