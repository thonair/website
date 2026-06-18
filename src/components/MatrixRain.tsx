import { useEffect, useRef } from "react";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";

interface MatrixRainProps {
  boost?: boolean;
}

const MatrixRain = ({ boost = false }: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boostRef = useRef(boost);

  useEffect(() => { boostRef.current = boost; }, [boost]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const fontSize = 14;
    let columns: number;
    let drops: number[];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () =>
        Math.random() * -canvas.height / fontSize
      );
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const isBoost = boostRef.current;
      ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = `rgba(0, 255, 65, ${(isBoost ? 0.7 : 0.4) + Math.random() * 0.6})`;
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > (isBoost ? 0.92 : 0.985)) {
          drops[i] = 0;
        }
        drops[i] += isBoost ? 1.2 : 0.5;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-15 pointer-events-none matrix-rain-bg"
      style={{ zIndex: 0 }}
    />
  );
};

export default MatrixRain;
