import { motion, AnimatePresence } from "framer-motion";
import { Poem } from "@/data/poems";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import bgImage from "@assets/ChatGPT_Image_Aug_5,_2026,_10_04_45_PM_1785939301826.png";
import { useEffect } from "react";

interface PoemModalProps {
  poem: Poem | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function PoemModal({ poem, onClose, onNext, onPrev, hasPrev, hasNext }: PoemModalProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (poem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [poem]);

  return (
    <AnimatePresence>
      {poem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl"
        >
          {/* Faint background image overlay */}
          <div 
            className="absolute inset-0 z-0 opacity-20 bg-cover bg-center bg-no-repeat mix-blend-screen"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 z-50 p-4 text-muted-foreground hover:text-foreground transition-colors mix-blend-difference group"
          >
            <X className="w-8 h-8 group-hover:scale-90 transition-transform duration-300" strokeWidth={1} />
          </button>

          {/* Navigation */}
          <div className="absolute inset-y-0 left-0 w-32 flex items-center justify-start pl-8 z-40 hidden md:flex">
            {hasPrev && (
              <button onClick={onPrev} className="p-4 text-muted-foreground hover:text-foreground transition-all hover:-translate-x-2">
                <ArrowLeft strokeWidth={1} size={32} />
              </button>
            )}
          </div>
          <div className="absolute inset-y-0 right-0 w-32 flex items-center justify-end pr-8 z-40 hidden md:flex">
            {hasNext && (
              <button onClick={onNext} className="p-4 text-muted-foreground hover:text-foreground transition-all hover:translate-x-2">
                <ArrowRight strokeWidth={1} size={32} />
              </button>
            )}
          </div>

          <div className="relative z-10 w-full max-w-3xl max-h-[100dvh] overflow-y-auto no-scrollbar px-6 py-24 md:py-32">
            <motion.div
              key={poem.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center text-center"
            >
              <div className="text-primary font-serif italic text-2xl tracking-widest mb-6">
                {poem.numeral}
              </div>
              <h2 className="font-serif text-5xl md:text-7xl font-medium text-foreground mb-16 tracking-tight">
                {poem.title}
              </h2>
              
              <div className="flex flex-col gap-12 w-full max-w-xl">
                {(() => {
                  const stanzas: string[][] = [];
                  let currentStanza: string[] = [];
                  poem.content.forEach((line) => {
                    if (line === "") {
                      if (currentStanza.length > 0) {
                        stanzas.push(currentStanza);
                        currentStanza = [];
                      }
                    } else {
                      currentStanza.push(line);
                    }
                  });
                  if (currentStanza.length > 0) stanzas.push(currentStanza);

                  return stanzas.map((stanza, sIdx) => (
                    <div key={sIdx} className="flex flex-col">
                      {stanza.map((line, lIdx) => (
                        <p 
                          key={lIdx} 
                          className="font-serif text-xl md:text-2xl text-foreground/80 leading-relaxed md:leading-[1.8] antialiased"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  ));
                })()}
              </div>

              {/* Mobile navigation */}
              <div className="mt-24 flex items-center justify-between w-full md:hidden">
                 {hasPrev ? (
                    <button onClick={onPrev} className="p-4 text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm uppercase tracking-widest">
                      <ArrowLeft strokeWidth={1} size={20} /> Prev
                    </button>
                  ) : <div />}
                  {hasNext ? (
                    <button onClick={onNext} className="p-4 text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm uppercase tracking-widest">
                      Next <ArrowRight strokeWidth={1} size={20} />
                    </button>
                  ) : <div />}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
