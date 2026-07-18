import { useEffect, useRef } from 'react';

const BLOBS = [
  {
    width: '75vw', height: '75vw', top: '-10%', left: '-10%',
    bg: 'radial-gradient(circle, rgba(37,99,235,0.50) 0%, rgba(29,78,216,0.22) 40%, transparent 70%)',
    animation: 'cin-drift-1 38s ease-in-out infinite',
    parallax: 35,
  },
  {
    width: '65vw', height: '65vw', bottom: '-10%', right: '-10%',
    bg: 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, rgba(79,70,229,0.18) 40%, transparent 70%)',
    animation: 'cin-drift-2 45s ease-in-out infinite',
    parallax: -25,
  },
  {
    width: '55vw', height: '55vw', top: '25%', left: '25%',
    bg: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(109,40,217,0.14) 40%, transparent 70%)',
    animation: 'cin-drift-3 30s ease-in-out infinite',
    parallax: 20,
  },
  {
    width: '50vw', height: '50vw', top: '-5%', right: '5%',
    bg: 'radial-gradient(circle, rgba(6,182,212,0.32) 0%, rgba(8,145,178,0.12) 40%, transparent 70%)',
    animation: 'cin-drift-4 52s ease-in-out infinite',
    parallax: -30,
  },
  {
    width: '45vw', height: '45vw', bottom: '5%', left: '10%',
    bg: 'radial-gradient(circle, rgba(59,130,246,0.42) 0%, rgba(37,99,235,0.16) 40%, transparent 70%)',
    animation: 'cin-drift-5 35s ease-in-out infinite',
    parallax: 40,
  },
];

export const Background3D = () => {
  const mouseRef = useRef({ x: 0, y: 0 });
  const lerpRef = useRef({ x: 0, y: 0 });
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5),
        y: (e.clientY / window.innerHeight - 0.5),
      };
    };
    window.addEventListener('mousemove', onMouseMove);

    const tick = () => {
      // Smooth lerp
      lerpRef.current.x += (mouseRef.current.x - lerpRef.current.x) * 0.04;
      lerpRef.current.y += (mouseRef.current.y - lerpRef.current.y) * 0.04;

      // Move each wrapper independently — no conflict with blob CSS animation
      wrapperRefs.current.forEach((el, i) => {
        if (!el) return;
        const strength = BLOBS[i].parallax;
        const tx = lerpRef.current.x * strength;
        const ty = lerpRef.current.y * strength;
        el.style.transform = `translate(${tx}px, ${ty}px)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#080808',
        overflow: 'hidden',
      }}
    >
      {BLOBS.map((blob, i) => (
        // Outer wrapper: JS parallax via transform (no CSS animation here)
        <div
          key={i}
          ref={el => { wrapperRefs.current[i] = el; }}
          style={{
            position: 'absolute',
            width: blob.width,
            height: blob.height,
            top: blob.top ?? 'auto',
            bottom: (blob as any).bottom ?? 'auto',
            left: blob.left ?? 'auto',
            right: (blob as any).right ?? 'auto',
            willChange: 'transform',
          }}
        >
          {/* Inner blob: CSS drift animation (no conflict with wrapper transform) */}
          <div
            className="cin-blob"
            style={{
              width: '100%',
              height: '100%',
              background: blob.bg,
              animation: blob.animation,
            }}
          />
        </div>
      ))}

      {/* Film grain */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.045,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        pointerEvents: 'none',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.70) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};
