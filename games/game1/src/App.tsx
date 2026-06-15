const lanes = ['Input', 'Rules', 'Juice']

export default function App() {
  return (
    <main className="game-shell">
      <section className="game-stage" aria-labelledby="game-title">
        <div className="game-copy">
          <p className="eyebrow">Prototype Slot</p>
          <h1 id="game-title">Game 1</h1>
          <p className="summary">
            A dedicated playground for the first hosted game at ultroy.com/games/game1.
          </p>
        </div>

        <div className="status-panel" aria-label="Prototype checklist">
          {lanes.map((lane) => (
            <div className="status-row" key={lane}>
              <span>{lane}</span>
              <strong>Ready</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}