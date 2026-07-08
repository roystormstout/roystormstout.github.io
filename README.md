# Roy Guo Portfolio

Interactive portfolio for [ultroy.com](https://ultroy.com/). The site opens on a typographic bio screen and expands into a corkboard-style project pinboard with work, research, and play sections.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- GitHub Pages deployment through `gh-pages`

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run the full local quality gate used by CI:

```bash
npm run check
```

Regenerate optimized pin artwork after replacing source PNGs:

```bash
npm run optimize:pins
```

Preview the production build locally:

```bash
npm run preview
```

Deploy the built site to GitHub Pages manually:

```bash
npm run deploy
```

Pushes to `main` also deploy automatically through GitHub Actions after `npm run check` passes. In the repository settings, GitHub Pages must use **GitHub Actions** as its source.

## Project Structure

- `src/App.tsx` controls the bio/pinboard view switch and lazy-loads the pinboard experience.
- `src/components/Bio.tsx` renders the landing bio screen.
- `src/components/Pinboard.tsx` composes the desktop pinboard from smaller board, pin, note, and hook modules.
- `src/components/PinboardMobile.tsx` renders the mobile card-stack version of the pinboard.
- `src/components/pinboard/data.ts` is the source of truth for board content and pin IDs.
- `src/components/pinboard/hooks/` contains board switching, selected pin state, drag behavior, note docking, size, mobile, and reduced-motion hooks.
- `src/assets/pins/` stores the pin artwork used by the board.
- `public/CNAME` sets the custom GitHub Pages domain.

## Editing Pinboard Content

Project content lives in `src/components/pinboard/data.ts`. Add pins inside one of the board arrays: `work`, `research`, or `play`.

Pin IDs are derived from `boardPins`, so `PatchId` updates automatically when content changes. Keep each `id` unique across the board data because drag positions, note state, and selected pins are keyed by that ID.

Each pin supports:

- `id`, `image`, `size`, `initialRotate`, `hoverRotate`, and `anchor` for visual placement.
- `title`, `year`, `subtitle`, `description`, and `bullets` for note/card content.
- Optional `link` and `linkLabel` for external project links.

## Accessibility Notes

- Hidden app views are marked inert so keyboard focus stays in the active view.
- Interactive pins render as labeled buttons and have visible focus styling.
- Motion-heavy interactions respect `prefers-reduced-motion` in CSS and in the pinboard animation hooks.
- The mobile pinboard uses a readable stacked-card layout instead of the desktop drag board.

## Performance Notes

- The pinboard views are lazy-loaded from `App.tsx`, then the active viewport variant is preloaded during idle time and on Pinboard button intent.
- Hidden board faces do not mount their pin images until they become active or participate in a board flip.
- Pin images use optimized WebP assets, async decoding, and mobile card images lazy-load.
- `npm run optimize:pins` converts source PNG artwork in `src/assets/pins/` to display-sized WebP files in `src/assets/pins/optimized/`.

## Quality Checks

Run these before deploying:

```bash
npm run lint
npm run test
npm run typecheck
npm run build
```

Or run the combined gate:

```bash
npm run check
```

The test suite currently covers pinboard layout helpers and content-data invariants, including globally unique pin IDs, complete note/card copy, and well-formed optional links.
