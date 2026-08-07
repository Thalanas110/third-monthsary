import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Poem } from "@/data/poems";
import React, { useRef } from "react";

interface PoemCardProps {
  poem: Poem;
  index: number;
  onClick: (poem: Poem) => void;
}

export function PoemCard({ poem, index, onClick }: PoemCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Mouse position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for rotation
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse position to rotation angle
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => onClick(poem)}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className="group relative w-full h-full flex flex-col p-8 rounded-2xl cursor-pointer border border-white/5 bg-white/5 backdrop-blur-md overflow-hidden"
      >
        {/* Hover glare effect */}
        <motion.div 
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            transform: "translateZ(1px)" // Lift glare off background
          }}
        />

        {/* Content */}
        <div 
          className="relative z-20 flex flex-col h-full pointer-events-none"
          style={{ transform: "translateZ(30px)" }} // Pop content up in 3d
        >
          <div className="flex justify-between items-start mb-6">
            <span className="text-primary font-serif italic text-xl tracking-widest">{poem.numeral}</span>
            <span className="text-muted-foreground/50 w-6 h-6 flex items-center justify-center border border-muted-foreground/30 rounded-full text-xs">
              ✦
            </span>
          </div>
          
          <h3 className="font-serif text-3xl font-medium text-foreground mb-4 group-hover:text-primary transition-colors duration-500">
            {poem.title}
          </h3>
          
          <p className="text-muted-foreground text-sm font-light mt-auto leading-relaxed max-w-[90%]">
            {poem.tagline}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
