---
name: frontend
description: Context and conventions for working on the jam-sessions React frontend. Use when building components, pages, adding state, or working with routing.
---

## Stack

- **React 19** + TypeScript ~5.9, strict mode
- **Vite 8** — dev server runs from `frontend/`, base path is `/jam-sessions/` in production
- **Tailwind CSS v4** — imported via `@import "tailwindcss"` in `App.css`, no `tailwind.config.js`. Use utility classes directly. Theme customization goes in CSS with `@theme`.
- **Redux Toolkit** — global state only. Slices live in `src/store/slices/`, store in `src/store/store.ts`.


## Key Conventions

- All commands run from `frontend/`: `npm run dev`, `npm run build`, `npm run lint`
- Dark theme base: `background-color: #18181B` on body
- Font stack: Inter → Segoe UI → Roboto → system sans-serif
- Explicit types on all state: `useState<Type>()`
- `const` everywhere — `let` only when reassignment is unavoidable
- No inline comments in JSX or component logic
- No `any` types
- Component-specific interfaces/types defined at the top of the file

## Tailwind v4 Notes

v4 differs from v3:
- No config file — configure via CSS `@theme { }` blocks in `App.css`
- Import is `@import "tailwindcss"` not `@tailwind base/components/utilities`
- Integrated as a Vite plugin (`@tailwindcss/vite`), not PostCSS
- Dynamic classes still need to be complete strings (no string concatenation)

