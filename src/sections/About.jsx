import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

export default function About({ active }) {
  const ref = useRef(null);
  const splitTitle = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      splitTitle.current = new SplitType('.about-title', { types: 'chars' });
      gsap.set(splitTitle.current.chars, { y: 60, opacity: 0 });
      gsap.set(['.about-label', '.about-text', '.about-stat', '.about-img-wrap', '.about-tag'], { opacity: 0, y: 24 });
      gsap.set('.about-divider', { opacity: 0, scaleX: 0 });
    }, ref);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!active) return;

    gsap.set(splitTitle.current.chars, { y: 60, opacity: 0 });
    gsap.set(['.about-label', '.about-text', '.about-stat', '.about-img-wrap', '.about-tag'], { opacity: 0, y: 24 });
    gsap.set('.about-divider', { opacity: 0, scaleX: 0 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.to('.about-img-wrap', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
        .to('.about-label', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.4')
        .to(splitTitle.current.chars, {
          y: 0, opacity: 1, stagger: 0.03, duration: 0.6, ease: 'power3.out',
        }, '-=0.3')
        .to('.about-divider', { opacity: 1, scaleX: 1, duration: 0.6, ease: 'power3.inOut', transformOrigin: 'left' }, '-=0.2')
        .to('.about-text', { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }, '-=0.3')
        .to('.about-stat', { opacity: 1, y: 0, stagger: 0.07, duration: 0.5, ease: 'power2.out' }, '-=0.2')
        .to('.about-tag', { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, ease: 'power2.out' }, '-=0.2');

      gsap.to('.about-float', {
        y: -10, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.8,
      });
    }, ref);

    return () => ctx.revert();
  }, [active]);

  const stats = [
    { num: '2+', label: 'Years Exp' },
    { num: '15', label: 'Live Projects' },
    { num: '8.24', label: 'B.E. CGPA' },
    { num: '8.54', label: 'Diploma CGPA' },
  ];

  return (
    <div className="about-section" ref={ref} style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center',
      padding: '0 60px', gap: 64,
      pointerEvents: active ? 'all' : 'none',
    }}>
      <div className="about-img-wrap about-float" style={{ flexShrink: 0, position: 'relative', opacity: 0 }}>
        <div className="about-visual-frame" style={{ width: 260, height: 340, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(230,50,50,0.3)' }} />
          <div style={{ position: 'absolute', top: -8, left: -8, right: 8, bottom: 8, border: '1px solid rgba(230,50,50,0.08)' }} />
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #150000 0%, #0a0a0a 50%, #100000 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                border: '2px solid var(--red)',
                background: 'rgba(230,50,50,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: '0 0 40px rgba(230,50,50,0.25)',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: 'var(--red)' }}>DP</span>
              </div>
              <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white-dim)' }}>
                Dhairya Pandya
              </div>
            </div>
          </div>
          <div style={{
            position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)',
            width: 160, height: 40, background: 'var(--red)', filter: 'blur(30px)', opacity: 0.15, borderRadius: '50%',
          }} />
        </div>
        <div className="about-availability-badge" style={{
          position: 'absolute', bottom: 24, right: -24,
          padding: '8px 14px', background: 'var(--black-card)',
          border: '1px solid rgba(230,50,50,0.3)', fontSize: 11, letterSpacing: '0.1em',
        }}>
          <span style={{ color: 'var(--red)' }}>●</span>
          <span style={{ color: 'var(--white-dim)', marginLeft: 8 }}>Available</span>
        </div>
      </div>

      <div className="about-content" style={{ flex: 1 }}>
        <span className="section-label about-label" style={{ opacity: 0 }}>Who I Am</span>
        <h2 className="display-md about-title" style={{ marginBottom: 0 }}>
          About<br /><span className="text-red">Me</span>
        </h2>

        <div className="about-divider" style={{
          height: 2, background: 'linear-gradient(90deg, var(--red), transparent)',
          margin: '18px 0', width: 60, opacity: 0,
        }} />

        <p className="body-lg about-text" style={{ marginBottom: 12, opacity: 0 }}>
          Web and Application Developer with 2+ years of experience building responsive
          websites, web apps, Android apps, and interactive UIs with React.js, JavaScript,
          WordPress, and Shopify. Currently at <strong style={{ color: 'var(--white)' }}>Techno Mantra</strong>,
          integrating Directus as a headless CMS and connecting frontends through REST APIs.
        </p>
        <p className="body-lg about-text" style={{ marginBottom: 28, opacity: 0 }}>
          I use Cursor and Claude AI to speed up prototyping and debugging, then review
          and test all generated code before release. I also take on freelance website
          and SEO projects. B.E. Computer Engineering graduate (8.24 CGPA) from Neotech, GTU.
        </p>

        <div className="about-stats-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1, background: 'rgba(255,255,255,0.04)', marginBottom: 24,
        }}>
          {stats.map((s, i) => (
            <div key={i} className="about-stat" style={{
              padding: '18px 14px', background: 'var(--black-soft)', textAlign: 'center', opacity: 0,
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--red)', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 9, marginTop: 5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white-dim)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['Vadodara, India', 'React.js Developer', 'App Development'].map((tag, i) => (
            <span key={i} className="skill-tag about-tag" style={{ opacity: 0 }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
