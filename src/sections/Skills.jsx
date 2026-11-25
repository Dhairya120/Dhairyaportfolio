import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

const skillGroups = [
  {
    category: 'Frontend',
    icon: '⬡',
    skills: ['React.js', 'Next.js', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'Mobile-First'],
    level: 90,
  },
  {
    category: 'App Development',
    icon: '▣',
    skills: ['Android Apps', 'Play Store', 'Application UI', 'CRM Systems'],
    level: 78,
  },
  {
    category: 'Backend & Data',
    icon: '◈',
    skills: ['REST APIs', 'Directus', 'PostgreSQL', 'Git'],
    level: 70,
  },
  {
    category: 'CMS & E-commerce',
    icon: '◇',
    skills: ['WordPress', 'Elementor', 'Shopify', 'WooCommerce'],
    level: 85,
  },
  {
    category: 'AI & SEO',
    icon: '◉',
    skills: ['Cursor', 'Claude AI', 'On-Page SEO', 'Off-Page SEO', 'Technical SEO'],
    level: 80,
  },
  {
    category: 'IT Support',
    icon: '⚙',
    skills: [
      'Hardware & Software',
      'Windows OS Setup',
      'Networking (LAN/TCP/IP/DNS)',
      'Hosting & cPanel',
      'Remote Support',
      'Issue Resolution',
    ],
    level: 82,
  },
];

export default function Skills({ active }) {
  const ref = useRef(null);
  const splitTitle = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      splitTitle.current = new SplitType('.skills-title', { types: 'chars' });
      gsap.set(splitTitle.current.chars, { y: 50, opacity: 0 });
      gsap.set(['.skills-label', '.skills-card'], { opacity: 0, y: 28 });
      gsap.set('.skills-bar-fill', { scaleX: 0, opacity: 0 });
    }, ref);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!active) return;

    gsap.set(splitTitle.current.chars, { y: 50, opacity: 0 });
    gsap.set(['.skills-label', '.skills-card'], { opacity: 0, y: 28 });
    gsap.set('.skills-bar-fill', { scaleX: 0, opacity: 0 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.to('.skills-label', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
        .to(splitTitle.current.chars, {
          y: 0, opacity: 1, stagger: 0.03, duration: 0.6, ease: 'power3.out',
        }, '-=0.3')
        .to('.skills-card', { opacity: 1, y: 0, stagger: 0.08, duration: 0.55, ease: 'power2.out' }, '-=0.2')
        .to('.skills-bar-fill', {
          scaleX: 1, opacity: 1, stagger: 0.1, duration: 0.7,
          ease: 'power2.inOut', transformOrigin: 'left',
        }, '-=0.3');
    }, ref);

    return () => ctx.revert();
  }, [active]);

  return (
    <div className="skills-section" ref={ref} style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center',
      padding: '80px 60px 40px',
      overflowY: 'auto',
      pointerEvents: active ? 'all' : 'none',
    }}>
      <div className="skills-header" style={{ marginBottom: 32 }}>
        <span className="section-label skills-label" style={{ opacity: 0 }}>What I Know</span>
        <h2 className="display-md skills-title">Skills &amp; <span className="text-red">Expertise</span></h2>
      </div>

      <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
        {skillGroups.map((group, i) => (
          <div key={i} className="card skills-card" style={{ padding: '22px 18px', opacity: 0 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 18, color: 'var(--red)', marginBottom: 6 }}>{group.icon}</div>
              <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white-dim)', marginBottom: 10 }}>
                {group.category}
              </div>
              <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden', marginBottom: 3 }}>
                <div className="skills-bar-fill" style={{
                  height: '100%', width: `${group.level}%`,
                  background: 'linear-gradient(90deg, var(--red), #ff6b6b)',
                  boxShadow: '0 0 8px var(--red-glow)',
                  opacity: 0,
                }} />
              </div>
              <div style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--red)', textAlign: 'right' }}>{group.level}%</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {group.skills.map((skill, j) => (
                <span key={j} className="skill-tag" style={{ fontSize: 10, padding: '3px 8px' }}>{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
