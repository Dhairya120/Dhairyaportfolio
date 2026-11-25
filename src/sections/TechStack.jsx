import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

const StackBalls = lazy(() => import('../components/StackBalls'));

export default function TechStack({ active }) {
  const ref = useRef(null);
  const splitTitle = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      splitTitle.current = new SplitType('.tech-title', { types: 'chars' });
      gsap.set(splitTitle.current.chars, { y: 40, opacity: 0 });
      gsap.set(['.tech-label', '.tech-sub', '.tech-bg-title', '.tech-canvas-shell'], {
        opacity: 0,
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!active) return;

    gsap.set(splitTitle.current.chars, { y: 40, opacity: 0 });
    gsap.set(['.tech-label', '.tech-sub', '.tech-bg-title', '.tech-canvas-shell'], {
      opacity: 0,
    });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });
      tl.to('.tech-label', { opacity: 1, duration: 0.4 })
        .to(splitTitle.current.chars, {
          y: 0, opacity: 1, stagger: 0.02, duration: 0.5, ease: 'power3.out',
        }, '-=0.15')
        .to('.tech-sub', { opacity: 1, duration: 0.4 }, '-=0.25')
        .to('.tech-bg-title', { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.35')
        .to('.tech-canvas-shell', { opacity: 1, duration: 0.6 }, '-=0.5');
    }, ref);

    return () => ctx.revert();
  }, [active]);

  return (
    <div
      className="tech-section"
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: active ? 'all' : 'none',
      }}
    >
      <div className="tech-intro">
        <span className="section-label tech-label" style={{ opacity: 0 }}>Interactive Physics</span>
        <h2 className="display-md tech-title">
          Tech <span className="text-red">Stack</span>
        </h2>
        <p className="body-lg tech-sub" style={{ opacity: 0 }}>
          Drag through the spheres — each ball is a tool I use to build products.
        </p>
      </div>

      <div className="tech-bg-title" aria-hidden style={{ opacity: 0 }}>
        MY STACK
      </div>

      <div className="tech-canvas-shell" style={{ opacity: 0 }}>
        {/* Mount physics canvas only while Stack is active — frees GPU elsewhere */}
        {active ? (
          <Suspense fallback={null}>
            <StackBalls active={active} />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}
