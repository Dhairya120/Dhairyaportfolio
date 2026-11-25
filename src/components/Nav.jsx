import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const sections = ['Home', 'About', 'Skills', 'Stack', 'Experience', 'Work', 'Contact'];

export default function Nav({ current, isScrolled, onNavigate }) {
  const navRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 1.5 }
    );
  }, []);

  return (
    <nav className={`nav ${isScrolled ? 'nav-scrolled' : ''}`} ref={navRef}>
      <div className="nav-logo" onClick={() => onNavigate(0)}>
        DP<span>.</span>
      </div>
      <ul className="nav-links">
        {sections.map((s, i) => (
          <li key={s}>
            <button
              className={current === i ? 'active' : ''}
              onClick={() => onNavigate(i)}
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
