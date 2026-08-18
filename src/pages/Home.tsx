import { useState, useRef, useEffect } from "react";
import { useScroll, useTransform, motion, useMotionValue, useSpring } from "framer-motion";
import { AmbientScene } from "@/components/AmbientScene";
import { PoemCard } from "@/components/PoemCard";
import { PoemModal } from "@/components/PoemModal";
import { poems } from "@/data/poems";
import portraitBg from "@assets/bg-portrait.png";
import desktopBg from "@assets/airport gc uniform.png";

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
      className="relative min-h-[100svh] w-full overflow-x-hidden bg-background selection:bg-primary selection:text-primary-foreground"
    >
      {/* 3D Ambient layer - fixed behind everything */}
      <AmbientScene />

      {/* Hero Section */}
      <section className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden">
        {/* Background Image with parallax */}
        <motion.div 
          className="absolute inset-[-4%] z-0 h-[108%] w-[108%] bg-cover bg-center bg-no-repeat lg:hidden"
          style={{ 
            backgroundImage: `url(${portraitBg})`,
            x: springX,
          }}
        />
        <motion.div 
          className="absolute inset-[-8%] z-0 hidden h-[116%] w-[116%] bg-cover bg-center bg-no-repeat lg:block"
          style={{ 
            backgroundImage: `url(${desktopBg})`,
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
            className="mb-6 max-w-[min(92vw,72rem)] font-serif text-[clamp(3.25rem,12vw,9rem)] font-semibold leading-[0.88] tracking-tighter text-foreground drop-shadow-2xl"
          >
            Sugatang Gugma
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
            className="px-4 text-center text-[clamp(0.72rem,2.5vw,1.25rem)] font-light uppercase tracking-[0.14em] text-muted-foreground"
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
          className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-4"
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
      <section className="relative z-10 mx-auto min-h-screen w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 md:py-48">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16">
          {poems.map((poem, idx) => (
            <div 
              key={poem.id} 
              className={`h-[360px] sm:h-[400px] ${idx % 3 === 1 ? 'lg:mt-24' : ''} ${idx % 3 === 2 ? 'lg:mt-12' : ''} ${idx % 2 === 1 ? 'md:mt-16 lg:mt-0' : ''}`}
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
