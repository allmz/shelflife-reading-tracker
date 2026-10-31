// Everything that talks to the Open Library API lives here, so the
// components never build a URL or touch fetch() themselves.

const API_BASE = 'https://openlibrary.org';

// Open Library descriptions are wiki text. Some are plain, some arrive
// with HTML in them, and some come as { value: "..." } instead of a
// string. React escapes strings, so the markup was showing on screen as
// literal <p> and <em> tags.
//
// We strip the tags rather than rendering them. Anyone can edit an Open
// Library record, so treating that text as HTML would mean injecting a
// stranger's markup into our page.
export function toPlainText(value) {
  const raw = typeof value === 'string' ? value : value?.value;
  if (!raw) return '';

  return raw
    // turn the tags that mean "new line" into one
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h\d|li|dd|dt|tr)>/gi, '\n')
    // drop every other tag
    .replace(/<[^>]*>/g, '')
    // the handful of entities Open Library actually uses
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&')
    // tidy up what the stripping left behind
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Open Library returns a search result in one shape and a work record in
// another, so we flatten a search result into the shape our components use.
export function normalizeBook(book) {
  return {
    id: book.key?.replace('/works/', '') || book.id,
    title: book.title || 'Untitled book',
    authors: book.author_name || ['Unknown author'],
    year: book.first_publish_year || '—',
    coverId: book.cover_i || null,
    subjects: book.subject?.slice(0, 5) || [],
    description: toPlainText(book.first_sentence?.[0])
      || 'Description available on the book details page.',
  };
}

export function imageFor(book, size = 'M') {
  return book.coverId
    ? `https://covers.openlibrary.org/b/id/${book.coverId}-${size}.jpg`
    : 'https://placehold.co/240x360/eadfcf/4d4037?text=No+cover';
}

// signal comes from an AbortController in the caller's effect, so a
// request can be called off when the user searches again or leaves.
export async function searchBooks(field, query, signal) {
  const response = await fetch(
    `${API_BASE}/search.json?${field}=${encodeURIComponent(query)}&limit=12`,
    { signal },
  );
  if (!response.ok) throw new Error('The Open Library request failed.');
  const data = await response.json();
  return data.docs.map(normalizeBook);
}

export async function fetchWork(workId, signal) {
  const response = await fetch(`${API_BASE}/works/${workId}.json`, { signal });
  if (!response.ok) throw new Error('Book details are not available right now.');
  return response.json();
}
