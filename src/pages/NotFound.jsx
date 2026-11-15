import { Link } from 'react-router-dom';

// Shown for any URL that matches no route, so a typo or an old link still
// lands on a page with a way back instead of an empty screen.
function NotFound() {
  return (
    <section className="content-section">
      <div className="page-intro">
        <div className="eyebrow">Page not found</div>
        <h1>This shelf is bare</h1>
        <p>
          There is no page at this address. It may have moved, or the link
          may have a typo in it.
        </p>
      </div>

      <div className="not-found-actions">
        <Link className="primary-button" to="/">Back to Discover</Link>
        <Link className="secondary-button" to="/shelves">Open My shelves</Link>
      </div>
    </section>
  );
}

export default NotFound;
