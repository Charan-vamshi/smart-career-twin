import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export const MagneticButton = ({ children, strength = 0.3, className = '' }: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  const springConfig = { stiffness: 200, damping: 20, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const scale = useMotionValue(1);
  const springScale = useSpring(scale, { stiffness: 300, damping: 25 });

  const glowBackground = useTransform(
    [glowX, glowY],
    ([gx, gy]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(59,130,246,0.15) 0%, transparent 60%)`
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;

    mouseX.set(distX * strength);
    mouseY.set(distY * strength);

    // glow position (as percentage)
    glowX.set(((e.clientX - rect.left) / rect.width) * 100);
    glowY.set(((e.clientY - rect.top) / rect.height) * 100);

    scale.set(1.04);
  }, [mouseX, mouseY, glowX, glowY, scale, strength]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    glowX.set(50);
    glowY.set(50);
    scale.set(1);
  }, [mouseX, mouseY, glowX, glowY, scale]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y, scale: springScale, position: 'relative', display: 'inline-block' }}
      className={className}
    >
      {/* Spotlight glow overlay */}
      <motion.div
        style={{
          background: glowBackground,
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </motion.div>
  );
};
