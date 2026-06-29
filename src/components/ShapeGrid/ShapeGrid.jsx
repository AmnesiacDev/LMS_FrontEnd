import { useEffect, useRef } from 'react';
import './ShapeGrid.css';

const TAU = Math.PI * 2;

const ShapeGrid = ({
  direction = 'diagonal',
  speed = 0.45,
  borderColor = 'oklch(40% 0.08 252 / 0.18)',
  squareSize = 48,
  hoverFillColor = 'oklch(68% 0.18 197 / 0.22)',
  shape = 'hexagon',
  hoverTrailAmount = 5,
  className = '',
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: -9999, y: -9999 };
    const trail = [];
    let animationFrame = 0;
    let offsetX = 0;
    let offsetY = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawShape = (x, y, size, variant) => {
      if (variant === 'circle') {
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size * 0.34, 0, TAU);
        return;
      }

      if (variant === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(x + size / 2, y + size * 0.16);
        ctx.lineTo(x + size * 0.86, y + size * 0.82);
        ctx.lineTo(x + size * 0.14, y + size * 0.82);
        ctx.closePath();
        return;
      }

      if (variant === 'hexagon') {
        ctx.beginPath();
        for (let i = 0; i < 6; i += 1) {
          const angle = TAU / 6 * i + Math.PI / 6;
          const px = x + size / 2 + Math.cos(angle) * size * 0.42;
          const py = y + size / 2 + Math.sin(angle) * size * 0.42;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        return;
      }

      ctx.beginPath();
      ctx.rect(x + 1, y + 1, size - 2, size - 2);
    };

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      if (!media.matches) {
        if (direction.includes('left')) offsetX += speed;
        else offsetX -= speed;
        if (direction.includes('up')) offsetY += speed;
        else if (direction.includes('down') || direction === 'diagonal') offsetY -= speed;
      }

      const size = squareSize;
      const startX = ((offsetX % size) + size) % size - size;
      const startY = ((offsetY % size) + size) % size - size;
      const hoverCol = Math.floor((pointer.x - startX) / size);
      const hoverRow = Math.floor((pointer.y - startY) / size);

      if (pointer.x > -1 && pointer.y > -1) {
        const key = `${hoverCol}:${hoverRow}`;
        if (trail[0] !== key) trail.unshift(key);
        trail.length = hoverTrailAmount;
      }

      for (let y = startY; y < height + size; y += size) {
        for (let x = startX; x < width + size; x += size) {
          const col = Math.floor((x - startX) / size);
          const row = Math.floor((y - startY) / size);
          const key = `${col}:${row}`;
          const trailIndex = trail.indexOf(key);

          drawShape(x, y, size, shape);
          if (trailIndex > -1) {
            ctx.globalAlpha = 1 - trailIndex / Math.max(hoverTrailAmount, 1);
            ctx.fillStyle = hoverFillColor;
            ctx.fill();
            ctx.globalAlpha = 1;
          }

          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animationFrame = requestAnimationFrame(draw);
    };

    const handlePointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
      trail.length = 0;
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [direction, speed, borderColor, squareSize, hoverFillColor, shape, hoverTrailAmount]);

  return <canvas ref={canvasRef} className={`shapegrid-canvas ${className}`} aria-hidden="true" />;
};

export default ShapeGrid;
