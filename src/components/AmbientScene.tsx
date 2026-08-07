import { useMemo } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  opacity: number;
}

interface Orb {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  duration: number;
  delay: number;
  opacity: number;
}

export function AmbientScene() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      color:
        Math.random() > 0.6
          ? "#f59e0b"
          : Math.random() > 0.5
          ? "#ea580c"
          : "#7dd3fc",
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 8,
      driftX: (Math.random() - 0.5) * 80,
      driftY: -(Math.random() * 60 + 20),
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }, []);

  const orbs = useMemo<Orb[]>(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      width: Math.random() * 300 + 80,
      height: Math.random() * 300 + 80,
      color:
        Math.random() > 0.5
          ? "rgba(234,88,12,0.06)"
          : Math.random() > 0.5
          ? "rgba(125,211,252,0.05)"
          : "rgba(245,158,11,0.07)",
      duration: Math.random() * 18 + 10,
      delay: Math.random() * 6,
      opacity: 1,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Bokeh orbs */}
      {orbs.map((orb) => (
        <motion.div
          key={`orb-${orb.id}`}
          className="absolute rounded-full"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.width,
            height: orb.height,
            background: orb.color,
            filter: "blur(60px)",
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            x: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60],
            y: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40],
            scale: [1, 1.15, 0.92, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={`particle-${p.id}`}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: 0,
          }}
          animate={{
            x: [0, p.driftX],
            y: [0, p.driftY],
            opacity: [0, p.opacity, p.opacity, 0],
            scale: [0.5, 1, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
