import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import gsap from 'gsap';

const Scene3D = lazy(() => import('./components/Scene3D'));
import Cursor from './components/Cursor';
import Nav from './components/Nav';
import Loader from './components/Loader';
import Hero from './sections/Hero';
import About from './sections/About';
import Skills from './sections/Skills';
import TechStack from './sections/TechStack';
import Experience from './sections/Experience';
import Work from './sections/Work';
import Contact from './sections/Contact';
import './index.css';

const TOTAL = 7;
const SECTION_NAMES = ['Home', 'About', 'Skills', 'Stack', 'Experience', 'Work', 'Contact'];
const SectionList = [Hero, About, Skills, TechStack, Experience, Work, Contact];
const SCROLL_EPSILON = 2;

function isScrollableElement(node) {
  if (!node || node.nodeType !== 1) return false;

  const style = window.getComputedStyle(node);
  const overflowY = style.overflowY;
  const canOverflow = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';

  return canOverflow && node.scrollHeight - node.clientHeight > SCROLL_EPSILON;
}

function findScrollContainer(target, sectionWrapper) {
  let node = target && target.nodeType === 1 ? target : null;

  while (node && node !== sectionWrapper) {
    if (isScrollableElement(node)) return node;
    node = node.parentElement;
  }

  const sectionRoot = sectionWrapper?.firstElementChild;
  if (isScrollableElement(sectionRoot)) return sectionRoot;

  return null;
}

function canScrollInDirection(node, direction) {
  if (!node) return false;

  if (direction > 0) {
    return node.scrollTop + node.clientHeight < node.scrollHeight - SCROLL_EPSILON;
  }

  return node.scrollTop > SCROLL_EPSILON;
}

