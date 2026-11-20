# AI reflection

Team 5, ShelfLife. Written for Phase 5.

We used AI assistants throughout the project. This is a record of what we asked
for, what we kept, and what we threw away. The short version is that almost
everything we rejected looked correct when we read it, and only failed when we
ran it.

## How we used it

Mostly for three things. Getting a first version of something we had not written
before, like the `AbortController` cleanup or the Context provider. Explaining an
API we were unsure about, usually Open Library's response shape. And reviewing
work that was already written, which is where it was most useful, because it
caught things we had stopped seeing.

We did not let it merge anything. Every change went through a pull request that
somebody other than the author read first, which is also how two of the problems
below were found.

## The prompt log

**Phase 2.** Asked for a component structure for a React app with a search page,
a details page and saved shelves, and for a Context provider that holds a list
and lets a book move between three shelves.

**Phase 3.** Asked how to stop an older search response overwriting a newer one,
and for the fetch wrapper that goes with it. Asked what a loading state should
do when a request is cancelled rather than finished. Asked for the Open Library
search and work endpoints and what their responses contain.

**Phase 4.** Asked for a controlled form in React with per field validation and
messages that clear when the field is fixed. Asked for a light and dark theme
held in Context and saved between visits. Asked for a review of the whole app
for anything inconsistent before we submitted.

**Throughout.** Asked it to review diffs before we merged them, and to explain
parts of our own code back to us so we could check we actually understood them.

## What we accepted

**`AbortController` on every search.** Each request gets a controller, and the
effect's cleanup aborts it when a new search starts. We accepted this because we
could test it. Four searches fired 120 milliseconds apart gave three cancelled
requests and one completed, and the results left on screen were for the last word
typed.

**Checking `response.ok` before using a response.** We did not know that `fetch`
treats a 503 as a resolved promise. Once we did, the check was obviously right,
and it is the reason our 503 test shows a message rather than a blank page.

**Context read through a custom hook.** `useShelves()` and `useTheme()` rather
than `useContext` at every call site. It also gave us somewhere to throw a clear
error if a component is used outside its provider, which saved us time twice.

**CSS variables for the palette.** Moving every colour onto `:root` and
overriding them under `[data-theme='dark']` meant the dark theme was one block of
variables instead of edits scattered through the stylesheet.

**A small script in `index.html` that sets the theme before React loads.**
Without it the page flashed light for a moment on every reload in dark mode. We
would not have thought of this.

## What we rejected or corrected

**A search that could not be retried.** The handler drove the search off the URL,
which is a good decision and the reason our links and back button work. But when
you searched the same word twice the query string did not change, so nothing told
the app to run the search again. After a failed search, pressing Search on the
same word did nothing at all and the error just sat there. We only found it
because we counted the network requests in DevTools while clicking instead of
reading the handler and assuming. It sent zero. The fix was six lines, but the
code had looked completely reasonable.

**`"latest"` as the version for every dependency.** The starting `package.json`
pinned nothing. That builds fine today and may not build at all next month,
because whoever installs it gets whatever React and Vite happen to be current.
We pinned all five and moved the build tools into `devDependencies` where they
belong. This one matters for the person marking it, who installs from scratch.

**An author rule that rejected real names.** A suggested regular expression
allowed letters and what it called normal name punctuation. It blocked
`Hunt, Andrew` and `Alex Banks & Eve Porcello`. Both are ordinary ways to write
an author, and Open Library returns the comma form itself, so the rule would have
rejected data from the very API we are reading. We widened it to allow commas and
ampersands and rewrote the message to name what is allowed, because
"normal name punctuation" does not tell you a comma was the problem.

**A details page that fetched books that do not exist.** Once books could be
added by hand, their ids were ours rather than Open Library's. Opening one still
fired a request to Open Library, which was always going to fail. Nothing in the
code looked wrong. It only showed up when somebody added a book and then clicked
it. Manual books now skip the fetch entirely.

**A remote image for books with no cover.** The placeholder pointed at an
external service. That is a third party request on every coverless card, and our
app would look broken if that service was ever down, for a picture that says
"no cover". We replaced it with an SVG in `public/`.

**Our own screenshots, twice.** After we changed an error message, the evidence
committed in `docs/` still showed the old wording, so it described a version of
the app nobody could run. We retook them. This was not the AI's fault, but it is
the same failure: we trusted something that had been correct earlier without
checking it was still correct.

## What we would do differently

Read less, run more. Every single thing in the list above read as correct. The
retry bug, the author rule and the manual book fetch all survived review by more
than one of us, and all three were found by using the app rather than looking at
it.

We would also ask for smaller pieces. The answers we had to unpick most were the
ones where we asked for a whole feature at once, because a plausible looking
fifty lines is much harder to check than a plausible looking five.
