import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  depth: number;
  isGold: boolean;
}

export const Background3D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, active: false };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(700px circle at ${e.clientX}px ${e.clientY}px, rgba(255,255,255,0.035), transparent 65%)`;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Create interactive particles (Monochromatic Platinum + Warm Champagne Gold pair)
    const particleCount = Math.min(75, Math.floor((width * height) / 18000));
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.45 + 0.10,
      depth: Math.random() * 0.8 + 0.2,
      isGold: false,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smoothly interpolate mouse position
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const offsetX = (mouse.x - width / 2) * 0.025;
      const offsetY = (mouse.y - height / 2) * 0.025;

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const drawX = p.x - offsetX * p.depth;
        const drawY = p.y - offsetY * p.depth;

        // Subtle cursor repulsion & glow boost
        const dxMouse = drawX - mouse.x;
        const dyMouse = drawY - mouse.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        let extraAlpha = 0;
        if (distMouse < 220) {
          extraAlpha = (1 - distMouse / 220) * 0.45;
          // Draw delicate connection line to cursor
          ctx.beginPath();
          ctx.moveTo(drawX, drawY);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = p.isGold
            ? `rgba(229, 193, 88, ${(1 - distMouse / 220) * 0.22})`
            : `rgba(255, 255, 255, ${(1 - distMouse / 220) * 0.15})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }

        // Connect nearby particles into a subtle constellation
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const p2X = p2.x - offsetX * p2.depth;
          const p2Y = p2.y - offsetY * p2.depth;
          const dx = drawX - p2X;
          const dy = drawY - p2Y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(drawX, drawY);
            ctx.lineTo(p2X, p2Y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 130) * 0.06})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        if (p.isGold) {
          ctx.fillStyle = `rgba(229, 193, 88, ${Math.min(1, p.alpha + extraAlpha)})`;
        } else {
          ctx.fillStyle = `rgba(244, 244, 245, ${Math.min(1, p.alpha + extraAlpha)})`;
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#060608',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Top atmospheric horizon glow (Platinum + Warm Champagne pair) */}
      <div
        style={{
          position: 'absolute',
          top: '-25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90vw',
          height: '55vh',
          background:
            'radial-gradient(ellipse at center, rgba(229, 193, 88, 0.10) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 75%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Subtle architectural dot-grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 35%, #000 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 35%, #000 30%, transparent 100%)',
        }}
      />

      {/* Interactive Cursor Spotlight */}
      <div
        ref={spotlightRef}
        style={{
          position: 'absolute',
          inset: 0,
          transition: 'background 0.05s linear',
        }}
      />

      {/* Interactive 2D Particle Constellation Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Cinematic Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 40%, rgba(4, 4, 5, 0.85) 100%)',
        }}
      />
    </div>
  );
};
