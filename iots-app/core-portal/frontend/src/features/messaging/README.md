# Team messaging

`ChatWidget` mounts once inside the authenticated employee workspace for every role. It floats above the page and inherits the existing font, light/dark palette and account context. No preview iframe or second authentication system is used.

- Everyone can start direct conversations and participate in groups they belong to.
- Chairman, General Manager, Senior Manager, Executive and Super Admin can create groups in that active role. Lead/Operations Manager, Coordinator, BDE, IT Analyst, Graphic Designer and Admin cannot create groups.
- Channels remain a visible filter. Channel creation is intentionally disabled until the later team-management phase.
- The composer’s + menu includes images, documents, polls and shared checklists. Images can also be pasted directly into the message box. An emoji picker is available beside the composer.
- Members can vote in polls, tick checklist items, reply to specific messages and jump back to the original message. Message content stays immutable: editing and deleting sent messages are intentionally absent. Voice recording remains absent.

## Boundaries

`useMessaging` manages the authenticated Socket.IO connection, history refresh, unread acknowledgements and retry IDs. The window is composed from `WidgetHeader`, `ConversationList`, `MessageThread` and `MessageComposer`. Rich cards, image previews and creation dialogs have separate components. HeroUI supplies action menus, scroll shadows and profile presence badges. Local Radix dialog patterns provide modal focus handling. `FileUpload` is the shared local upload component.

Presence reflects authenticated messaging sockets, independently of the employee availability dropdown. Multiple tabs keep an account online until its final socket disconnects. Last-seen timestamps persist in MySQL and survive API restarts. Unexpected network loss follows Socket.IO’s disconnect timeout; closing a tab updates presence immediately. This is connection presence, not continuous tracking of employee activity.

Poll definitions, checklist text and quoted message references are validated on the server. Votes and checklist changes serialize on the message row and notify members. Reply references must belong to the same conversation. Image bytes are validated with Sharp before inline preview; all preview requests enforce attachment membership. Legacy image attachments are validated lazily on first preview. Clipboard support handles the browser’s paste event and does not read the system clipboard in the background.

HTTP routes live under `/api/auth/messaging`, behind the existing active-session, location and photo-evidence checks. Socket.IO uses `/api/messaging/socket.io` so the existing `/api` cookie is sent. The socket validates that cookie against the same session and attendance rules at connection and before every send. Browser origins use the shared allowlist. Membership is required for every history, send and download operation; managerial status does not bypass private-message membership.

Messages and membership persist in MySQL. Transactions serialize sends per conversation; a unique sender/client ID prevents duplicate rows on retries. Connected accounts receive invalidation events and reload authorized history. Reconnection reloads missed history. The window shows the latest 50 messages and can load earlier pages.

Operational roles use `/tasks` as their home destination. Profile Dashboard, Back to dashboard, logo links and sidebar My tasks/briefs therefore render the same task workspace. Root URLs remain compatible. Administrative and Chairman home dashboards retain their existing routes. Illustrator clearance is reserved only when the designer illustration is present.

Files use server-side private storage, UUID filenames and SHA-256 metadata. Only members can download sent files. Unsent files remain accessible only to their uploader and can be removed before sending. Limits: 30 MB per file inclusive, 10 attachments per message, 4,000 text characters, 60 sends per account per minute. Downloads use attachment disposition and `nosniff`; executable, HTML, SVG and audio attachments are excluded. The current deployment runs one API process; multi-host Socket.IO delivery would require a shared adapter.

## Setup and verification

Normal development startup runs `database/seed.js`; its idempotent workspace migration adds messaging tables and the employee `gender` attribute without changing existing passwords. Existing deployments should run the seed/migration before starting the updated API. Back up the MySQL database and `.local/chat-uploads` together. `IOTS_CHAT_ROOT` overrides private attachment storage. `IOTS_ALLOWED_ORIGINS` adds explicit trusted frontend origins; defaults remain localhost and 127.0.0.1 on port 5174.

Run `npm run test:unit` for policy checks. Set `IOTS_TEST_ADMIN_PASSWORD` and run `npm run test:messaging` for real authentication, concurrent sockets, multiple browser accounts and file-download checks. This test creates and removes its own `iots_chat_test_<timestamp>` database and private storage, leaving the working employee database untouched. Its browser screenshots are written to `reports/messaging-verification`.

The designer SVGs remain under `features/creative-associate/workspace/assets`. Authenticated employee gender selects the animation only in the creative dashboard; unspecified gender shows neither illustration. Attribution lives in the importing source code, not in the UI.

## Attachment and notification access update

Camera capture is removed. Images accept PNG, JPG/JPEG, WebP and GIF. Documents accept PDF, TXT, CSV, DOC/DOCX, XLS/XLSX, PPT/PPTX, ODT/ODS/ODP, RTF and Markdown. The picker filters are separate and uploads carry a category checked by the server. Exactly 30 MB is accepted; larger files report an error within the chat pane. Older stored attachments remain downloadable.

Browser desktop-notification permission is mandatory for chat. The widget does not connect its messaging socket before consent. Revoking permission disconnects and locks it again. The rest of the application stays accessible. New incoming messages create desktop notifications when the conversation is not visible; clicking a notification opens that conversation. This is a browser capability gate, not server authentication proof. Notification delivery requires the application to remain open; closed-browser Web Push is not configured.

Task homes now display a named greeting without role-title exclusions. Administrative and Chairman dashboards use the same time-of-day model. During message sending the editor stays read-only instead of disabled, retaining focus. Completion restores focus without taking it from another control selected by the user.

## Drag-and-drop file sharing

Dragging files into the active chat area displays `ChatDropOverlay` over the conversation thread.
- Drop zone displays summary of allowed formats (images & documents) and constraints (up to 30 MB per file, max 10 attachments).
- A prominent '✕' close button (`aria-label="Close file sharing"`) and 'Cancel' button on the overlay allow immediate dismissal without triggering uploads.
- Dropping directly onto the close or cancel buttons safely cancels without initiating file uploads (using `dropEffect = "none"` and propagation stops).
- An element directly in the attachment rules actions allows users to turn off / close the drag-and-drop feature for file sharing (`isDragDropEnabled()`, `setDragDropEnabled(false)`). When disabled, dragging files into the chat area does not activate the overlay.
- The composer's attachments drawer includes an "Enable drag & drop" action when the feature is turned off, as well as a close button that cleanly removes staged un-sent files and closes the panel.
- Pressing the Escape key immediately cancels/closes the drag-and-drop overlay and restores focus to the message composer without closing the parent chat window.
- Window-level `dragend` tracking automatically dismisses any stuck drag overlay if a drag operation is cancelled in the OS or outside the browser window.


