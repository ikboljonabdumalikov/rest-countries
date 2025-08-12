import { Routes, Route, Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import './App.css'

import Home from './pages/Home.jsx'
import Detail from './pages/Detail.jsx'

function App() {
  const prefersDark = useMemo(
    () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
    []
  )
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light'))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">Where in the world?</Link>
          <button
            className="theme-toggle"
            aria-label="Toggle color theme"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/country/:code" element={<Detail />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
