import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase]       = useState('loading');
  const loaderRef   = useRef();
  const progressRef = useRef(0);
  const timeoutsRef = useRef([]);

  const queueTimeout = (callback, delay) => {
    const id = window.setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // ── Fake progress ──────────────────────────────────────────────────────────
  useEffect(() => {
    const ticks = [
      { to: 28,  speed: 50  },
      { to: 62,  speed: 85  },
      { to: 87,  speed: 120 },
      { to: 100, speed: 55  },
    ];
    let ti = 0;
    const step = () => {
      if (ti >= ticks.length) return;
      const { to, speed } = ticks[ti];
      if (progressRef.current >= to) { ti++; step(); return; }
      progressRef.current = Math.min(progressRef.current + (Math.random() * 3 + 1), to);
      setProgress(Math.floor(progressRef.current));
      if (progressRef.current < 100) queueTimeout(step, speed);
      else queueTimeout(() => setPhase('welcome'), 380);
    };
    queueTimeout(step, 300);

    return () => {
      timeoutsRef.current.forEach(window.clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  // ── Welcome animation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'welcome') return;

    const tl = gsap.timeline();

    // Fade out loading phase
    tl.to('.ldr-loading-wrap', { opacity: 0, scale: 0.95, duration: 0.45, ease: 'power2.in' })

    // Reveal welcome
      .set('.ldr-welcome', { display: 'flex' })

    // Glow expands from center
      .fromTo('.ldr-glow',
        { opacity: 0, scale: 0.3 },
        { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, '-=0.05'
      )

    // Character materialises from center — scale up, not slide up
      .fromTo('.ldr-char',
        { opacity: 0, scale: 0.75, y: 30 },
        { opacity: 1, scale: 1,    y: 0, duration: 1.0, ease: 'power3.out' }, '-=1.1'
      )

    // Decorative lines shoot outward
      .fromTo('.ldr-line-left',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.7, ease: 'power3.out', transformOrigin: 'right' }, '-=0.4'
      )
      .fromTo('.ldr-line-right',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.7, ease: 'power3.out', transformOrigin: 'left' }, '<'
      )

    // Tag
      .fromTo('.ldr-tag',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.3'
      )

    // "Hi, I'm" clips in from left
      .fromTo('.ldr-hi',
        { opacity: 0, x: -30, skewX: 4 },
        { opacity: 1, x: 0,   skewX: 0, duration: 0.6, ease: 'power3.out' }, '-=0.2'
      )

    // "DHAIRYA" scales up with glow
      .fromTo('.ldr-name',
        { opacity: 0, scale: 0.82, y: 15 },
        { opacity: 1, scale: 1,    y: 0,  duration: 0.7, ease: 'back.out(1.4)' }, '-=0.25'
      )

    // Roles / tagline / stats — stagger each .ldr-role element
      .fromTo('.ldr-role',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.5, ease: 'power2.out' }, '-=0.2'
      );

    // Character is static — no wave

    // Auto exit at 3.8 s
    const exitTimer = queueTimeout(() => {
      const ex = gsap.timeline({ onComplete: () => onComplete?.() });
      ex.to('.ldr-char',       { scale: 0.85, opacity: 0, duration: 0.55, ease: 'power2.in' }, 0)
        .to('.ldr-text-wrap',  { opacity: 0, x: 40,       duration: 0.4 }, 0.05)
        .to('.ldr-glow',       { opacity: 0, scale: 2.5,  duration: 0.7 }, 0)
        .to('.ldr-deco',       { opacity: 0,               duration: 0.3 }, 0)
        .to(loaderRef.current, { opacity: 0,               duration: 0.6, ease: 'power2.inOut' }, 0.4)
        .to(loaderRef.current, { yPercent: -100,            duration: 0.7, ease: 'power3.inOut' }, 0.62);
    }, 3800);

    return () => {
      window.clearTimeout(exitTimer);
      gsap.killTweensOf([
        '.ldr-loading-wrap',
        '.ldr-welcome',
        '.ldr-glow',
        '.ldr-char',
        '.ldr-line-left',
        '.ldr-line-right',
        '.ldr-tag',
        '.ldr-hi',
        '.ldr-name',
        '.ldr-role',
        '.ldr-text-wrap',
        '.ldr-deco',
        loaderRef.current,
      ]);
    };
  }, [phase, onComplete]);

  return (
    <div ref={loaderRef} className="ldr-root" style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#040404',
      overflow: 'hidden',
    }}>

      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(rgba(230,50,50,0.035) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(230,50,50,0.035) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Noise */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.45,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
        backgroundSize: '200px',
      }} />

      {/* Pattern accents */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.22,
        backgroundImage:
          'radial-gradient(circle at 25% 30%, rgba(230,50,50,0.08) 0, transparent 18%),' +
          'radial-gradient(circle at 75% 68%, rgba(230,50,50,0.06) 0, transparent 20%),' +
          'linear-gradient(115deg, transparent 0%, transparent 46%, rgba(230,50,50,0.05) 49%, transparent 52%, transparent 100%),' +
          'linear-gradient(65deg, transparent 0%, transparent 47%, rgba(255,255,255,0.025) 50%, transparent 53%, transparent 100%)',
      }} />

      <div style={{
        position: 'absolute',
        inset: '8% 6%',
        pointerEvents: 'none',
        opacity: 0.16,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'320\' height=\'320\' viewBox=\'0 0 320 320\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'rgba(230,50,50,0.22)\' stroke-width=\'1\'%3E%3Cpath d=\'M22 66h68l26 26h46\'/%3E%3Cpath d=\'M298 92h-82l-24 24h-38\'/%3E%3Cpath d=\'M36 254h58l18-18h74\'/%3E%3Cpath d=\'M286 232h-64l-20-20h-54\'/%3E%3Ccircle cx=\'22\' cy=\'66\' r=\'3\' fill=\'rgba(230,50,50,0.34)\' stroke=\'none\'/%3E%3Ccircle cx=\'298\' cy=\'92\' r=\'3\' fill=\'rgba(230,50,50,0.3)\' stroke=\'none\'/%3E%3Ccircle cx=\'36\' cy=\'254\' r=\'3\' fill=\'rgba(230,50,50,0.28)\' stroke=\'none\'/%3E%3Ccircle cx=\'286\' cy=\'232\' r=\'3\' fill=\'rgba(230,50,50,0.28)\' stroke=\'none\'/%3E%3C/g%3E%3C/svg%3E")',
        backgroundSize: '320px 320px',
        backgroundRepeat: 'repeat',
        mixBlendMode: 'screen',
      }} />

      {/* ══ LOADING ════════════════════════════════════════════════════════════ */}
      <div className="ldr-loading-wrap" style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 30,
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 11, letterSpacing: '0.45em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)',
        }}>Dhairya Pandya</div>

        <div className="ldr-progress-shell" style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(230,50,50,0.28)',
          borderRadius: 60, padding: '16px 32px',
          display: 'flex', alignItems: 'center', gap: 20,
          boxShadow: '0 0 60px rgba(230,50,50,0.08)',
          width: 'min(92vw, 420px)',
          minWidth: 0,
        }}>
          <span className="ldr-progress-label" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 9, letterSpacing: '0.35em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
          }}>Loading</span>
          <div style={{
            flex: 1, height: 2, borderRadius: 2,
            background: 'rgba(255,255,255,0.05)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, #a01818, #e63232, #ff6b6b)',
              transition: 'width 0.1s linear',
              boxShadow: '0 0 14px rgba(230,50,50,0.9)',
            }} />
          </div>
          <span className="ldr-progress-value" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16, fontWeight: 800,
            color: '#e63232', minWidth: 42, textAlign: 'right',
          }}>{progress}%</span>
        </div>

        <div style={{ display: 'flex', gap: 7 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 4, height: 4, borderRadius: '50%',
              background: i === 0 ? '#e63232' : 'rgba(255,255,255,0.1)',
              animation: `ldrPulse 1.4s ease-in-out ${i * 0.24}s infinite`,
            }} />
          ))}
        </div>
      </div>

      {/* ══ WELCOME ════════════════════════════════════════════════════════════ */}
      <div className="ldr-welcome" style={{
        display: 'none',
        position: 'absolute', inset: 0,
        alignItems: 'center',
        justifyContent: 'center',
      }}>

        {/* Central red glow — behind everything */}
        <div className="ldr-glow" style={{
          position: 'absolute',
          width: 700, height: 700,
          background: 'radial-gradient(ellipse, rgba(180,20,20,0.28) 0%, rgba(120,10,10,0.12) 40%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          opacity: 0,
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
        }} />

        {/* Inner layout */}
        <div className="ldr-stage" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          width: '100%',
          maxWidth: 1080,
          padding: '0 60px',
          position: 'relative',
        }}>

          {/* ── Character ── */}
          <img
            className="ldr-char"
            src="/character.png"
            alt="Dhairya"
            fetchPriority="high"
            decoding="async"
            style={{
              height: 540,
              objectFit: 'contain',
              filter:
                'drop-shadow(0 0 60px rgba(230,50,50,0.55))' +
                'drop-shadow(0 30px 50px rgba(0,0,0,0.9))',
              flexShrink: 0,
              display: 'block',
              position: 'relative', zIndex: 2,
            }}
          />

          {/* ── Right panel ── */}
          <div className="ldr-text-wrap" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 0,
            paddingLeft: 50,
            maxWidth: 560,
            position: 'relative', zIndex: 2,
          }}>

            {/* Decorative top line */}
            <div className="ldr-deco" style={{
              display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18,
            }}>
              <div className="ldr-line-left" style={{
                width: 36, height: 1,
                background: 'linear-gradient(to left, #e63232, transparent)',
              }} />
              <div className="ldr-tag" style={{
                fontSize: 9, letterSpacing: '0.38em',
                textTransform: 'uppercase', color: 'rgba(230,50,50,0.7)',
                opacity: 0,
              }}>
                Welcome to my portfolio
              </div>
              <div className="ldr-line-right" style={{
                width: 36, height: 1,
                background: 'linear-gradient(to right, #e63232, transparent)',
              }} />
            </div>

            {/* Hi I'm */}
            <div className="ldr-hi" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 58, fontWeight: 800, lineHeight: 1,
              color: 'rgba(255,255,255,0.92)',
              marginBottom: 6,
              opacity: 0,
            }}>
              Hi, I'm
            </div>

            {/* DHAIRYA */}
            <div className="ldr-name" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 96, fontWeight: 900, lineHeight: 0.9,
              color: '#e63232',
              letterSpacing: '-0.02em',
              marginBottom: 16,
              opacity: 0,
            }}>
              Dhairya
            </div>

            {/* Tagline */}
            <div className="ldr-role ldr-tagline" style={{
              fontSize: 13, color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.04em', marginBottom: 20,
              opacity: 0,
            }}>
              React.js, WordPress, Shopify &amp; AI-assisted development.
            </div>

            {/* Bottom rule */}
            <div className="ldr-rule" style={{
              width: '100%', height: 1, marginBottom: 20,
              background: 'linear-gradient(to right, rgba(230,50,50,0.5), transparent)',
            }} />

            {/* Roles */}
            <div className="ldr-role ldr-role-list" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              marginBottom: 28,
              opacity: 0,
            }}>
              {['React.js Developer', 'App Development', 'WordPress & Shopify'].map((r, i, arr) => (
                <span key={r} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="ldr-role-label" style={{
                    fontSize: 11, letterSpacing: '0.12em',
                    color: 'rgba(255,255,255,0.32)',
                  }}>{r}</span>
                  {i < arr.length - 1 && (
                    <span style={{
                      width: 3, height: 3, borderRadius: '50%',
                      background: 'rgba(230,50,50,0.5)',
                      display: 'inline-block',
                    }} />
                  )}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="ldr-role ldr-stats" style={{
              display: 'flex', gap: 24, opacity: 0,
            }}>
              {[
                { value: '2+', label: 'Years Exp.' },
                { value: '15', label: 'Live Projects' },
                { value: '8.24', label: 'B.E. CGPA' },
              ].map((s) => (
                <div key={s.label} className="ldr-stat" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="ldr-stat-value" style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22, fontWeight: 800, color: '#e63232',
                  }}>{s.value}</span>
                  <span className="ldr-stat-label" style={{
                    fontSize: 9, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
                  }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom edge accent */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent 5%, rgba(230,50,50,0.3) 30%, rgba(230,50,50,0.3) 70%, transparent 95%)',
        }} />

        {/* Corner accents */}
        {[
          { top: 24, left: 24 }, { top: 24, right: 24 },
          { bottom: 24, left: 24 }, { bottom: 24, right: 24 },
        ].map((pos, i) => (
          <div key={i} className="ldr-deco" style={{
            position: 'absolute', ...pos,
            width: 20, height: 20,
            borderTop: i < 2 ? '1px solid rgba(230,50,50,0.35)' : 'none',
            borderBottom: i >= 2 ? '1px solid rgba(230,50,50,0.35)' : 'none',
            borderLeft: i % 2 === 0 ? '1px solid rgba(230,50,50,0.35)' : 'none',
            borderRight: i % 2 === 1 ? '1px solid rgba(230,50,50,0.35)' : 'none',
          }} />
        ))}
      </div>

      <style>{`
        @keyframes ldrPulse {
          0%,100% { opacity:.2; transform:scale(1);   }
          50%      { opacity:1;  transform:scale(1.7); }
        }

        @media (max-width: 900px) {
          .ldr-stage {
            padding: 0 32px !important;
          }

          .ldr-char {
            height: 420px !important;
          }

          .ldr-text-wrap {
            padding-left: 24px !important;
            max-width: 440px !important;
          }

          .ldr-hi {
            font-size: 48px !important;
          }

          .ldr-name {
            font-size: 76px !important;
          }
        }

        @media (max-width: 640px) {
          .ldr-loading-wrap {
            gap: 22px !important;
            padding: 0 16px !important;
          }

          .ldr-progress-shell {
            padding: 14px 18px !important;
            gap: 14px !important;
          }

          .ldr-progress-label {
            font-size: 8px !important;
            letter-spacing: 0.28em !important;
          }

          .ldr-progress-value {
            font-size: 14px !important;
            min-width: 34px !important;
          }

          .ldr-stage {
            flex-direction: column !important;
            align-items: flex-start !important;
            justify-content: center !important;
            gap: 18px !important;
            height: 100% !important;
            max-width: none !important;
            padding: 88px 20px 54px !important;
          }

          .ldr-glow {
            width: min(120vw, 520px) !important;
            height: min(120vw, 520px) !important;
            top: 58% !important;
          }

          .ldr-char {
            order: 2;
            align-self: center;
            height: min(38vh, 300px) !important;
            max-width: 82vw !important;
          }

          .ldr-text-wrap {
            order: 1;
            width: 100% !important;
            max-width: none !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          .ldr-deco {
            gap: 10px !important;
            margin-bottom: 14px !important;
          }

          .ldr-line-left,
          .ldr-line-right {
            width: 24px !important;
          }

          .ldr-tag {
            font-size: 8px !important;
            letter-spacing: 0.24em !important;
          }

          .ldr-hi {
            width: 100% !important;
            max-width: 100% !important;
            font-size: clamp(30px, 10.5vw, 42px) !important;
            margin-bottom: 4px !important;
            line-height: 0.96 !important;
          }

          .ldr-name {
            width: 100% !important;
            max-width: 100% !important;
            font-size: clamp(42px, 14vw, 60px) !important;
            line-height: 0.92 !important;
            margin-bottom: 12px !important;
            white-space: normal !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .ldr-tagline {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 12px !important;
            line-height: 1.5 !important;
            margin-bottom: 16px !important;
          }

          .ldr-rule {
            margin-bottom: 16px !important;
          }

          .ldr-role-list {
            width: 100% !important;
            flex-wrap: wrap !important;
            gap: 8px 10px !important;
            margin-bottom: 18px !important;
          }

          .ldr-role-list > span {
            gap: 8px !important;
          }

          .ldr-role-label {
            font-size: 10px !important;
            letter-spacing: 0.1em !important;
          }

          .ldr-stats {
            width: 100% !important;
            gap: 10px !important;
            justify-content: space-between !important;
            flex-wrap: wrap !important;
          }

          .ldr-stat {
            min-width: 0;
            flex: 1 1 0;
          }

          .ldr-stat-value {
            font-size: 18px !important;
          }

          .ldr-stat-label {
            font-size: 8px !important;
            letter-spacing: 0.1em !important;
          }
        }

        @media (max-width: 380px) {
          .ldr-stage {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          .ldr-char {
            height: min(34vh, 250px) !important;
          }

          .ldr-name {
            font-size: clamp(36px, 13vw, 50px) !important;
          }
        }
      `}</style>
    </div>
  );
}
