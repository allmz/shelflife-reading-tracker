import { useState } from 'react';
import { Link } from 'react-router-dom';
import BookGrid from '../components/BookGrid.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { shelfNames, useShelves } from '../context/ShelfContext.jsx';

function Shelves() {
  const { shelves } = useShelves();
  const [activeShelf, setActiveShelf] = useState('Want to Read');

  const books = shelves[activeShelf];

  return (
    <section className="content-section">
      <div className="page-intro">
        <div className="eyebrow">Your reading space</div>
        <h1>My shelves</h1>
        <p>
          Keep track of books you want to read, books you started, and stories
          you finished.
        </p>
      </div>

      <div className="shelf-tabs" role="tablist">
        {shelfNames.map((name) => (
          <button
            key={name}
            role="tab"
            aria-selected={activeShelf === name}
            className={activeShelf === name ? 'active' : ''}
            onClick={() => setActiveShelf(name)}
          >
            {name}
            <span>{shelves[name].length}</span>
          </button>
        ))}
      </div>

      {books.length === 0 ? (
        <StateMessage
          title={`Nothing on ${activeShelf} yet`}
          text={
            <>
              <Link className="inline-link" to="/">Search Open Library</Link> or{' '}
              <Link className="inline-link" to="/add">add a book by hand</Link> to fill
              this shelf.
            </>
          }
        />
      ) : (
        <BookGrid books={books} />
      )}
    </section>
  );
}

export default Shelves;
