import { useState, useRef, useEffect } from 'react';
import BlockReveal from '../BlockReveal';
import YiImg from '../../assets/yi.png';
import ErImg from '../../assets/er.png';
import SanImg from '../../assets/san.png';

interface ProjectProps {
  isEven: boolean;
  isVisible: boolean;
}

export default function Project2({ isEven, isVisible }: ProjectProps) {
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);
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
      <div className="w-full lg:w-1/2 flex-shrink-0">
        <div ref={artRef} className="relative rounded-lg overflow-hidden shadow-2xl aspect-square flex items-center justify-center">
          {/* Yi - leftmost, lowest z-index, no animation */}
          <img
            src={YiImg}
            alt="Yi"
            className="absolute h-2/5 object-contain transition-all ease-out cursor-pointer"
            onMouseEnter={() => setHoveredTile('yi')}
            onMouseLeave={() => setHoveredTile(null)}
            style={{
              opacity: artVisible ? 1 : 0,
              transform: hoveredTile === 'yi' ? 'translateY(-30%)' : 'translateY(0)',
              transitionDuration: '300ms',
              left: '10%',
              zIndex: 10,
            }}
          />
          {/* Er - middle, slides in from top after San moves */}
          <img
            src={ErImg}
            alt="Er"
            className="absolute h-2/5 object-contain transition-all ease-out cursor-pointer"
            onMouseEnter={() => setHoveredTile('er')}
            onMouseLeave={() => setHoveredTile(null)}
            style={{
              transform: artVisible 
                ? (hoveredTile === 'er' ? 'translateY(-30%)' : 'translateY(0)') 
                : 'translateY(-200%)',
              opacity: artVisible ? 1 : 0,
              transitionDuration: artVisible && hoveredTile !== 'er' ? '1200ms' : '300ms',
              transitionDelay: artVisible && !hoveredTile ? '1000ms' : '0ms',
              left: '35%',
              zIndex: 20,
            }}
          />
          {/* San - starts next to Yi at 22%, moves to 60% when visible */}
          <img
            src={SanImg}
            alt="San"
            className="absolute h-2/5 object-contain transition-all ease-out cursor-pointer"
            onMouseEnter={() => setHoveredTile('san')}
            onMouseLeave={() => setHoveredTile(null)}
            style={{
              opacity: artVisible ? 1 : 0,
              transform: hoveredTile === 'san' ? 'translateY(-30%)' : 'translateY(0)',
              transitionDuration: '300ms',
              transitionDelay: artVisible && !hoveredTile ? '400ms' : '0ms',
              left: artVisible ? '60%' : '22%',
              zIndex: 30,
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
            Suphx: The World's Strongest Mahjong AI
          </BlockReveal>
        </h3>

        <p
          className="text-base sm:text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          <BlockReveal isVisible={textVisible} delay={1} blockColor="block-white">
            Contributed to early Suphx: a Mahjong AI beating top humans (+17% stable rank); researched reinforcement learning for imperfect information (prior coaching) and built a Qt log visualizer for strategy analysis.
          </BlockReveal>
        </p>

        <BlockReveal isVisible={textVisible} delay={2} blockColor="block-cyan">
          <a
            href="https://www.microsoft.com/en-us/research/project/suphx-mastering-mahjong-with-deep-reinforcement-learning/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-block px-6 py-3 font-semibold transition-all duration-300"
            style={{
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}
          >
            VIEW PROJECT →
            {/* Bottom border - expands from center on hover */}
            <span
              className="absolute left-1/2 bottom-0 h-0.5 transition-all duration-300 ease-out -translate-x-1/2 w-0 group-hover:w-full"
              style={{ backgroundColor: 'var(--text-primary)' }}
            />
            {/* Left border - expands from bottom on hover */}
            <span
              className="absolute left-0 bottom-0 w-0.5 transition-all duration-300 ease-out origin-bottom h-0 group-hover:h-full"
              style={{ backgroundColor: 'var(--text-primary)', transitionDelay: '150ms' }}
            />
            {/* Right border - expands from bottom on hover */}
            <span
              className="absolute right-0 bottom-0 w-0.5 transition-all duration-300 ease-out origin-bottom h-0 group-hover:h-full"
              style={{ backgroundColor: 'var(--text-primary)', transitionDelay: '150ms' }}
            />
            {/* Top border - expands from both corners on hover */}
            <span
              className="absolute left-0 top-0 h-0.5 transition-all duration-300 ease-out w-0 group-hover:w-1/2"
              style={{ backgroundColor: 'var(--text-primary)', transitionDelay: '300ms' }}
            />
            <span
              className="absolute right-0 top-0 h-0.5 transition-all duration-300 ease-out w-0 group-hover:w-1/2"
              style={{ backgroundColor: 'var(--text-primary)', transitionDelay: '300ms' }}
            />
          </a>
        </BlockReveal>
      </div>
    </div>
  );
}
