import { useEffect, useRef, useState } from 'react';
import BookGrid from '../components/BookGrid.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { searchBooks } from '../services/openLibrary.js';

function Home() {
  const [query, setQuery] = useState('javascript');
  const [field, setField] = useState('title');

  const [search, setSearch] = useState({ field: 'title', query: 'javascript' });

  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState('');

  const loadMoreController = useRef(null);

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

  useEffect(() => {
    const controller = new AbortController();

    // Cancel any previous Load More request when a new search starts.
    loadMoreController.current?.abort();
    setLoadingMore(false);
    setLoadMoreError('');

    async function run() {
      setIsLoading(true);
      setError('');
      setBooks([]);
      setTotal(0);

      try {
        const result = await searchBooks(
          search.field,
          search.query,
          controller.signal
        );

        setBooks(result.books);
        setTotal(result.total);
        setStatus('success');
      } catch (requestError) {
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

    return () => {
      controller.abort();
      loadMoreController.current?.abort();
    };
  }, [search]);

  const showResults = !isLoading && status === 'success';

  async function loadMoreBooks() {
    if (loadingMore || books.length >= total) return;

    const controller = new AbortController();
    loadMoreController.current = controller;

    setLoadingMore(true);
    setLoadMoreError('');

    try {
      const result = await searchBooks(
        search.field,
        search.query,
        controller.signal,
        books.length
      );

      setBooks(currentBooks => [...currentBooks, ...result.books]);
      setTotal(result.total);
    } catch (requestError) {
      if (requestError.name === 'AbortError') return;

      setLoadMoreError(
        requestError.message || 'Could not load more books. Please try again.'
      );
    } finally {
      if (!controller.signal.aborted) {
        setLoadingMore(false);
        loadMoreController.current = null;
      }
    }
  }

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
          <h2>
            {isLoading
              ? 'Searching…'
              : showResults
                ? `Books about ${search.query}`
                : 'Start exploring'}
          </h2>
        </div>

        {showResults && (
          <span className="result-count">
            {books.length} of {total} results
          </span>
        )}
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

      {showResults && books.length > 0 && (
      <>
        <BookGrid books={books} />

        {loadMoreError && (
          <StateMessage
            title="Could not load more books"
            text={loadMoreError}
            tone="error"
          />
        )}

        {books.length < total && (
          <div className="load-more-container">
            <button
              className="primary-button"
              type="button"
              onClick={loadMoreBooks}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading…' : 'Load More Books'}
            </button>
          </div>
        )}
      </>
      )}
    </>
  );
}

export default Home;