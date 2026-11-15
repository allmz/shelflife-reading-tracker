import { Link, NavLink } from 'react-router-dom';
import { useShelves } from '../context/ShelfContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

// Rendered once in App, so it appears on every page.
function Header() {
  const { allBooks } = useShelves();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        <img src="/logo.svg" alt="ShelfLife" className="brand-mark" />
        <span>ShelfLife</span>
      </Link>

      <nav className="nav-links" aria-label="Main navigation">
        <NavLink to="/" end>Discover</NavLink>
        <NavLink to="/add">Add a book</NavLink>
        <NavLink to="/shelves">My shelves</NavLink>
        <NavLink to="/stats">Stats</NavLink>
      </nav>

      <div className="header-actions">
        <span className="reading-pill">{allBooks.length} saved</span>
        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
      </div>
    </header>
  );
}

export default Header;
