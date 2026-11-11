import { useRef, useState } from 'react'
import Background from './Background.jsx'
import MovieCard from './MovieCard.jsx'
import { searchMovies } from './omdb.js'

const NOT_FOUND_MESSAGE = 'Ничего не найдено'
const API_ERRORS = {
  'Too many results.': 'Слишком много совпадений — уточните название',
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16 16L20.5 20.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function App() {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  const isLoading = status === 'loading'

  async function fetchMovies(rawQuery) {
    const value = rawQuery.trim()

    if (!value) {
      setMovies([])
      setStatus('error')
      setError('Введите название фильма')
      return
    }

    if (isLoading) return

    const request = requestId.current + 1
    requestId.current = request

    setStatus('loading')
    setError(null)
    setMovies([])

    try {
      const data = await searchMovies(value)

      if (request !== requestId.current) return

      if (data.Error) {
        setStatus('error')
        setError(
          data.Error === 'Movie not found!'
            ? NOT_FOUND_MESSAGE
            : (API_ERRORS[data.Error] ?? data.Error),
        )
        return
      }

      setMovies(Array.isArray(data.Search) ? data.Search : [])
      setStatus('success')
    } catch (err) {
      if (request !== requestId.current) return

      setStatus('error')
      setError(err.message)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    fetchMovies(query)
  }

  return (
    <div className="page">
      <Background />

      <main className="content">
        <h1 className="prompt">Введите название фильма:</h1>

        <form className="search" onSubmit={handleSubmit}>
          <input
            className="search__input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Название фильма"
            autoFocus
          />
          <button
            className="search__button"
            type="submit"
            disabled={isLoading}
            aria-label="Найти"
          >
            {isLoading ? <span className="spinner" aria-hidden="true" /> : <SearchIcon />}
          </button>
        </form>

        <section className="results">
          {status === 'error' && <p className="status">{error}</p>}

          {status === 'success' && movies.length === 0 && (
            <p className="status">{NOT_FOUND_MESSAGE}</p>
          )}

          {status === 'success' && movies.length > 0 && (
            <div className="movie-list">
              {movies.map((movie) => (
                <MovieCard key={movie.imdbID} movie={movie} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
