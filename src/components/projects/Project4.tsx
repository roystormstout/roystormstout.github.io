import { useState, useRef, useEffect } from 'react';
import BlockReveal from '../BlockReveal';
import CarImg from '../../assets/car.png';

interface ProjectProps {
  isEven: boolean;
  isVisible: boolean;
}

export default function Project4({ isEven, isVisible }: ProjectProps) {
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
          <style>
            {`
              @keyframes raceIn {
                0% { 
                  transform: translateX(150%) rotate(5deg) scale(0.8);
                  opacity: 0;
                }
                60% { 
                  transform: translateX(-10%) rotate(-2deg) scale(1.05);
                  opacity: 1;
                }
                80% { 
                  transform: translateX(5%) rotate(1deg) scale(1);
                }
                100% { 
                  transform: translateX(0) rotate(0deg) scale(1);
                  opacity: 1;
                }
              }
              @keyframes skidMarks {
                0% { opacity: 0; width: 0; right: 0; }
                50% { opacity: 0.6; width: 60%; }
                100% { opacity: 0; width: 80%; }
              }
            `}
          </style>
          {/* Skid marks effect */}
          <div
            className="absolute bottom-1/3 right-0 h-1 bg-gradient-to-l from-transparent via-gray-400 to-transparent rounded-full"
            style={{
              animation: artVisible ? 'skidMarks 0.8s ease-out forwards' : 'none',
              animationDelay: '0.7s',
              opacity: 0,
            }}
          />
          <div
            className="absolute bottom-[calc(33%-8px)] right-0 h-1 bg-gradient-to-l from-transparent via-gray-400 to-transparent rounded-full"
            style={{
              animation: artVisible ? 'skidMarks 0.8s ease-out forwards' : 'none',
              animationDelay: '0.75s',
              opacity: 0,
            }}
          />
          {/* Car */}
          <img
            src={CarImg}
            alt="RC Car"
            className="h-3/5 object-contain"
            style={{
              animation: artVisible ? 'raceIn 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards' : 'none',
              animationDelay: '1.2s',
              opacity: artVisible ? undefined : 0,
              transform: artVisible ? undefined : 'translateX(150%)',
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
            IRONMAN
          </BlockReveal>
        </h3>

        <p
          className="text-base sm:text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          <BlockReveal isVisible={textVisible} delay={1} blockColor="block-white">
            Unity/Oculus VR rig that streams front/rear camera feeds (Intel RealSense D435i + CSI) to the headset and maps Logitech wheel/pedal input via PC → NVIDIA Jetson Nano into servo/steering commands over Wi-Fi 6—demonstrated realistic remote driving for training, data collection, and autonomy testing.
                      </BlockReveal>
        </p>

        <BlockReveal isVisible={textVisible} delay={2} blockColor="block-cyan">
          <a
            href="https://roar.berkeley.edu/"
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
