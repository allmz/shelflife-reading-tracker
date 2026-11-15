import StateMessage from '../components/StateMessage.jsx';
import { shelfNames, useShelves } from '../context/ShelfContext.jsx';

function Stats() {
  const { shelves, allBooks } = useShelves();

  // Count the saved books by the decade they were published in.
  const decades = allBooks.reduce((result, book) => {
    const year = Number(book.year);
    if (!Number.isFinite(year)) return result;

    const decade = `${Math.floor(year / 10) * 10}s`;
    result[decade] = (result[decade] || 0) + 1;
    return result;
  }, {});

  // The busiest decade sets the width of the longest bar.
  const maxDecade = Math.max(...Object.values(decades), 1);

  return (
    <section className="content-section">
      <div className="page-intro">
        <div className="eyebrow">A small look at your reading</div>
        <h1>Reading stats</h1>
        <p>These numbers are based on the books currently saved in your shelves.</p>
      </div>

      <div className="stat-cards">
        {shelfNames.map((name) => (
          <div className="stat-card" key={name}>
            <span>{name}</span>
            <strong>{shelves[name].length}</strong>
            <small>{shelves[name].length === 1 ? 'book' : 'books'}</small>
          </div>
        ))}
      </div>

      <div className="chart-panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Publication years</div>
            <h2>Books by decade</h2>
          </div>
          <span className="muted">
            {allBooks.length} {allBooks.length === 1 ? 'book' : 'books'} in total
          </span>
        </div>

        {Object.keys(decades).length === 0 ? (
          <StateMessage
            title="No dates to show yet"
            text="Add a few books to see a simple decade breakdown."
          />
        ) : (
          <div className="bar-chart">
            {Object.entries(decades).sort().map(([decade, count]) => (
              <div className="bar-row" key={decade}>
                <span>{decade}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(count / maxDecade) * 100}%` }}
                  />
                </div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Stats;
