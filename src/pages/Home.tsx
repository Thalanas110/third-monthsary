import { useState, useRef, useEffect } from "react";
import { useScroll, useTransform, motion, useMotionValue, useSpring } from "framer-motion";
import { AmbientScene } from "@/components/AmbientScene";
import { PoemCard } from "@/components/PoemCard";
import { PoemModal } from "@/components/PoemModal";
import { poems } from "@/data/poems";
import bgImage from "@assets/bg-portrait.png";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPoemIdx, setSelectedPoemIdx] = useState<number | null>(null);

  // Scroll parallax for hero
  const { scrollY } = useScroll();
  const yImage = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);

  // Performance-friendly mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const handleNext = () => {
    if (selectedPoemIdx !== null && selectedPoemIdx < poems.length - 1) {
      setSelectedPoemIdx(selectedPoemIdx + 1);
    }
  };

  const handlePrev = () => {
    if (selectedPoemIdx !== null && selectedPoemIdx > 0) {
      setSelectedPoemIdx(selectedPoemIdx - 1);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[100dvh] w-full bg-background overflow-x-hidden selection:bg-primary selection:text-primary-foreground"
    >
      {/* 3D Ambient layer - fixed behind everything */}
      <AmbientScene />

      {/* Hero Section */}
      <section className="relative h-[100dvh] w-full overflow-hidden flex items-center justify-center">
        {/* Background Image with parallax */}
        <motion.div 
          className="absolute inset-0 z-0 scale-[1.15] w-full h-full"
          style={{ 
            backgroundImage: `url(${bgImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            y: yImage,
            x: springX,
            top: springY,
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

        {/* Hero Content */}
        <motion.div 
          className="relative z-10 flex flex-col items-center text-center px-6"
          style={{ opacity: opacityHero }}
        >
          <motion.h1 
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="font-serif text-7xl md:text-9xl text-foreground font-semibold tracking-tighter mb-6 drop-shadow-2xl"
          >
            Sugatang Gugma
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
            className="text-muted-foreground text-lg md:text-xl font-light tracking-wide uppercase"
          >
            Poems from my heart to yours.
          </motion.p>
        </motion.div>

        {/* Scroll Cue */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          style={{ opacity: opacityHero }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-white/0 overflow-hidden relative">
            <motion.div 
              animate={{ y: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-1/2 bg-white"
            />
          </div>
        </motion.div>
      </section>

      {/* Gallery Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32 md:py-48 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
          {poems.map((poem, idx) => (
            <div 
              key={poem.id} 
              className={`h-[400px] ${idx % 3 === 1 ? 'lg:mt-24' : ''} ${idx % 3 === 2 ? 'lg:mt-12' : ''} ${idx % 2 === 1 ? 'md:mt-16 lg:mt-0' : ''}`}
            >
              <PoemCard 
                poem={poem} 
                index={idx} 
                onClick={() => setSelectedPoemIdx(idx)} 
              />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 text-center text-muted-foreground/50 text-sm font-light uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Sugatang Gugma
      </footer>

      {/* Poem Modal */}
      <PoemModal
        poem={selectedPoemIdx !== null ? poems[selectedPoemIdx] : null}
        onClose={() => setSelectedPoemIdx(null)}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={selectedPoemIdx !== null && selectedPoemIdx < poems.length - 1}
        hasPrev={selectedPoemIdx !== null && selectedPoemIdx > 0}
      />
    </div>
  );
}
