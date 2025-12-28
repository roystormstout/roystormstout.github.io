import './App.css'
import Bio from './components/Bio'
import Resume from './components/Resume'
import Portfolio from './components/Portfolio'

function App() {
  return (
    <div className="w-full" style={{backgroundColor: 'var(--bg-primary)'}}>
      <Bio />
      <Resume />
      <Portfolio />
    </div>
  )
}

export default App
