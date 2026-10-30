# Existing CIRIL visual world

This extends the authentication application's established design. It does not adopt the blue/orange/green/purple palette in the supplied generic prompt.

Use the shared Workspace Noto font, warm off-white surfaces, white panels, charcoal text, restrained gold accents and the existing dark equivalents from `authentication-system/frontend/src/features/employee-workspace/styles/workspace.css`. All screen colours refer to those tokens through `workspace.css`. Export pages use explicit print-paper and print-ink tokens.

The shell keeps navigation distinct from employee data: sticky brand/search/action header, grouped sidebar, compact preview/active-role row and one main content column. The account-change queue is the main decision surface. The five-item pulse is intentionally compact because the brief explicitly requires it; secondary charts do not compete with the queue.

Forms use explicit labels, a required reason, a before/after review and a final confirmation. Drawers show context without losing the main page. Business decisions stay visibly read-only. Icons use the existing outline family plus small matching SVG additions. No emoji or decorative glass effects.

Motion is restrained: one page arrival, 220 ms numerical changes, progress fills and a short drawer entry. Reduced-motion removes transitions and animated skeletons. Charts always provide a table view. Native dialogs retain keyboard focus and Escape handling. Responsive tables scroll inside their own container, never the page.
