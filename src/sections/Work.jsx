import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

const CATEGORY_STYLES = {
  'React.js': {
    color: '#e63232',
    bg: 'rgba(230,50,50,0.1)',
    border: 'rgba(230,50,50,0.35)',
  },
  App: {
    color: '#f0a020',
    bg: 'rgba(240,160,32,0.1)',
    border: 'rgba(240,160,32,0.35)',
  },
  Shopify: {
    color: '#7abf3e',
    bg: 'rgba(122,191,62,0.1)',
    border: 'rgba(122,191,62,0.35)',
  },
  WordPress: {
    color: '#4a9cc7',
    bg: 'rgba(33,117,155,0.12)',
    border: 'rgba(74,156,199,0.35)',
  },
};

const projects = [
  {
    title: 'Hitaishi CRM',
    url: 'https://play.google.com/store/apps/details?id=com.hitaishi.crm&pcampaignid=web_share',
    category: 'App',
    domain: 'play.google.com · Android',
    description: 'Android CRM app on Google Play — customer management and business workflows for on-the-go teams.',
    tags: ['App Development', 'Android', 'CRM'],
  },
  // Resume / newer work
  {
    title: 'TECH6SENSE AI',
    url: 'https://www.tech6senseai.com/',
    category: 'React.js',
    description: 'AI development company site covering AI solutions, deep-tech products and enterprise AI transformation.',
    tags: ['React.js', 'Corporate', 'AI'],
  },
  {
    title: 'Evolve Tech Systems',
    url: 'https://evolvetech.co.in/',
    category: 'React.js',
    description: 'Corporate site for an authorized SOLIDWORKS partner — 3D CAD, simulation and cloud collaboration.',
    tags: ['React.js', 'Corporate', 'Responsive'],
  },
  {
    title: 'VIZE Specialty Polymers',
    url: 'https://vizeresin.com/',
    category: 'React.js',
    description: 'Corporate website for a specialty polymers brand with a clean, product-focused presentation.',
    tags: ['React.js', 'Corporate', 'UI'],
  },
  {
    title: 'Soil+ Organics',
    url: 'https://www.soilplusorganics.com/',
    category: 'React.js',
    description: 'Organic farming brand site for bio-fertilizers, bio-stimulants, crop protection and soil conditioners.',
    tags: ['React.js', 'E-commerce', 'Responsive'],
  },
  {
    title: 'Keyan Corporation',
    url: 'https://keyancorporation.com/',
    category: 'React.js',
    description: 'B2B industrial procurement marketplace with catalogue, customer login, cart and quote-request chat.',
    tags: ['React.js', 'Marketplace', 'B2B'],
  },
  {
    title: 'Priti Trendz',
    url: 'https://prititrendz.com/',
    category: 'Shopify',
    description: 'Ethnic wear store for sarees, salwar kameez and lehenga choli — collections, wishlist, cart and accounts.',
    tags: ['Shopify', 'E-commerce', 'Fashion'],
  },
  {
    title: 'Suheli.in',
    url: 'https://suheli.in/',
    category: 'Shopify',
    description: 'Sustainable and second-life product store with gifting, reverse-collection and community pages.',
    tags: ['Shopify', 'E-commerce', 'Sustainability'],
  },
  {
    title: 'Zurobo',
    url: 'https://zurobo.in/',
    category: 'WordPress',
    description: 'Smart robot vacuum and window-cleaning product site with demo booking and WhatsApp ordering.',
    tags: ['WordPress', 'Elementor', 'Product'],
  },
  // Earlier Techno Mantra work (kept)
  {
    title: 'The Prop City',
    url: 'https://thepropcity.com/',
    category: 'React.js',
    description: 'Real estate platform with property listings, advanced filters, and Directus CMS integration.',
    tags: ['React.js', 'Directus', 'REST API'],
  },
  {
    title: 'Cathode Power',
    url: 'https://cathodepower.com/',
    category: 'React.js',
    description: 'Power solutions company site with animated hero, product showcase, and performance-optimized builds.',
    tags: ['React.js', 'GSAP', 'Responsive'],
  },
  {
    title: 'Gheeyonnaise',
    url: 'https://gheeyonnaise.com/',
    category: 'Shopify',
    description: 'Premium ghee-based condiment brand with custom Shopify storefront, product pages, and checkout UX.',
    tags: ['Shopify', 'Liquid', 'E-commerce'],
  },
  {
    title: 'GIR Culture',
    url: 'https://girculture.com/',
    category: 'Shopify',
    description: 'Cultural brand store with curated collections, storytelling sections, and mobile-first design.',
    tags: ['Shopify', 'Custom Theme', 'Branding'],
  },
  {
    title: 'Shiva Shrey Global',
    url: 'https://shivashreyglobal.com/',
    category: 'WordPress',
    description: 'International trade company site with dynamic product listings and lead generation integration.',
    tags: ['WordPress', 'Custom Plugin', 'Responsive'],
  },
  {
    title: 'Global Insights KPO',
    url: 'https://globalinsightskpo.com/',
    category: 'WordPress',
    description: 'KPO services firm with service showcase, blog, and conversion-focused landing pages.',
    tags: ['WordPress', 'Landing Page', 'SEO'],
  },
];

