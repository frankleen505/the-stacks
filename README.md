# The Stacks

A card-catalog themed storefront for movies, manga, books and comics, with a
role-gated back office (Circulation Desk + Head Librarian's Office).

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## Demo staff logins

| Username  | Password    | Role    |
|-----------|-------------|---------|
| admin     | admin123    | admin   |
| manager1  | manager123  | manager |
| staff1    | staff123    | staff   |

## Project structure

```
src/
  api/          ProductAPI + StaffAPI — localStorage-backed "backend"
  data/         category config + external seed-fetching (iTunes/Google Books/Jikan)
  utils/        small pure helpers (pricing, ratings, placeholder covers)
  components/   all UI pieces
  App.jsx       routing + top-level state
  index.css     the design system (tokens, layout, components)
```

## Notes

- "Database" = the browser's `localStorage` (see `src/api/`).
- On first run, the catalog is seeded from free public APIs (iTunes Search,
  Google Books, Jikan). If those are unreachable, a small offline fallback
  catalog is used instead so the app is never empty.
