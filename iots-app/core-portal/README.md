# Authentication subsystem

This folder owns the current employee access and attendance evidence flow:

1. Location permission unlocks the login form.
2. Username or company email and password establish a pending session.
3. Server location validation and required exception confirmation precede capture.
4. Punch-in evidence activates the session and opens an assigned role workspace.
5. Logout requires fresh location validation and punch-out evidence.

Frontend and backend are separate npm packages with independent lockfiles.
Run `npm run dev` from the parent `iots-app` directory for the full stack.
The frontend package's dev command also delegates to the same orchestrator.
The backend package's dev command starts only the API for focused development.

See [application setup](../README.md) and [the file guide](../FILE_STRUCTURE.md).
