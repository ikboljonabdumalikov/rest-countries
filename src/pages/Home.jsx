import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

// Minimal contract
// Inputs: none
// Behavior: loads countries from local data.json (fallback to REST API later), supports text search and region filter, renders grid.

const DATA_URL = '/data.json'

function formatNumber(n) {
  try {
    return new Intl.NumberFormat().format(n)
  } catch {
    return n
  }
}

export default function Home() {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(DATA_URL)
        if (!res.ok) throw new Error('Failed to fetch data.json')
        const data = await res.json()
        if (!cancelled) setCountries(data)
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const regions = useMemo(() => {
    const set = new Set()
    countries.forEach((c) => c.region && set.add(c.region))
    return Array.from(set)
  }, [countries])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return countries.filter((c) => {
      const matchQuery = !q || c.name.toLowerCase().includes(q)
      const matchRegion = !region || c.region === region
      return matchQuery && matchRegion
    })
  }, [countries, query, region])

  if (loading) return <p>Loading…</p>
  if (error) return <p role="alert">{error}</p>

  return (
    <div className="home">
      <div className="controls">
        <label className="search">
          <span className="visually-hidden">Search for a country</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a country…"
            aria-label="Search for a country"
          />
        </label>

        <label className="filter">
          <span className="visually-hidden">Filter by Region</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Filter by Region">
            <option value="">Filter by Region</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="grid" role="list">
        {filtered.map((c) => (
          <li key={c.alpha3Code} className="card">
            <Link to={`/country/${c.alpha3Code}`} className="card-link">
              <img className="flag" src={c.flags?.png || c.flag} alt={`Flag of ${c.name}`} loading="lazy" />
              <div className="card-body">
                <h2 className="card-title">{c.name}</h2>
                <dl className="meta">
                  <div>
                    <dt>Population:</dt>
                    <dd>{formatNumber(c.population)}</dd>
                  </div>
                  <div>
                    <dt>Region:</dt>
                    <dd>{c.region}</dd>
                  </div>
                  <div>
                    <dt>Capital:</dt>
                    <dd>{c.capital || '—'}</dd>
                  </div>
                </dl>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
