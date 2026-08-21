import { useEffect, useRef } from 'react';

const COUNT = 600;
const SPREAD = 25;
const PALETTE = ['#4455da', '#2EE6D8', '#60a5fa', '#a78bfa', '#818cf8'];

const rng = () => {
  let s = 12345;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
};

// Deterministic star field: x, y, depth (z), color, radius
const generateStars = () => {
  const rand = rng();
  const stars = [];
  for (let i = 0; i < COUNT; i++) {
    stars.push({
      x: (rand() - 0.5) * SPREAD,
      y: (rand() - 0.5) * SPREAD,
      z: (rand() - 0.5) * SPREAD,
      color: PALETTE[Math.floor(rand() * PALETTE.length)],
      r: 0.4 + rand() * 1.1,
      twinkle: rand() * Math.PI * 2,
    });
  }
  return stars;
};

const STARS = generateStars();

export const Starfield = ({ reducedMotion }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let frameId = 0;
    let rotationY = 0;
    let rotationX = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = (time) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      if (!reducedMotion) {
        rotationY += 0.00025;
        rotationX += 0.00008;
      }

      // Simple perspective projection of the rotating point cloud
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const scale = w / 12; // field-of-view equivalent
      const cx = w / 2;
      const cy = h / 2;

      for (let i = 0; i < STARS.length; i++) {
        const s = STARS[i];
        let x = s.x * cosY - s.z * sinY;
        let z = s.x * sinY + s.z * cosY + 20; // +20 pushes cloud away from camera
        const y = s.y * cosX - z * sinX;
        z = s.y * sinX + z * cosX;
        if (z <= 0.5) continue;

        const persp = scale / z;
        const px = cx + x * persp;
        const py = cy + y * persp;
        if (px < -4 || px > w + 4 || py < -4 || py > h + 4) continue;

        const alpha = reducedMotion ? 0.18 : 0.35 + 0.3 * Math.sin(time * 0.001 + s.twinkle);
        ctx.globalAlpha = Math.max(alpha, 0.05);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(s.r * (persp / scale) * 6, 0.3), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ opacity: reducedMotion ? 0.2 : 0.4 }}
    />
  );
};
