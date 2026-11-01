import { Link, useLocation } from 'react-router-dom';
import { shelfNames, useShelves } from '../context/ShelfContext.jsx';
import { imageFor } from '../services/openLibrary.js';

// Reused with different props on both the Discover page and the
// Shelves page.
function BookCard({ book }) {
  const { shelves, moveBook } = useShelves();

  // Which shelf is this book on, if any?
  const shelf = shelfNames.find((name) =>
    shelves[name].some((item) => item.id === book.id),
  );

  const location = useLocation();
  const returnTo = location.pathname + location.search;

  return (
    <article className="book-card">
      <Link to={`/book/${book.id}`} state={{ book, returnTo }} className="cover-link">
        <img
          className="book-cover"
          src={imageFor(book)}
          alt={`Cover of ${book.title}`}
        />
      </Link>

      <div className="book-card-body">
        <div className="book-year">{book.year}</div>

        <Link to={`/book/${book.id}`} state={{ book, returnTo }}>
          <h3>{book.title}</h3>
        </Link>

        <p className="book-author">{book.authors.join(', ')}</p>

        <div className="card-actions">
          <select
            value={shelf || ''}
            onChange={(event) =>
              event.target.value && moveBook(book, event.target.value)
            }
            aria-label={`Shelf for ${book.title}`}
          >
            <option value="">Add to shelf</option>
            {shelfNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          {shelf && <span className="saved-label">Saved</span>}
        </div>
      </div>
    </article>
  );
}

export default BookCard;
