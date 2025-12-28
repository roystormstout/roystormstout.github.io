import CareerTimeline from './CareerTimeline';

export default function Resume() {
  return (
    <section
      id="resume"
      className="relative z-20 min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <CareerTimeline />
    </section>
  );
}
