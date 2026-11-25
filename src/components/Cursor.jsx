import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Match CSS: custom cursor is hidden on touch / small screens
    if (window.matchMedia('(max-width: 820px), (pointer: coarse)').matches) return;

    const interactiveSelector = 'button, a, .card, .skill-tag, .section-dot'
    const setDotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power2.out' });
    const setDotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power2.out' });

    const onMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      setDotX(e.clientX);
      setDotY(e.clientY);
    };

    const setHovered = (hovered) => {
      dot.classList.toggle('hovered', hovered);
      ring.classList.toggle('hovered', hovered);
    };

    const onPointerOver = (e) => {
      if (e.target.closest(interactiveSelector)) setHovered(true);
    };

    const onPointerOut = (e) => {
      if (e.target.closest(interactiveSelector)) setHovered(false);
    };

    const onPointerDown = () => {
      dot.classList.add('hovered');
      ring.classList.add('hovered');
    };

    const onPointerUp = () => {
      dot.classList.remove('hovered');
      ring.classList.remove('hovered');
    };

    // Smooth ring follow — stop RAF when converged to cut idle CPU; restart on move
    let rafId = null;
    const follow = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.1;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.1;
      gsap.set(ring, { x: ringPos.current.x, y: ringPos.current.y });
      const dx = mousePos.current.x - ringPos.current.x;
      const dy = mousePos.current.y - ringPos.current.y;
      if (dx * dx + dy * dy < 0.04) {
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(follow);
    };

    const onMoveWithFollow = (e) => {
      onMove(e);
      if (rafId == null) rafId = requestAnimationFrame(follow);
    };

    rafId = requestAnimationFrame(follow);

    window.addEventListener('mousemove', onMoveWithFollow);
    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerout', onPointerOut);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('mousemove', onMoveWithFollow);
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointerup', onPointerUp);
      if (rafId != null) cancelAnimationFrame(rafId);
      gsap.killTweensOf(dot);
      gsap.killTweensOf(ring);
    };
  }, []);

  return (
    <div className="cursor">
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </div>
  );
}
