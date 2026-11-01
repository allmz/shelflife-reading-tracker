import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { shelfNames, useShelves } from '../context/ShelfContext.jsx';
import { fetchWork, imageFor, toPlainText } from '../services/openLibrary.js';

function BookDetails() {
  const { workId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { shelves, moveBook } = useShelves();

  // If the user arrived by clicking a card, the book came with them and
  // we can show it immediately while the full record loads.
  const passedBook = location.state?.book;

  const [book, setBook] = useState(
    passedBook || {
      id: workId,
      title: 'Loading book…',
      authors: [],
      year: '—',
      coverId: null,
      subjects: [],
    },
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [description, setDescription] = useState(passedBook?.description || '');

  useEffect(() => {
    // If the user opens another book or navigates away, the cleanup
    // aborts this request rather than letting it finish and write its
    // answer over the page they are now looking at.
    const controller = new AbortController();

    async function loadDetails() {
      setIsLoading(true);
      setError('');

      try {
        const data = await fetchWork(workId, controller.signal);

        // Open Library sends this as a string or as { value }, and it
        // often has HTML in it. toPlainText handles both.
        const text = toPlainText(data.description);

        setBook((current) => ({
          ...current,
          title: data.title || current.title,
          // Arriving by a typed or refreshed URL means no book came with
          // us in router state, so take the cover from the work record.
          coverId: current.coverId ?? data.covers?.[0] ?? null,
          subjects: data.subjects?.slice(0, 8) || current.subjects,
        }));
        setDescription(
          text ||
            passedBook?.description ||
            'This book does not have a description in Open Library yet.',
        );
      } catch (requestError) {
        // We aborted it ourselves, so there is nothing to report.
        if (requestError.name === 'AbortError') return;

        setError(requestError.message);
        // Arriving by a typed URL leaves nothing to fall back on, so the
        // placeholder title would otherwise say "Loading book…" forever.
        if (!passedBook) {
          setBook((current) => ({ ...current, title: 'Book unavailable' }));
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadDetails();

    return () => controller.abort();
  }, [workId]);

  const currentShelf = shelfNames.find((name) =>
    shelves[name].some((item) => item.id === book.id),
  );

  return (
    <section className="details-layout">
      <button className="back-link" onClick={() => navigate(location.state?.returnTo || '/')}>
        ← Back to results
      </button>

      <div className="details-card">
        <img
          className="details-cover"
          src={imageFor(book, 'L')}
          alt={`Cover of ${book.title}`}
        />

        <div className="details-copy">
          <div className="eyebrow">Book details</div>
          <h1>{book.title}</h1>
          {/* Only shown when we actually have author names. Arriving by a
              typed URL does not give us any, because the work record
              returns author keys rather than names. */}
          {book.authors?.length > 0 && (
            <p className="detail-author">{book.authors.join(', ')}</p>
          )}

          <div className="detail-meta">
            <span>{book.year}</span>
            <span>{book.subjects?.length || 0} subjects</span>
            <span>{isLoading ? 'Loading details' : 'Open Library'}</span>
          </div>

          <p className="description">
            {error
              ? passedBook
                ? `The basic book information loaded, but the full description could not be reached. ${error}`
                : error
              : description}
          </p>

          <div className="shelf-picker">
            <span>My shelf</span>
            <div>
              {shelfNames.map((name) => (
                <button
                  key={name}
                  className={currentShelf === name ? 'selected' : ''}
                  onClick={() => moveBook(book, name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="subjects-panel">
        <div className="eyebrow">Subjects</div>
        <div className="subject-list">
          {(book.subjects?.length ? book.subjects : ['No subjects listed']).map(
            (subject) => (
              <span key={subject}>{subject}</span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export default BookDetails;
