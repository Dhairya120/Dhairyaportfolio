import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

export default function Contact({ active }) {
  const ref = useRef(null);
  const splitTitle = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      splitTitle.current = new SplitType('.contact-title', { types: 'chars' });
      gsap.set(splitTitle.current.chars, { y: 50, opacity: 0 });
      gsap.set(['.contact-label', '.contact-info-item', '.contact-social', '.contact-form-field', '.contact-submit'], {
        opacity: 0, y: 24,
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!active) return;

    gsap.set(splitTitle.current.chars, { y: 50, opacity: 0 });
    gsap.set(['.contact-label', '.contact-info-item', '.contact-social', '.contact-form-field', '.contact-submit'], {
      opacity: 0, y: 24,
    });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.to('.contact-label', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
        .to(splitTitle.current.chars, {
          y: 0, opacity: 1, stagger: 0.03, duration: 0.6, ease: 'power3.out',
        }, '-=0.3')
        .to('.contact-info-item', { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' }, '-=0.3')
        .to('.contact-social', { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, ease: 'power2.out' }, '-=0.2')
        .to('.contact-form-field', { opacity: 1, y: 0, stagger: 0.07, duration: 0.5, ease: 'power2.out' }, '-=0.4')
        .to('.contact-submit', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.1');

      gsap.to('.contact-glow', {
        opacity: 0.25, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1,
      });
    }, ref);

    return () => ctx.revert();
  }, [active]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailtoUrl = `mailto:pandyadhairya82@gmail.com?subject=Portfolio Inquiry from ${encodeURIComponent(form.name)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.location.href = mailtoUrl;
  };

  const contacts = [
    { icon: '✉', label: 'Email', value: 'pandyadhairya82@gmail.com', href: 'mailto:pandyadhairya82@gmail.com' },
    { icon: '✆', label: 'Phone', value: '+91 9408960797', href: 'tel:+919408960797' },
    { icon: '⌖', label: 'Location', value: 'Vadodara, Gujarat, India', href: null },
  ];

  return (
    <div className="contact-section" ref={ref} style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center',
      padding: '80px 60px', gap: 72,
      pointerEvents: active ? 'all' : 'none',
    }}>
      <div className="contact-info-column" style={{ flex: 1 }}>
        <span className="section-label contact-label" style={{ opacity: 0 }}>Let's Talk</span>
        <h2 className="display-md contact-title" style={{ marginBottom: 20 }}>
          Get In<br /><span className="text-red">Touch</span>
        </h2>

        <p className="body-lg contact-info-item" style={{ marginBottom: 32, opacity: 0 }}>
          Looking for a React.js, WordPress, or Shopify build — or freelance SEO support? Let's talk.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {contacts.map((c, i) => (
            <div key={i} className="contact-info-item" style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: 0,
            }}>
              <div style={{
                width: 40, height: 40, border: '1px solid rgba(230,50,50,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--red)', fontSize: 16, flexShrink: 0,
              }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white-dim)', marginBottom: 2 }}>{c.label}</div>
                {c.href ? (
                  <a href={c.href} style={{ fontSize: 13, color: 'var(--white)', textDecoration: 'none', transition: 'color 0.3s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--red)'}
                    onMouseLeave={e => e.target.style.color = 'var(--white)'}
                  >{c.value}</a>
                ) : (
                  <span style={{ fontSize: 13, color: 'var(--white)' }}>{c.value}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="contact-socials" style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {['LinkedIn', 'GitHub'].map((s, i) => (
            <a key={i} className="btn contact-social" href="#" style={{ padding: '10px 18px', opacity: 0 }}>
              <span style={{ fontSize: 11 }}>{s}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="contact-form-column" style={{ flex: 1, position: 'relative' }}>
        <div className="contact-glow" style={{
          position: 'absolute', top: '20%', left: '20%',
          width: 280, height: 280, background: 'var(--red)',
          filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%',
          pointerEvents: 'none', zIndex: -1,
        }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { name: 'name', label: 'Your Name', type: 'text', placeholder: 'Dhairya Pandya' },
            { name: 'email', label: 'Email Address', type: 'email', placeholder: 'hello@example.com' },
          ].map((field) => (
            <div key={field.name} className="contact-form-field" style={{ opacity: 0 }}>
              <label style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white-dim)', display: 'block', marginBottom: 6 }}>
                {field.label}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                required
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '12px 14px', color: 'var(--white)',
                  fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--red)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          ))}

          <div className="contact-form-field" style={{ opacity: 0 }}>
            <label style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white-dim)', display: 'block', marginBottom: 6 }}>
              Message
            </label>
            <textarea
              placeholder="Tell me about your project..."
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              required
              rows={5}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '12px 14px', color: 'var(--white)',
                fontSize: 13, fontFamily: 'var(--font-body)',
                outline: 'none', resize: 'vertical',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--red)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <button type="submit" className="btn contact-submit" style={{ alignSelf: 'flex-start', marginTop: 4, opacity: 0 }}>
            <span>Send Message</span>
            <span>→</span>
          </button>
        </form>
      </div>
    </div>
  );
}
