import { motion, AnimatePresence } from "framer-motion";
import { Poem, poems } from "@/data/poems";
import { X, ArrowLeft, ArrowRight, Play, Pause, Sun, Moon } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

interface PoemModalProps {
  poem: Poem | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

function toRoman(num: number): string {
  const map: [number, string][] = [
    [9, "IX"], [8, "VIII"], [7, "VII"], [6, "VI"], [5, "V"],
    [4, "IV"], [3, "III"], [2, "II"], [1, "I"],
  ];
  let result = "";
  for (const [value, numeral] of map) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

export function PoemModal({ poem, onClose, onNext, onPrev, hasPrev, hasNext }: PoemModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("reading-surface-dark") === "true";
    } catch {
      return false;
    }
  });

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("reading-surface-dark", String(next));
      } catch {}
      return next;
    });
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
  }, [poem?.id]);

  useEffect(() => {
    if (!poem) return;

    const previousActiveElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowLeft" && hasPrev) {
        event.preventDefault();
        onPrev();
      } else if (event.key === "ArrowRight" && hasNext) {
        event.preventDefault();
        onNext();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousActiveElement?.isConnected) {
        previousActiveElement.focus();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
  }, [poem, onClose, onNext, onPrev, hasPrev, hasNext]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {poem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`poem-title-${poem.id}`}
          className={`reading-surface fixed inset-0 z-50 overflow-y-auto${isDark ? " reading-surface--dark" : ""}`}
        >
          <header className="reading-surface__header">
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close poem"
              onClick={onClose}
              className="reading-surface__close"
            >
              <X aria-hidden="true" size={18} strokeWidth={1.8} />
              <span>Close</span>
            </button>

            <div className="reading-surface__collection" aria-label="Collection and poem number">
              <span>Sugatang Gugma</span>
              <span>{poem.numeral} / {toRoman(poems.length)}</span>
            </div>

            <nav className="reading-surface__header-nav" aria-label="Poem navigation">
              <button
                type="button"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                onClick={toggleDark}
                className="reading-surface__theme-toggle"
              >
                {isDark ? (
                  <Sun aria-hidden="true" size={16} strokeWidth={1.8} />
                ) : (
                  <Moon aria-hidden="true" size={16} strokeWidth={1.8} />
                )}
              </button>
              <button
                type="button"
                aria-label="Previous poem"
                onClick={onPrev}
                disabled={!hasPrev}
              >
                <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                aria-label="Next poem"
                onClick={onNext}
                disabled={!hasNext}
              >
                <ArrowRight aria-hidden="true" size={18} strokeWidth={1.8} />
              </button>
            </nav>
          </header>

          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
            <motion.div
              key={poem.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col"
            >
              <main className="reading-surface__main" aria-labelledby={`poem-title-${poem.id}`}>
                <div className="reading-surface__intro">
                  <p className="reading-surface__eyebrow">{poem.numeral}</p>
                  <h2 id={`poem-title-${poem.id}`}>{poem.title}</h2>
                  <p className="reading-surface__tagline">{poem.tagline}</p>
                </div>

                {poem.audioSrc && (
                  <div className="reading-surface__audio-player">
                    <audio
                      ref={audioRef}
                      src={poem.audioSrc}
                      preload="metadata"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onTimeUpdate={() => {
                        const audio = audioRef.current;
                        if (audio) setProgress(audio.currentTime);
                      }}
                      onLoadedMetadata={() => {
                        const audio = audioRef.current;
                        if (audio) setDuration(audio.duration);
                      }}
                      onEnded={() => setIsPlaying(false)}
                    />
                    <button
                      type="button"
                      aria-label={isPlaying ? "Pause" : "Play"}
                      onClick={togglePlay}
                      className="reading-surface__audio-play"
                    >
                      {isPlaying ? (
                        <Pause aria-hidden="true" size={16} strokeWidth={2} />
                      ) : (
                        <Play aria-hidden="true" size={16} strokeWidth={2} />
                      )}
                    </button>
                    <div className="reading-surface__audio-track">
                      <div
                        className="reading-surface__audio-progress"
                        style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={progress}
                        onChange={(e) => {
                          const audio = audioRef.current;
                          if (audio) {
                            audio.currentTime = Number(e.target.value);
                            setProgress(audio.currentTime);
                          }
                        }}
                        className="reading-surface__audio-slider"
                        aria-label="Seek"
                      />
                    </div>
                    <span className="reading-surface__audio-time">
                      {formatTime(progress)} / {formatTime(duration)}
                    </span>
                  </div>
                )}

                <article className="reading-surface__poem" aria-label={`${poem.title} poem text`}>
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

                    return stanzas.map((stanza, stanzaIndex) => (
                      <div key={stanzaIndex} className="reading-surface__stanza">
                        {stanza.map((line, lineIndex) => {
                          if (/^\[.+\]$/.test(line)) {
                            return <p key={`${stanzaIndex}-${lineIndex}`} className="reading-surface__section-marker">{line}</p>;
                          }
                          if (/^\*.+\*$/.test(line)) {
                            return <p key={`${stanzaIndex}-${lineIndex}`} className="reading-surface__direction">{line.replace(/^\*/, "").replace(/\*$/, "")}</p>;
                          }
                          if (/^\*\*.+\*\*$/.test(line)) {
                            return <p key={`${stanzaIndex}-${lineIndex}`} className="reading-surface__emphasis">{line.replace(/^\*\*/, "").replace(/\*\*$/, "")}</p>;
                          }
                          return <p key={`${stanzaIndex}-${lineIndex}`}>{line}</p>;
                        })}
                      </div>
                    ));
                  })()}
                </article>

                <div className="reading-surface__mobile-nav" aria-label="Mobile poem navigation">
                  <button type="button" onClick={onPrev} disabled={!hasPrev}>
                    <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.8} />
                    <span>Previous</span>
                  </button>
                  <button type="button" onClick={onNext} disabled={!hasNext}>
                    <span>Next</span>
                    <ArrowRight aria-hidden="true" size={16} strokeWidth={1.8} />
                  </button>
                </div>
              </main>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