function formatDomain(project) {
  if (project.domain) return project.domain;
  return project.url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
}

export default function Work({ active }) {
  const ref = useRef(null);
  const splitTitle = useRef(null);
  const entranceDone = useRef(false);
  const [filter, setFilter] = useState('All');

  const filters = useMemo(() => {
    const counts = projects.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    return [
      { label: 'All', count: projects.length },
      { label: 'React.js', count: counts['React.js'] || 0 },
      { label: 'App', count: counts.App || 0 },
      { label: 'Shopify', count: counts.Shopify || 0 },
      { label: 'WordPress', count: counts.WordPress || 0 },
    ];
  }, []);

  const visibleProjects = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );

  useLayoutEffect(() => {
    // SplitType created OUTSIDE gsap.context so ctx.revert() does not wipe the chars
    splitTitle.current = new SplitType(ref.current.querySelector('.work-title'), { types: 'chars' });

    const ctx = gsap.context(() => {
      gsap.set(splitTitle.current.chars, { y: 50, opacity: 0 });
      gsap.set(['.work-label', '.work-filter'], { opacity: 0, y: 24 });
    }, ref);

    return () => {
      ctx.revert();
      splitTitle.current?.revert();
    };
  }, []);

  useEffect(() => {
    if (!active) return;

    gsap.set(splitTitle.current.chars, { y: 50, opacity: 0 });
    gsap.set(['.work-label', '.work-filter'], { opacity: 0, y: 24 });
    gsap.set('.work-card', { opacity: 0, y: 24 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.to('.work-label', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
        .to(splitTitle.current.chars, {
          y: 0, opacity: 1, stagger: 0.025, duration: 0.6, ease: 'power3.out',
        }, '-=0.3')
        .to('.work-filter', { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, ease: 'power2.out' }, '-=0.2')
        .to('.work-card', { opacity: 1, y: 0, stagger: 0.07, duration: 0.55, ease: 'power2.out' }, '-=0.2');
    }, ref);

    return () => ctx.revert();
  }, [active]);

  useEffect(() => {
    if (!active) {
      entranceDone.current = false;
      return;
    }
    // First reveal is handled by the entrance timeline above
    if (!entranceDone.current) {
      entranceDone.current = true;
      return;
    }

    const cards = ref.current?.querySelectorAll('.work-card');
    if (!cards?.length) return;

    gsap.killTweensOf(cards);
    gsap.fromTo(
      cards,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out' },
    );
  }, [filter, active]);

  return (
    <div
      className="work-section"
      ref={ref}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        padding: '88px 60px 40px',
        overflowY: 'auto',
        pointerEvents: active ? 'all' : 'none',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <span className="section-label work-label" style={{ opacity: 0 }}>Selected Projects</span>
        <h2 className="display-md work-title" style={{ marginBottom: 16 }}>
          Selected <span className="text-red">Work</span>
        </h2>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filters.map(({ label, count }) => {
            const isActive = filter === label;
            return (
              <button
                key={label}
                type="button"
                className="work-filter"
                onClick={() => setFilter(label)}
                style={{
                  padding: '4px 14px',
                  border: `1px solid ${isActive ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`,
                  background: isActive ? 'rgba(230,50,50,0.08)' : 'transparent',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--red)' : 'var(--white-dim)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  opacity: 0,
                  transition: 'border-color 0.25s, color 0.25s, background 0.25s',
                }}
              >
                {label}
                <span style={{ opacity: 0.45, marginLeft: 5 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects grid */}
      <div
        className="work-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 12,
        }}
      >
        {visibleProjects.map((project) => {
          const style = CATEGORY_STYLES[project.category];
          return (
            <a
              key={project.title}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card work-card"
              style={{
                padding: '18px 18px 16px',
                opacity: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                textDecoration: 'none',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                  padding: '2px 8px',
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: style.color, fontWeight: 600,
                }}>
                  {project.category}
                </span>
                <span className="work-arrow" style={{
                  fontSize: 14, color: 'var(--white-dim)',
                  display: 'inline-block',
                  transition: 'color 0.3s, transform 0.3s',
                }}>↗</span>
              </div>

              <div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                  color: 'var(--white)', marginBottom: 5, lineHeight: 1.2,
                }}>
                  {project.title}
                </div>
                <p style={{ fontSize: 11, color: 'var(--white-dim)', lineHeight: 1.55, margin: 0 }}>
                  {project.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 'auto' }}>
                {project.tags.map((tag) => (
                  <span key={tag} className="skill-tag" style={{ fontSize: 9, padding: '2px 7px' }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{
                fontSize: 9, color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.05em',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                paddingTop: 8,
              }}>
                {formatDomain(project)}
              </div>

              <div className="work-card-line" style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${style.color}, transparent)`,
                opacity: 0, transition: 'opacity 0.3s',
              }} />
            </a>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 20, display: 'flex', alignItems: 'center', gap: 16,
        borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800,
          color: 'rgba(255,255,255,0.05)',
        }}>
          {String(projects.length).padStart(2, '0')}
        </span>
        <span style={{
          fontSize: 10, color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.15em', textTransform: 'uppercase',
        }}>
          Live projects — React.js, App, Shopify &amp; WordPress
        </span>
      </div>
    </div>
  );
}
