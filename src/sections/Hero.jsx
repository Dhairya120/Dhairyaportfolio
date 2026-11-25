import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

export default function Hero({ active, onNext }) {
  const containerRef = useRef(null);
  const splitHeadline = useRef(null);
  const splitSub = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      splitHeadline.current = new SplitType('.hero-headline', { types: 'chars' });
      splitSub.current = new SplitType('.hero-sub', { types: 'words' });
      gsap.set(splitHeadline.current.chars, { y: 80, opacity: 0, rotateX: -80 });
      gsap.set(splitSub.current.words, { y: 30, opacity: 0 });
      gsap.set(['.hero-label', '.hero-role', '.hero-cta', '.hero-scroll', '.hero-badge'], { opacity: 0, y: 20 });
      gsap.set('.hero-line', { scaleX: 0, opacity: 0 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!active) return;

    // Reset all elements to hidden before re-animating
    gsap.killTweensOf(['.hero-label', '.hero-role', '.hero-cta', '.hero-scroll', '.hero-line', '.hero-badge']);
    gsap.set(splitHeadline.current.chars, { y: 80, opacity: 0, rotateX: -80 });
    gsap.set(splitSub.current.words, { y: 30, opacity: 0 });
    gsap.set(['.hero-label', '.hero-role', '.hero-cta', '.hero-scroll', '.hero-badge'], { opacity: 0, y: 20 });
    gsap.set('.hero-line', { scaleX: 0, opacity: 0 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.to('.hero-label', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
        .to(splitHeadline.current.chars, {
          y: 0, opacity: 1, rotateX: 0,
          stagger: 0.03, duration: 0.7, ease: 'power3.out',
        }, '-=0.2')
        .to('.hero-line', { scaleX: 1, opacity: 1, duration: 0.7, ease: 'power3.inOut', transformOrigin: 'left' }, '-=0.3')
        .to('.hero-role', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
        .to(splitSub.current.words, { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power2.out' }, '-=0.3')
        .to('.hero-cta', { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
        .to('.hero-scroll', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
        .to('.hero-badge', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');

      gsap.to('.hero-badge', {
        y: '-=12', duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.8,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [active]);

  return (
    <div
      className="hero-section"
      ref={containerRef}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center',
        padding: '0 60px',
        pointerEvents: active ? 'all' : 'none',
      }}
    >
      <div className="hero-content" style={{ maxWidth: 640, position: 'relative', zIndex: 1 }}>
        <span className="section-label hero-label">Portfolio 2026</span>

        <h1 className="display-xl hero-headline" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>
          DHAIRYA<br />
          <span className="text-red">PANDYA</span>
        </h1>

        <div className="hero-line" style={{
          height: 2,
          background: 'linear-gradient(90deg, var(--red), transparent)',
          margin: '20px 0',
          width: '100%',
          maxWidth: 440,
        }} />

        <div className="hero-role" style={{
          fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--white-dim)', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span>React.js Developer</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
          <span>App Development</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
          <span>WordPress &amp; Shopify</span>
        </div>

        <p className="body-lg hero-sub" style={{ marginBottom: 36 }}>
          Building websites, web apps, and Android apps with React.js, WordPress, Shopify, and Directus — plus AI-assisted workflows for faster delivery.
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }} className="hero-cta">
          <button className="btn" onClick={onNext}>
            <span>View Work</span>
            <span>→</span>
          </button>
          <a className="btn" href="mailto:pandyadhairya82@gmail.com" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
            <span>Get in Touch</span>
          </a>
        </div>
      </div>

      <div className="hero-badge" style={{
        position: 'absolute', right: 80, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        opacity: 0,
      }}>
        <div style={{
          width: 110, height: 110,
          border: '1px solid rgba(230,50,50,0.3)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: -8, border: '1px solid rgba(230,50,50,0.08)', borderRadius: '50%' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--red)', lineHeight: 1 }}>2+</div>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white-dim)', marginTop: 4 }}>Years Exp</div>
          </div>
        </div>

        <div style={{
          padding: '10px 18px', border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.03)', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--white)' }}>8.24</div>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white-dim)', marginTop: 2 }}>CGPA B.E.</div>
        </div>
      </div>

      <div className="hero-scroll" style={{
        position: 'absolute', bottom: 36, left: 60,
        display: 'flex', alignItems: 'center', gap: 12, opacity: 0,
      }}>
        <div className="scroll-wheel" />
        <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--white-dim)' }}>
          Scroll to explore
        </span>
      </div>

      <div className="hero-grid-overlay" style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '40%',
        backgroundImage: 'linear-gradient(rgba(230,50,50,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(230,50,50,0.025) 1px, transparent 1px)',
        backgroundSize: '60px 60px', pointerEvents: 'none',
      }} />
    </div>
  );
}
