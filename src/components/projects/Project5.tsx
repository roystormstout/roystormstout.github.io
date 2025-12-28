import { useState, useRef, useEffect } from 'react';
import BlockReveal from '../BlockReveal';
import HappyEndingBgImg from '../../assets/happy_ending_bg.png';
import HorrorGirlImg from '../../assets/horror_girl.png';

interface ProjectProps {
  isEven: boolean;
  isVisible: boolean;
}

export default function Project5({ isEven, isVisible }: ProjectProps) {
  const [isHovered, setIsHovered] = useState(false);
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
      {/* Image */}
      <div className="w-4/5 lg:w-1/3 flex-shrink-0 m-12 lg:m-26">
        <div 
          ref={artRef}
          className="relative rounded-lg overflow-hidden shadow-2xl aspect-square cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <style>
            {`
              @keyframes horrorFlicker {
                0%, 100% { opacity: 0; }
                15% { opacity: 0; }
                18% { opacity: 0.7; }
                28% { opacity: 0.5; }
                32% { opacity: 0; }
                50% { opacity: 0; }
                53% { opacity: 0.8; }
                65% { opacity: 0.6; }
                70% { opacity: 0; }
                82% { opacity: 0; }
                85% { opacity: 0.6; }
                92% { opacity: 0.4; }
                95% { opacity: 0; }
              }
            `}
          </style>
          <img
            src={HappyEndingBgImg}
            alt="A Happy Ending"
            className="w-full h-full object-cover"
            style={{
              transform: artVisible ? 'scale(1)' : 'scale(1.1)',
              opacity: artVisible ? 1 : 0,
              transitionDuration: '1200ms',
            }}
          />
          {/* Horror girl overlay - flickers on hover */}
          <img
            src={HorrorGirlImg}
            alt=""
            className="absolute w-3/10 h-auto object-contain pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%]"
            style={{
              animation: isHovered ? 'horrorFlicker 2s infinite' : 'none',
              opacity: 0,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div ref={textRef} className="w-full lg:w-1/2 space-y-4 sm:space-y-6">
        <h3
          className="text-2xl sm:text-3xl md:text-4xl font-bold"
          style={{ color: 'var(--text-primary)', letterSpacing: '0.02em' }}
        >
          <BlockReveal isVisible={textVisible} delay={0} blockColor="block-amber">
            A Happy Ending
          </BlockReveal>
        </h3>

        <p
          className="text-base sm:text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          <BlockReveal isVisible={textVisible} delay={1} blockColor="block-white">
All‑campus VR competition winner (“Most Polished” & “Best Sound Effects”); implemented Oculus locomotion/interaction, trigger‑based LERP doors, and a chaptered narrative with contextual event scripting.          </BlockReveal>
        </p>
      </div>
    </div>
  );
}
