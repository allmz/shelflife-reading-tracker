import { createContext, useContext, useLayoutEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'shelflife-theme';

// A choice the reader made wins. Before they make one, follow the
// system setting. index.html runs the same check before React loads, so
// a dark page does not flash light on reload.
function readTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Storage blocked: fall through to the system setting.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', theme === 'dark' ? '#161c20' : '#f8f5ef',
    );
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // The toggle still works if the browser blocks localStorage.
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => current === 'light' ? 'dark' : 'light');
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
