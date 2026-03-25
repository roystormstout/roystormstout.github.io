import { useState, useRef, useEffect } from 'react';
import BlockReveal from '../BlockReveal';
import MageImg from '../../assets/mage.png';
import MageCastImg from '../../assets/mage_cast.png';

interface ProjectProps {
  isEven: boolean;
  isVisible: boolean;
}

export default function Project3({ isEven, isVisible }: ProjectProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [artVisible, setArtVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const artRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === artRef.current) {
            setArtVisible(entry.isIntersecting);
          } else if (entry.target === textRef.current) {
            setTextVisible(entry.isIntersecting);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (artRef.current) observer.observe(artRef.current);
    if (textRef.current) observer.observe(textRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`flex flex-col ${
        isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
      } gap-6 sm:gap-8 md:gap-12 items-center transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      {/* Art / Video */}
      <div className="w-full lg:w-1/2 flex-shrink-0" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div ref={artRef} className="relative overflow-hidden group aspect-video flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <style>
            {`
              @keyframes float {
                0%, 100% { transform: scale(1.25) translateY(0); }
                50% { transform: scale(1.25) translateY(-10px); }
              }
            `}
          </style>
          {!showVideo ? (
            <div className="flex flex-col items-center cursor-pointer h-full"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setShowVideo(true)}
            >
              <div className="relative flex-1 min-h-0 flex items-center justify-center w-full">
              <img
                src={MageImg}
                alt="Mage character"
                className="max-h-[60%] object-contain transition-all duration-300"
                style={{
                  transform: artVisible ? 'scale(1)' : 'scale(0.9)',
                  opacity: artVisible ? (isHovered ? 0 : 1) : 0,
                  transitionDuration: '300ms',
                  animation: isHovered ? 'float 2s ease-in-out infinite' : 'none',
                }}
              />
              <img
                src={MageCastImg}
                alt="Mage character casting"
                className="max-h-[70%] object-contain transition-all duration-300 absolute"
                style={{
                  transform: artVisible ? (isHovered ? 'scale(1.25)' : 'scale(1)') : 'scale(0.9)',
                  opacity: artVisible ? (isHovered ? 1 : 0) : 0,
                  transitionDuration: '300ms',
                  filter: isHovered ? 'drop-shadow(0 0 10px rgba(94, 225, 255, 0.35)) drop-shadow(0 0 20px rgba(94, 225, 255, 0.15))' : 'none',
                  animation: isHovered ? 'float 2s ease-in-out infinite' : 'none',
                }}
              />
              </div>
              {/* Click prompt */}
              <div
                className="mt-3 transition-all duration-500 pointer-events-none"
                style={{
                  opacity: artVisible ? (isHovered ? 0 : 0.8) : 0,
                  transform: artVisible
                    ? `translateY(${isHovered ? '8px' : '0'})`
                    : 'translateY(12px)',
                }}
              >
                <div
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold tracking-widest uppercase whitespace-nowrap"
                  style={{
                    color: 'var(--accent-cyan)',
                    border: '1px solid var(--accent-cyan)',
                    backgroundColor: 'rgba(94, 225, 255, 0.08)',
                    backdropFilter: 'blur(4px)',
                    letterSpacing: '0.12em',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 18l8-10 8 10z" />
                  </svg>
                  Click for video
                </div>
              </div>
            </div>
          ) : (
            <>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/7GEG_zKTBqk?autoplay=1&mute=1"
                title="CSE 125 Video Game Demos 2019 - Group 3 Sudo Nerds"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="rounded-lg"
              />
              <button
                onClick={() => { setShowVideo(false); setIsHovered(false); }}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors duration-200 cursor-pointer"
                title="Back to art"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div ref={textRef} className="w-full lg:w-1/2 space-y-4 sm:space-y-6">
        <h3
          className="text-2xl sm:text-3xl md:text-4xl font-bold"
          style={{ color: 'var(--text-primary)', letterSpacing: '0.02em' }}
        >
          <BlockReveal isVisible={textVisible} delay={0} blockColor="block-amber">
            KillStreak
          </BlockReveal>
        </h3>

        <p
          className="text-base sm:text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          <BlockReveal isVisible={textVisible} delay={1} blockColor="block-white">
            OpenGL MOBA with custom physics (coarse‑mesh collision) to optimize server tick rates; precise screen‑to‑world mouse movement, client‑side rendering prediction, and core systems (abilities, economy, UI, pre‑match).
          </BlockReveal>
        </p>
      </div>
    </div>
  );
}
