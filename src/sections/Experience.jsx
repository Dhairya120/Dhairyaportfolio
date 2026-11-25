import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

const experiences = [
  {
    role: 'Web Developer', company: 'Techno Mantra', period: 'Sep 2024 – Dec 2026', type: 'Full-time',
    points: [
      'Build responsive websites and web apps with React.js, JavaScript, HTML and CSS',
      'Develop reusable UI components and connect frontends to backend services via REST APIs',
      'Integrate Directus as a headless CMS and connect CMS data to React.js frontends',
      'Use Cursor and Claude AI for faster prototyping and debugging, with full code review before release',
      'Customize WordPress, Elementor, Shopify and WooCommerce sites; support SEO and performance',
    ],
    stack: ['React.js', 'Directus', 'WordPress', 'Shopify', 'Cursor AI'],
  },
  {
    role: 'SEO Specialist', company: 'Pristine Stone Care', period: 'Project-based', type: 'Freelance',
    points: [
      'Conducted keyword research and supported on-page, off-page and technical SEO',
      'Optimized metadata and website content to improve search visibility',
    ],
    stack: ['SEO', 'Keyword Research', 'On-Page SEO'],
  },
  {
    role: 'Graphic Designer', company: 'Office Beacon', period: 'Sep 2023 – Nov 2023', type: 'Internship',
    points: [
      'Created logos, packaging and brand assets in Adobe Photoshop and Illustrator',
      'Delivered design work based on project briefs for client branding needs',
    ],
    stack: ['Photoshop', 'Illustrator', 'Branding'],
  },
];

const education = [
  { degree: 'B.E. Computer Engineering', institute: 'Neotech, GTU', year: 'March 2025', cgpa: '8.24' },
  { degree: 'Diploma – Computer Engineering', institute: 'Gujarat Technological University', year: 'March 2022', cgpa: '8.54' },
];

export default function Experience({ active }) {
  const ref = useRef(null);
  const splitTitle = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      splitTitle.current = new SplitType('.exp-title', { types: 'chars' });
      gsap.set(splitTitle.current.chars, { y: 50, opacity: 0 });
      gsap.set(['.exp-label', '.exp-card', '.edu-card', '.exp-side-item'], { opacity: 0, y: 24 });
    }, ref);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!active) return;

    gsap.set(splitTitle.current.chars, { y: 50, opacity: 0 });
    gsap.set(['.exp-label', '.exp-card', '.edu-card', '.exp-side-item'], { opacity: 0, y: 24 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.to('.exp-label', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
        .to(splitTitle.current.chars, {
          y: 0, opacity: 1, stagger: 0.025, duration: 0.6, ease: 'power3.out',
        }, '-=0.3')
        .to('.exp-card', { opacity: 1, y: 0, stagger: 0.1, duration: 0.55, ease: 'power2.out' }, '-=0.3')
        .to('.edu-card', { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' }, '-=0.3')
        .to('.exp-side-item', { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, ease: 'power2.out' }, '-=0.2');
    }, ref);

    return () => ctx.revert();
  }, [active]);

  return (
    <div className="experience-section" ref={ref} style={{
      position: 'absolute', inset: 0,
      display: 'flex', padding: '80px 60px 40px', gap: 40,
      overflowY: 'auto',
      pointerEvents: active ? 'all' : 'none',
    }}>
      <div className="experience-main" style={{ flex: 3 }}>
        <span className="section-label exp-label" style={{ opacity: 0 }}>Career Path</span>
        <h2 className="display-md exp-title" style={{ marginBottom: 24 }}>
          Experience <span className="text-red">&amp;</span><br />Education
        </h2>

        <div className="exp-card-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {experiences.map((exp, i) => (
            <div key={i} className="card exp-card" style={{ padding: '18px 22px', opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>
                    {exp.role}
                  </div>
                  <div style={{ color: 'var(--red)', fontSize: 12, fontWeight: 500 }}>{exp.company}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    padding: '2px 8px', border: '1px solid rgba(230,50,50,0.3)',
                    fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--red)',
                    display: 'inline-block', marginBottom: 3,
                  }}>{exp.type}</div>
                  <div style={{ fontSize: 10, color: 'var(--white-dim)' }}>{exp.period}</div>
                </div>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
                {exp.points.map((p, j) => (
                  <li key={j} style={{ fontSize: 12, color: 'var(--white-dim)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }}>—</span>{p}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {exp.stack.map((s, j) => (
                  <span key={j} className="skill-tag" style={{ fontSize: 9, padding: '2px 7px' }}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="experience-side" style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="experience-education-block" style={{ marginTop: 68 }}>
          <h3 className="exp-side-item" style={{
            fontSize: 11, fontWeight: 600, color: 'var(--white-dim)',
            letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, opacity: 0,
          }}>Education</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {education.map((edu, i) => (
              <div key={i} className="card edu-card" style={{ padding: '16px', opacity: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 3 }}>
                  {edu.degree}
                </div>
                <div style={{ color: 'var(--red)', fontSize: 11, marginBottom: 8 }}>{edu.institute}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--white-dim)' }}>
                  <span>{edu.year}</span>
                  <span>CGPA: <strong style={{ color: 'var(--red)' }}>{edu.cgpa}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="exp-side-item" style={{
            fontSize: 11, fontWeight: 600, color: 'var(--white-dim)',
            letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, opacity: 0,
          }}>Languages</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[{ lang: 'English', level: 4 }, { lang: 'Hindi', level: 5 }, { lang: 'Gujarati', level: 5 }].map((l, i) => (
              <div key={i} className="exp-side-item" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)', opacity: 0,
              }}>
                <span style={{ fontSize: 13, color: 'var(--white)' }}>{l.lang}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: j < l.level ? 'var(--red)' : 'rgba(255,255,255,0.08)',
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="exp-side-item" style={{
            fontSize: 11, fontWeight: 600, color: 'var(--white-dim)',
            letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, opacity: 0,
          }}>Soft Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['Communication', 'Problem Solving', 'Teamwork', 'Adaptability'].map((s, i) => (
              <span key={i} className="skill-tag exp-side-item" style={{ fontSize: 10, padding: '4px 10px', opacity: 0 }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
