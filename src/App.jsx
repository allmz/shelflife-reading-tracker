import { Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import { ShelfProvider } from './context/ShelfContext.jsx';
import AddBook from './pages/AddBook.jsx';
import BookDetails from './pages/BookDetails.jsx';
import Home from './pages/Home.jsx';
import Shelves from './pages/Shelves.jsx';
import Stats from './pages/Stats.jsx';

// App holds the shared layout: the header and footer sit outside
// <Routes>, so they stay on screen while only the page swaps.
function App() {
  return (
    <ShelfProvider>
      <div className="app-shell">
        <Header />

        <main className="page-wrap">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddBook />} />
            <Route path="/shelves" element={<Shelves />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/book/:workId" element={<BookDetails />} />
          </Routes>
        </main>

        <footer className="footer">
          ShelfLife · built with React and Open Library
        </footer>
      </div>
    </ShelfProvider>
  );
}

export default App;
