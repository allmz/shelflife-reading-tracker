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
  const [status, setStatus] = useState('loading');
  const [description, setDescription] = useState(passedBook?.description || '');

  useEffect(() => {
    // If the user navigates away mid-request, do not set state afterwards.
    let cancelled = false;

    async function loadDetails() {
      try {
        const data = await fetchWork(workId);
        if (cancelled) return;

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
        setStatus('success');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [workId]);

  const currentShelf = shelfNames.find((name) =>
    shelves[name].some((item) => item.id === book.id),
  );

  return (
    <section className="details-layout">
      <button className="back-link" onClick={() => navigate(-1)}>
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
            <span>{status === 'success' ? 'Open Library' : 'Loading details'}</span>
          </div>

          <p className="description">
            {status === 'error'
              ? 'The basic book information loaded, but the full description could not be reached.'
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
