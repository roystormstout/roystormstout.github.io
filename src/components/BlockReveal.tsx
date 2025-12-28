// BlockReveal animation component
export default function BlockReveal({
  children,
  isVisible,
  delay = 0,
  blockColor = 'block-white',
  className = '',
}: {
  children: React.ReactNode;
  isVisible: boolean;
  delay?: number;
  blockColor?: 'block-white' | 'block-cyan' | 'block-magenta' | 'block-amber';
  className?: string;
}) {
  return (
    <span
      className={`block-reveal ${blockColor} delay-${delay} ${isVisible ? 'animate' : ''} ${className}`}
    >
      <span className="block-reveal-text">{children}</span>
    </span>
  );
}
