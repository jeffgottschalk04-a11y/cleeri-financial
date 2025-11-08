# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Supabase persistence (assumptions)

This project can persist the in-app `assumptions` JSON to a Supabase Postgres table. The repository includes a migration at `db/migrations/001_create_assumptions.sql` that creates a single-row JSON storage table named `public.assumptions` (id text primary key, data jsonb).

Quick steps to enable persistence:

1. Create a local `.env` by copying `.env.example` and filling in your Supabase URL and anon key. Do NOT commit the `.env` file.

  cp .env.example .env
  # edit .env and paste your values

2. Run the migration in your Supabase project:

  - Open your Supabase project → SQL Editor → paste the contents of `db/migrations/001_create_assumptions.sql` and Run.
  - Or use the supabase CLI / psql with your DB connection string.

3. (Optional) Add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` variables to your Vercel Project Settings → Environment Variables (Preview/Production) so the deployed site can read and write the DB.

4. Start the app locally (with the filled `.env`) and verify the header shows "Saving…" when you edit assumptions, then "Saved" after a second.

If you prefer an explicit migration tool (Flyway, sqitch, or supabase migrations), adapt the SQL file accordingly — the repository migration is intentionally small and runnable in the Supabase SQL editor.

