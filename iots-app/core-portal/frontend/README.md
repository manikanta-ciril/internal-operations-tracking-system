# Authentication frontend

React and Vite provide login, permission gates, photo capture, role workspaces
and punch-out. Existing colors and normal animations are retained.

Run `npm run dev` here or from `iots-app` to start the complete stack.
`npm run dev:frontend` starts only Vite and expects an API on port 3001.
Use `npm run build` and `npm run lint` for local checks.

`src/main.jsx` mounts `src/app/App.jsx`. Authentication flows live in
`src/features/auth`; role landing pages live in `src/features/workspace`.
`src/features/creative-associate` is a separate dashboard prototype served by
`creative-associate.html`. Reusable UI and theme logic live in `src/shared`.
Assets and styles belong to this package.

The Vite API proxy preserves session cookies and the trusted proxy header.
Do not import backend source into browser components. The proxy-secret import
in `vite.config.js` runs in Node only.

See [the file guide](../../FILE_STRUCTURE.md) and
[backend setup](../backend/AUTH_SETUP.md) for local credentials.
