import { useMemo, useRef, useState } from 'react';
import { shelfNames, useShelves } from '../context/ShelfContext.jsx';
import StateMessage from '../components/StateMessage.jsx';

// Open Library does not have everything, so this is the way to put a book
// on a shelf by hand. Every input is held in React state and submitting is
// handled here, so the page never reloads.

const THIS_YEAR = new Date().getFullYear();
// Printing with movable type starts around here. Anything earlier is a typo
// rather than a real publication year.
const EARLIEST_YEAR = 1450;

const FIELD_ORDER = ['title', 'author', 'year', 'shelf'];
const EMPTY = { title: '', author: '', year: '', shelf: '' };

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// A book added by hand gets an id built from its own title and year, so
// adding the same book twice produces the same id and can be spotted.
function idFor(title, year) {
  return `manual-${slug(title)}-${year}`;
}

// One set of rules, used both to decide what to show the reader and to
// decide whether the book is allowed to be saved. Each message names its
// field and says what to do about it.
function validate(values, allBooks) {
  const errors = {};

  const title = values.title.trim();
  if (!title) {
    errors.title = 'Enter the title of the book.';
  } else if (title.length < 2) {
    errors.title = 'The title needs at least two characters.';
  } else if (title.length > 120) {
    errors.title = 'Keep the title under 120 characters.';
  }

  const author = values.author.trim();
  if (!author) {
    errors.author = 'Enter the author. Put Unknown if you are not sure.';
  } else if (!/^[a-zA-Z\s.'-]+$/.test(author)) {
    errors.author = 'Use letters only for the author name.';} 
    else if (author.length > 80) {
    errors.author = 'Keep the author under 80 characters.';
  }

  const year = values.year.trim();
  if (!year) {
    errors.year = 'Enter the year it was published.';
  } else if (!/^\d+$/.test(year)) {
    errors.year = 'Use digits only, for example 1999.';
  } else if (Number(year) < EARLIEST_YEAR || Number(year) > THIS_YEAR) {
    errors.year = `Use a year between ${EARLIEST_YEAR} and ${THIS_YEAR}.`;
  }

  if (!values.shelf) {
    errors.shelf = 'Pick the shelf this book belongs on.';
  } else if (!shelfNames.includes(values.shelf)) {
    errors.shelf = 'Pick one of the three shelves.';
  }

  // Only worth checking for a duplicate once the title and year are
  // themselves valid, otherwise the id we build is meaningless.
  if (!errors.title && !errors.year) {
    const id = idFor(title, year);
    if (allBooks.some((book) => book.id === id)) {
      errors.title = 'That book is already saved on one of your shelves.';
    }
  }

  return errors;
}

function AddBook() {
  const { allBooks, moveBook } = useShelves();

  const [values, setValues] = useState(EMPTY);
  // Which fields the reader has finished with, so a message does not
  // appear while they are still typing the first word.
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saved, setSaved] = useState(null);

  const refs = {
    title: useRef(null),
    author: useRef(null),
    year: useRef(null),
    shelf: useRef(null),
  };

  // Worked out from the current values on every render. That is what makes
  // a message disappear the moment its field is fixed, without anything
  // having to clear it by hand.
  const errors = useMemo(() => validate(values, allBooks), [values, allBooks]);
  const isValid = Object.keys(errors).length === 0;

  const showError = (field) =>
    Boolean(errors[field]) && (touched[field] || submitAttempted);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    // The confirmation belongs to the book that was just saved, not to the
    // one being typed now.
    setSaved(null);
  }

  function markTouched(field) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitAttempted(true);

    // Nothing is saved while anything is invalid. The reader gets every
    // message at once and the cursor goes to the first thing to fix.
    if (!isValid) {
      const firstBad = FIELD_ORDER.find((field) => errors[field]);
      refs[firstBad]?.current?.focus();
      return;
    }

    const title = values.title.trim();
    const year = values.year.trim();

    moveBook(
      {
        id: idFor(title, year),
        title,
        authors: [values.author.trim()],
        year: Number(year),
        coverId: null,
        subjects: [],
        description: 'Added by hand, so Open Library has no description for this one.',
      },
      values.shelf,
    );

    setSaved({ title, shelf: values.shelf });
    setValues(EMPTY);
    setTouched({});
    setSubmitAttempted(false);
    refs.title.current?.focus();
  }

  function field(name, label, hint, input) {
    const invalid = showError(name);
    return (
      <div className={`field${invalid ? ' field-invalid' : ''}`}>
        <label htmlFor={name}>
          {label}
          {hint && <span className="field-hint">{hint}</span>}
        </label>
        {input(invalid)}
        {/* Sits directly under its own field, so there is never any doubt
            about which input the message belongs to. */}
        {invalid && (
          <p className="field-error" id={`${name}-error`} role="alert">
            {errors[name]}
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="content-section">
      <div className="page-intro">
        <div className="eyebrow">Not everything is in Open Library</div>
        <h1>Add a book</h1>
        <p>
          Put a book on one of your shelves by hand. It behaves exactly like a
          book you found by searching, so it shows up in your shelves and in
          your stats.
        </p>
      </div>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {field('title', 'Title', null, (invalid) => (
          <input
            id="title"
            ref={refs.title}
            type="text"
            value={values.title}
            onChange={(event) => update('title', event.target.value)}
            onBlur={() => markTouched('title')}
            aria-invalid={invalid}
            aria-describedby={invalid ? 'title-error' : undefined}
            placeholder="The Pragmatic Programmer"
          />
        ))}

        {field('author', 'Author', null, (invalid) => (
          <input
            id="author"
            ref={refs.author}
            type="text"
            value={values.author}
            onChange={(event) => update('author', event.target.value)}
            onBlur={() => markTouched('author')}
            aria-invalid={invalid}
            aria-describedby={invalid ? 'author-error' : undefined}
            placeholder="Andrew Hunt"
          />
        ))}

        {field('year', 'Year published', `${EARLIEST_YEAR} to ${THIS_YEAR}`, (invalid) => (
          <input
            id="year"
            ref={refs.year}
            type="text"
            inputMode="numeric"
            value={values.year}
            onChange={(event) => update('year', event.target.value)}
            onBlur={() => markTouched('year')}
            aria-invalid={invalid}
            aria-describedby={invalid ? 'year-error' : undefined}
            placeholder="1999"
          />
        ))}

        {field('shelf', 'Shelf', null, (invalid) => (
          <select
            id="shelf"
            ref={refs.shelf}
            value={values.shelf}
            onChange={(event) => update('shelf', event.target.value)}
            onBlur={() => markTouched('shelf')}
            aria-invalid={invalid}
            aria-describedby={invalid ? 'shelf-error' : undefined}
          >
            <option value="">Choose a shelf</option>
            {shelfNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        ))}

        <div className="form-actions">
          <button className="primary-button" type="submit">Add to shelf</button>
          <span className="form-note">
            {submitAttempted && !isValid
              ? 'Fix the fields marked above and try again.'
              : 'Nothing is saved until every field is filled in correctly.'}
          </span>
        </div>
      </form>

      {saved && (
        <StateMessage
          title={`${saved.title} is on your ${saved.shelf} shelf`}
          text="Open My shelves to see it, or add another one below."
        />
      )}
    </section>
  );
}

export default AddBook;
