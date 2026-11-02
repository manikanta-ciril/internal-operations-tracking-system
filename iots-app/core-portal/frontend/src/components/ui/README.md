# Shared upload control

`src/components/ui/file-upload.tsx` is the shared, controlled upload surface. Task deliverables, daily report evidence and profile photos use the same component. Callers own saving and attachment state; the component owns browsing, drag feedback and validation. It does not create a nested form.

The application already uses Tailwind and local shadcn components under `src/shared/work-ui`. This conventional `src/components/ui` path makes the new control easy to find without moving or overwriting existing controls. TypeScript was added incrementally; Vite compiles TSX alongside the existing JavaScript app. Run `npm run typecheck:upload` to check this component.

Pass `files`, `onFiles`, `onRemove` and `onError`. Optional `onDownload` opens persisted evidence. `accept` is checked for dropped and selected files; `maxBytes` defaults to 25 MB. Profile photos explicitly use 2 MB. Keep storage operations in callers, not inside the UI control.