export default function App() {
  const [current, setCurrent] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);
  const currentRef = useRef(0);
  const isTransitioning = useRef(false);
  const sectionRefs = useRef([]);
  const progressRef = useRef(null);
  const touchStateRef = useRef({ startY: 0, scrollEl: null, scrollTop: 0 });

  // ref callback — only applies initial hide/show ONCE per element (uses dataset flag)
  const setRef = useCallback((el, index) => {
    if (!el) return;
    sectionRefs.current[index] = el;

    // Guard: only set initial styles on first mount
    if (el.dataset.init) return;
    el.dataset.init = '1';

    if (index === 0) {
      el.style.cssText = 'position:absolute;inset:0;opacity:1;transform:translateY(0px) scale(1);pointer-events:all;will-change:transform,opacity;';
    } else {
      el.style.cssText = 'position:absolute;inset:0;opacity:0;transform:translateY(60px) scale(0.97);pointer-events:none;will-change:transform,opacity;';
    }
  }, []);

  // Progress bar
  useEffect(() => {
    if (!progressRef.current) return;
    const pct = (current / (TOTAL - 1)) * 100;
    gsap.to(progressRef.current, { width: `${pct}%`, duration: 0.6, ease: 'power2.out' });
  }, [current]);

  const goTo = useCallback((next) => {
    const cur = currentRef.current;
    const nextWrapped = ((next % TOTAL) + TOTAL) % TOTAL;
    if (nextWrapped === cur || isTransitioning.current) return;

    const fromEl = sectionRefs.current[cur];
    const toEl = sectionRefs.current[nextWrapped];
    if (!fromEl || !toEl) return;

    isTransitioning.current = true;
    gsap.killTweensOf([fromEl, toEl]);

    const onDone = () => {
      gsap.set(fromEl, { opacity: 0, y: 0, scale: 1, pointerEvents: 'none' });
      currentRef.current = nextWrapped;
      setCurrent(nextWrapped);
      setTimeout(() => { isTransitioning.current = false; }, 300);
    };

    const isWrap = (cur === TOTAL - 1 && nextWrapped === 0) || (cur === 0 && nextWrapped === TOTAL - 1);
    const tl = gsap.timeline({ onComplete: onDone });

    if (isWrap) {
      // Wrap transition: explicit fromTo so GSAP can't use stale cached state
      tl.fromTo(fromEl,
        { opacity: 1, scale: 1, y: 0 },
        { opacity: 0, scale: 0.92, duration: 0.55, ease: 'power2.inOut' },
        0
      );
      tl.fromTo(toEl,
        { opacity: 0, scale: 1.06, y: 0, pointerEvents: 'none' },
        { opacity: 1, scale: 1, pointerEvents: 'all', duration: 0.65, ease: 'power2.out' },
        0.3
      );
    } else {
      const dir = next >= cur ? 1 : -1;
      tl.fromTo(fromEl,
        { opacity: 1, y: 0, scale: 1 },
        { y: dir * -80, opacity: 0, scale: 1.02, duration: 0.5, ease: 'power2.in' },
        0
      );
      tl.fromTo(toEl,
        { y: dir * 70, opacity: 0, scale: 0.97, pointerEvents: 'none' },
        { y: 0, opacity: 1, scale: 1, pointerEvents: 'all', duration: 0.6, ease: 'power3.out' },
        0
      );
    }
  }, []);

  const getScrollContainerForTarget = useCallback((target) => {
    const activeSection = sectionRefs.current[currentRef.current];
    return findScrollContainer(target, activeSection);
  }, []);

  useEffect(() => {
    const activeSection = sectionRefs.current[current];
    const scrollEl = findScrollContainer(activeSection?.firstElementChild, activeSection);

    if (!scrollEl) {
      setNavScrolled(false);
      return;
    }

    const syncNavScroll = () => {
      setNavScrolled(scrollEl.scrollTop > 12);
    };

    syncNavScroll();
    scrollEl.addEventListener('scroll', syncNavScroll, { passive: true });

    return () => {
      scrollEl.removeEventListener('scroll', syncNavScroll);
    };
  }, [current]);

  // Wheel — accumulate delta so a light trackpad touch doesn't trigger navigation
  useEffect(() => {
    let accumulated = 0;

    const handler = (e) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX) || e.deltaY === 0) return;
      if (isTransitioning.current) {
        accumulated = 0;
        e.preventDefault();
        return;
      }

      const direction = e.deltaY > 0 ? 1 : -1;
      const scrollEl = getScrollContainerForTarget(e.target);
      if (scrollEl && canScrollInDirection(scrollEl, direction)) {
        accumulated = 0;
        return;
      }

      e.preventDefault();
      accumulated += e.deltaY;
      if (Math.abs(accumulated) >= 80) {
        goTo(currentRef.current + direction);
        accumulated = 0;
      }
    };

    window.addEventListener('wheel', handler, { passive: false });
    return () => window.removeEventListener('wheel', handler);
  }, [getScrollContainerForTarget, goTo]);

  // Keyboard
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(currentRef.current + 1);
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goTo(currentRef.current - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goTo]);

  // Touch
  useEffect(() => {
    const onStart = (e) => {
      const scrollEl = getScrollContainerForTarget(e.target);

      touchStateRef.current = {
        startY: e.touches[0].clientY,
        scrollEl,
        scrollTop: scrollEl?.scrollTop ?? 0,
      };
    };

    const onEnd = (e) => {
      if (isTransitioning.current) return;

      const diff = touchStateRef.current.startY - e.changedTouches[0].clientY;
      if (Math.abs(diff) <= 50) return;

      const direction = diff > 0 ? 1 : -1;
      const { scrollEl, scrollTop } = touchStateRef.current;

      if (scrollEl) {
        const hasScrolled = Math.abs(scrollEl.scrollTop - scrollTop) > 8;
        if (hasScrolled || canScrollInDirection(scrollEl, direction)) return;
      }

      goTo(currentRef.current + direction);
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [getScrollContainerForTarget, goTo]);

  return (
    <>
      <Loader onComplete={() => {}} />
      <Cursor />
      <div className="noise" />
      <Suspense
        fallback={
          <div className="canvas-container" style={{ pointerEvents: 'none' }} aria-hidden />
        }
      >
        <Scene3D currentSection={current} paused={current === 3} />
      </Suspense>

      {/* Readability gradient */}
      <div
        className="readability-overlay"
        style={{
          position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 20% 50%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.82) 60%)',
        }}
      />

      <div ref={progressRef} className="progress-bar" style={{ width: '0%' }} />

      <Nav current={current} isScrolled={navScrolled} onNavigate={goTo} />

      <div className="section-dots">
        {SECTION_NAMES.map((name, i) => (
          <button
            key={i}
            className={`section-dot ${current === i ? 'active' : ''}`}
            onClick={() => goTo(i)}
            title={name}
          />
        ))}
      </div>

      {/* Counter */}
      <div
        className="section-counter"
        style={{
          position: 'fixed', left: 28, bottom: 32, zIndex: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}
      >
        <span
          className="section-counter-text"
          style={{
            writingMode: 'vertical-rl', fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
          }}
        >
          {String(current + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
        </span>
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(230,50,50,0.5), transparent)' }} />
      </div>

      {/* Section watermark */}
      <div
        className="section-watermark"
        style={{
          position: 'fixed', right: 60, bottom: 32, zIndex: 100,
          fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.1)', fontFamily: 'var(--font-display)',
        }}
      >
        {SECTION_NAMES[current]}
      </div>

      {/* Sections container */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
        {SectionList.map((Section, i) => (
          <div key={i} ref={(el) => setRef(el, i)}>
            <Section
              active={current === i}
              onNext={() => goTo(i + 1)}
              onPrev={() => goTo(i - 1)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
