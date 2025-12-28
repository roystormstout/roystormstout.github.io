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
        <div ref={artRef} className="relative rounded-lg overflow-hidden shadow-2xl group aspect-video flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <style>
            {`
              @keyframes float {
                0%, 100% { transform: scale(1.3) translateY(0); }
                50% { transform: scale(1.3) translateY(-10px); }
              }
            `}
          </style>
          {!showVideo ? (
            <img
              src={isHovered ? MageCastImg : MageImg}
              alt="Mage character"
              className="h-3/4 object-contain cursor-pointer transition-all duration-300"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setShowVideo(true)}
              style={{
                transform: artVisible ? (isHovered ? 'scale(1.3)' : 'scale(1)') : 'scale(0.9)',
                opacity: artVisible ? 1 : 0,
                transitionDuration: '300ms',
                filter: isHovered ? 'drop-shadow(0 0 20px rgba(94, 225, 255, 0.7)) drop-shadow(0 0 40px rgba(94, 225, 255, 0.4))' : 'none',
                animation: isHovered ? 'float 2s ease-in-out infinite' : 'none',
              }}
            />
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
                onClick={() => setShowVideo(false)}
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
