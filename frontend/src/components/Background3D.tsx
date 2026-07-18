import { useEffect, useRef } from 'react';

export const Background3D = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lerpRef = useRef({ x: 0, y: 0 });
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
      // Smooth lerp toward mouse
      lerpRef.current.x += (mouseRef.current.x - lerpRef.current.x) * 0.03;
      lerpRef.current.y += (mouseRef.current.y - lerpRef.current.y) * 0.03;

      if (sceneRef.current) {
        // Subtle 3D perspective tilt — cinematic depth parallax
        sceneRef.current.style.transform = `
          perspective(1200px)
          rotateX(${lerpRef.current.y * -4}deg)
          rotateY(${lerpRef.current.x * 4}deg)
        `;
      }

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
        zIndex: -1,
        background: '#080808',
        overflow: 'hidden',
      }}
    >
      {/* 3D perspective scene — mouse tilts the whole layer */}
      <div
        ref={sceneRef}
        style={{
          position: 'absolute',
          inset: '-15%',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Blob 1 — large deep blue, top-left anchor */}
        <div className="cin-blob" style={{
          width: '75vw', height: '75vw',
          top: '-10%', left: '-10%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.45) 0%, rgba(29,78,216,0.20) 40%, transparent 70%)',
          animation: 'cin-drift-1 38s ease-in-out infinite',
        }} />

        {/* Blob 2 — indigo, bottom-right anchor */}
        <div className="cin-blob" style={{
          width: '65vw', height: '65vw',
          bottom: '-10%', right: '-10%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.40) 0%, rgba(79,70,229,0.15) 40%, transparent 70%)',
          animation: 'cin-drift-2 45s ease-in-out infinite',
        }} />

        {/* Blob 3 — violet, center */}
        <div className="cin-blob" style={{
          width: '55vw', height: '55vw',
          top: '25%', left: '25%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.30) 0%, rgba(109,40,217,0.12) 40%, transparent 70%)',
          animation: 'cin-drift-3 30s ease-in-out infinite',
        }} />

        {/* Blob 4 — dark cyan, top-right */}
        <div className="cin-blob" style={{
          width: '50vw', height: '50vw',
          top: '-5%', right: '5%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.28) 0%, rgba(8,145,178,0.10) 40%, transparent 70%)',
          animation: 'cin-drift-4 52s ease-in-out infinite',
        }} />

        {/* Blob 5 — electric blue, bottom-left */}
        <div className="cin-blob" style={{
          width: '45vw', height: '45vw',
          bottom: '5%', left: '10%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.38) 0%, rgba(37,99,235,0.15) 40%, transparent 70%)',
          animation: 'cin-drift-5 35s ease-in-out infinite',
        }} />
      </div>

      {/* Film grain — adds cinematic texture */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="overlay" result="blend" />
          <feComposite in="blend" in2="SourceGraphic" operator="in" />
        </filter>
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.045,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        pointerEvents: 'none',
      }} />

      {/* Vignette — cinematic edge darkening */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Top & bottom letterbox bars — very subtle cinematic feel */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};
