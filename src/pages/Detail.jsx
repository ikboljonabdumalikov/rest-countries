import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

const DATA_URL = '/data.json'

function findByCode(data, code) {
  return data.find((c) => c.alpha3Code === code)
}

export default function Detail() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const country = useMemo(() => findByCode(countries, code), [countries, code])

  if (loading) return <p>Loading…</p>
  if (error) return <p role="alert">{error}</p>
  if (!country) return <p>Country not found.</p>

  const currencies = (country.currencies || []).map((c) => c.name).filter(Boolean).join(', ')
  const languages = (country.languages || []).map((l) => l.name).filter(Boolean).join(', ')

  return (
    <div className="detail">
      <button className="back" onClick={() => navigate(-1)}><span>&larr;</span> Back</button>

      <div className="detail-layout">
        <img className="detail-flag" src={country.flags?.svg || country.flag} alt={`Flag of ${country.name}`} />

        <div className="detail-body">
          <h1>{country.name}</h1>
          <div className="detail-columns">
            <dl>
              <div><dt>Native Name:</dt><dd>{country.nativeName}</dd></div>
              <div><dt>Population:</dt><dd>{new Intl.NumberFormat().format(country.population)}</dd></div>
              <div><dt>Region:</dt><dd>{country.region}</dd></div>
              <div><dt>Sub Region:</dt><dd>{country.subregion}</dd></div>
              <div><dt>Capital:</dt><dd>{country.capital || '—'}</dd></div>
            </dl>
            <dl>
              <div><dt>Top Level Domain:</dt><dd>{(country.topLevelDomain || []).join(', ')}</dd></div>
              <div><dt>Currencies:</dt><dd>{currencies || '—'}</dd></div>
              <div><dt>Languages:</dt><dd>{languages || '—'}</dd></div>
            </dl>
          </div>

          {Array.isArray(country.borders) && country.borders.length > 0 && (
            <div className="borders">
              <strong>Border Countries:</strong>
              <div className="tags">
                {country.borders.map((b) => {
                  const bc = findByCode(countries, b)
                  return (
                    <Link key={b} to={`/country/${b}`} className="tag">
                      {bc?.name || b}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
