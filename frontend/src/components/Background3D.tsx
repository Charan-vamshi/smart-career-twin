import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { DepthOfField, Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';

// Generate canvas texture for paper
function createPaperTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 724; // A4 proportion

  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle paper grain
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const alpha = Math.random() * 0.04;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }

  // Horizontal ruled lines
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 60; y < canvas.height - 40; y += 28) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(canvas.width - 40, y);
    ctx.stroke();
  }

  // Faint text blocks (simulated text lines)
  for (let row = 0; row < 18; row++) {
    const y = 70 + row * 28;
    const lineWidth = 0.4 + Math.random() * 0.5;
    ctx.strokeStyle = `rgba(100, 160, 255, ${lineWidth * 0.06})`;
    ctx.lineWidth = 3 + Math.random() * 4;
    ctx.lineCap = 'round';
    const lineLen = (0.3 + Math.random() * 0.6) * (canvas.width - 80);
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(40 + lineLen, y);
    ctx.stroke();
  }

  // Top header block
  ctx.fillStyle = 'rgba(59, 130, 246, 0.12)';
  ctx.fillRect(40, 30, canvas.width * 0.6, 14);

  // Blue left accent bar
  ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
  ctx.fillRect(0, 0, 4, canvas.height);

  // Subtle border glow
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  return new THREE.CanvasTexture(canvas);
}

interface PaperProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  speed: number;
  rotSpeed: [number, number, number];
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  depth: number;
  texture: THREE.CanvasTexture;
}

const Paper = ({ position, rotation, scale, speed, rotSpeed, mouseRef, depth, texture }: PaperProps) => {
  const mesh = useRef<THREE.Mesh>(null);
  const initPos = useRef(position);
  const time = useRef(Math.random() * 100);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    time.current += delta * speed;

    // Float drift
    mesh.current.position.y = initPos.current[1] + Math.sin(time.current * 0.4) * 0.8;
    mesh.current.position.x = initPos.current[0] + Math.cos(time.current * 0.25) * 0.5;

    // Slow rotation
    mesh.current.rotation.x += delta * rotSpeed[0];
    mesh.current.rotation.y += delta * rotSpeed[1];
    mesh.current.rotation.z += delta * rotSpeed[2];

    // Mouse parallax (closer papers move more)
    const parallaxStrength = (1 - depth) * 1.5;
    mesh.current.position.x += (mouseRef.current.x * parallaxStrength - mesh.current.position.x + initPos.current[0]) * 0.03;
    mesh.current.position.y += (-mouseRef.current.y * parallaxStrength - mesh.current.position.y + initPos.current[1] + Math.sin(time.current * 0.4) * 0.8) * 0.03;
  });

  return (
    <mesh ref={mesh} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[2, 2.83]} /> {/* A4 proportion */}
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0.55 + (1 - depth) * 0.35}
        roughness={0.9}
        metalness={0.05}
        side={THREE.DoubleSide}
        emissive={new THREE.Color(0x0a1628)}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

const Scene = ({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) => {
  const texture = useMemo(() => createPaperTexture(), []);

  const papers = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const depth = i / 18; // 0 = near, 1 = far
      return {
        id: i,
        position: [
          (Math.random() - 0.5) * 24,
          (Math.random() - 0.5) * 18,
          -depth * 14 - 2,
        ] as [number, number, number],
        rotation: [
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * Math.PI * 0.5,
        ] as [number, number, number],
        scale: 1.2 + Math.random() * 2,
        speed: 0.3 + Math.random() * 0.7,
        rotSpeed: [
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.06,
          (Math.random() - 0.5) * 0.02,
        ] as [number, number, number],
        depth,
        texture,
      };
    });
  }, [texture]);

  return (
    <>
      <color attach="background" args={['#080808']} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#3b82f6" />
      <directionalLight position={[-8, -3, -5]} intensity={0.4} color="#1e3a5f" />
      <pointLight position={[0, 0, 4]} intensity={0.6} color="#2563eb" distance={20} />

      {papers.map((p) => (
        <Paper key={p.id} {...p} mouseRef={mouseRef} />
      ))}

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.3}
          mipmapBlur
        />
        <DepthOfField
          focusDistance={0.005}
          focalLength={0.2}
          bokehScale={2}
          height={360}
        />
      </EffectComposer>
    </>
  );
};

export const Background3D = () => {
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1]" style={{ background: '#080808' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        dpr={[1, 1]}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
          }, false);
        }}
      >
        <Scene mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
};
