import { useEffect, useState } from 'react';
import BookGrid from '../components/BookGrid.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { searchBooks } from '../services/openLibrary.js';

function Home() {
  const [query, setQuery] = useState('javascript');
  const [field, setField] = useState('title');

  // What we last actually searched for, as opposed to what is typed in
  // the box. Submitting sets this, and the effect below watches it.
  const [search, setSearch] = useState({ field: 'title', query: 'javascript' });

  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setStatus('error');
      setError('Please enter a title, author, or subject to search.');
      return;
    }

    setSearch({ field, query: cleanQuery });
  }

  // The search itself lives in an effect so it can be cancelled. Every
  // time `search` changes, React runs the cleanup from the previous one
  // first, which aborts a request that is still in flight. Without this,
  // responses can come back out of order and an older search can
  // overwrite a newer one on screen.
  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      setIsLoading(true);
      setError('');
      try {
        setBooks(await searchBooks(search.field, search.query, controller.signal));
        setStatus('success');
      } catch (requestError) {
        // We aborted this one ourselves, so it is not a failure and the
        // newer request is already on its way. Say nothing.
        if (requestError.name === 'AbortError') return;

        setStatus('error');
        setError(requestError.message || 'Something went wrong while loading books.');
      } finally {
        // An aborted request leaves loading on, because the newer request
        // that replaced it is still running.
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    run();

    return () => controller.abort();
  }, [search]);

  const showResults = !isLoading && status === 'success';

  return (
    <>
      <section className="hero">
        <div className="eyebrow">A calmer way to choose your next book</div>
        <h1>Find a book.<br /><em>Keep the story going.</em></h1>
        <p className="hero-copy">
          Search millions of books, save the ones that interest you, and keep
          your reading life in one simple place.
        </p>

        <form className="search-bar" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="search">Search Open Library</label>
          <span className="search-icon">⌕</span>
          <input
            id="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, author, or subject"
          />
          <select
            value={field}
            onChange={(event) => setField(event.target.value)}
            aria-label="Search field"
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="subject">Subject</option>
          </select>
          <button className="primary-button" type="submit">Search</button>
        </form>
      </section>

      <section className="section-heading">
        <div>
          <div className="eyebrow">Open Library results</div>
          {/* search.query, not query: the heading should name what is
              actually on screen, not what is half typed in the box. */}
          <h2>
            {isLoading
              ? 'Searching…'
              : showResults
                ? `Books about ${search.query}`
                : 'Start exploring'}
          </h2>
        </div>
        {showResults && <span className="result-count">{books.length} results</span>}
      </section>

      {isLoading && (
        <StateMessage
          title="Looking through the shelves…"
          text="We are getting the latest results from Open Library."
        />
      )}

      {!isLoading && status === 'error' && (
        <StateMessage
          title="We could not load those books"
          text={error}
          tone="error"
        />
      )}

      {showResults && books.length === 0 && (
        <StateMessage
          title="No books found"
          text="Try a wider title, author, or subject search."
        />
      )}

      {showResults && books.length > 0 && <BookGrid books={books} />}
    </>
  );
}

export default Home;
