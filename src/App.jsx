import { useState } from 'react'
import './App.css'

function App() {
  const [started, setStarted] = useState(false)

  return (
    <main className="trial">
      <div className="system">HEAVEN ADMINISTRATION SYSTEM</div>

      <section className="character">
        <div className="name">ゆめ</div>

        <div className="dialogue">
          {started
            ? 'あなたの徳ポイントは、現在83です。'
            : 'それでは、あなたの審査を開始します。'}
        </div>
      </section>

      {!started && (
        <button onClick={() => setStarted(true)}>
          審査を開始する
        </button>
      )}
    </main>
  )
}

export default App