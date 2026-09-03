/**
 * The widget's compiled stylesheet, as text.
 *
 * vite-plugin-css-injected-by-js stages it on `globalThis` at the very top of the
 * bundle rather than injecting it anywhere — see injectCode in vite.config.ts. The
 * widget renders it into its own shadow root (see App.tsx), which is the only way to
 * guarantee that *every* instance is styled: host pages that hydrate discard our
 * element and build a fresh one, so anything applied once at load time is applied to
 * an instance nobody ends up looking at.
 */
export const widgetStyles =
  (globalThis as { __DONATIONS_WIDGET_CSS__?: string }).__DONATIONS_WIDGET_CSS__ ?? '';
