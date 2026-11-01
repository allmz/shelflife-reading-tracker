// The three shelves are needed by almost every page, so they live in
// Context instead of being passed down through props.

import { createContext, useContext, useEffect, useState } from 'react';

export const shelfNames = ['Want to Read', 'Reading', 'Finished'];

const STORAGE_KEY = 'shelflife-shelves-v2';
const ShelfContext = createContext(null);

function emptyShelves() {
  return { 'Want to Read': [], Reading: [], Finished: [] };
}

function readShelves() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === 'object' ? saved : emptyShelves();
  } catch {
    return emptyShelves();
  }
}

export function ShelfProvider({ children }) {
  const [shelves, setShelves] = useState(readShelves);

  // Save to localStorage whenever the shelves change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shelves));
  }, [shelves]);

  // A book belongs to one shelf at a time: remove it from all three,
  // then add it to the destination.
  function moveBook(book, destination) {
    setShelves((current) => {
      // Start from a copy, then take the book off every shelf. filter
      // builds a new array without it rather than changing the old one,
      // which is what lets React see that something has changed.
      const next = { ...current };

      for (const name of shelfNames) {
        next[name] = current[name].filter((item) => item.id !== book.id);
      }

      // Then put it on the shelf the user picked. The spread makes a new
      // array; push would change the same one and React would not notice.
      next[destination] = [...next[destination], book];

      return next;
    });
  }

  // Every saved book, from all three shelves, in one array. Calculated
  // on each render rather than stored, so it can never fall out of step
  // with the shelves it came from.
  const allBooks = [
    ...shelves['Want to Read'],
    ...shelves.Reading,
    ...shelves.Finished,
  ];

  return (
    <ShelfContext.Provider value={{ shelves, allBooks, moveBook }}>
      {children}
    </ShelfContext.Provider>
  );
}

export function useShelves() {
  return useContext(ShelfContext);
}
