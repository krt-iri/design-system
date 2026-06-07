/* @ds-bundle: {"format":3,"namespace":"DASKARTELLProfitBasetoolDesignSystem_8bfdd1","components":[],"sourceHashes":{"slides/deck-stage.js":"0de1efd241e5","ui_kits/basetool/components.jsx":"7ef9bbaddfc4","ui_kits/basetool/data.jsx":"9ff5d7927402","ui_kits/basetool/icons.jsx":"970a9012d7a9","ui_kits/basetool/screen-mission-detail.jsx":"9d7cd4004fa7","ui_kits/basetool/screens.jsx":"43d0d99ff8ed"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DASKARTELLProfitBasetoolDesignSystem_8bfdd1 = window.DASKARTELLProfitBasetoolDesignSystem_8bfdd1 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// slides/deck-stage.js
try { (() => {
/* BEGIN USAGE */
/**
 * <deck-stage> — reusable web component for HTML decks.
 *
 * Handles:
 *  (a) speaker notes — reads <script type="application/json" id="speaker-notes">
 *      and posts {slideIndexChanged: N} to the parent window on nav.
 *  (b) keyboard navigation — ←/→, PgUp/PgDn, Space, Home/End, number keys.
 *      On touch devices, tapping the left/right half of the stage goes
 *      prev/next — taps on links, buttons and other interactive slide
 *      content are left alone.
 *  (c) press R to reset to slide 0 (with a tasteful keyboard hint).
 *  (d) bottom-center overlay showing slide count + hints, fades out on idle.
 *  (e) auto-scaling — inner canvas is a fixed design size (default 1920×1080)
 *      scaled with `transform: scale()` to fit the viewport, letterboxed.
 *      Set the `noscale` attribute to render at authored size (1:1) — the
 *      PPTX exporter sets this so its DOM capture sees unscaled geometry.
 *  (f) print — `@media print` lays every slide out as its own page at the
 *      design size, so the browser's Print → Save as PDF produces a clean
 *      one-page-per-slide PDF with no extra setup.
 *  (g) thumbnail rail — resizable left-hand column of per-slide thumbnails
 *      (static clones). Click to navigate; ↑/↓ with a thumbnail focused to
 *      step between slides; drag to reorder; right-click for
 *      Skip / Move up / Move down / Delete (opens a Cancel/Delete confirm
 *      dialog). Drag the rail's right edge to resize; width persists to
 *      localStorage. Skipped slides carry `data-deck-skip`, are dimmed in
 *      the rail, omitted from prev/next navigation, and hidden at print.
 *      The rail is suppressed in presenting mode, in the host's Preview
 *      mode (ViewerMode='none'), on `noscale`, on narrow viewports
 *      (≤640px), and via the `no-rail` attribute. Rail mutations dispatch
 *      a `deckchange`
 *      CustomEvent on the element: detail = {action, from, to, slide}.
 *
 * Slides are HIDDEN, not unmounted. Non-active slides stay in the DOM with
 * `visibility: hidden` + `opacity: 0`, so their state (videos, iframes,
 * form inputs, React trees) is preserved across navigation.
 *
 * Lifecycle event — the component dispatches a `slidechange` CustomEvent on
 * itself whenever the active slide changes (including the initial mount).
 * The event bubbles and composes out of shadow DOM, so you can listen on
 * the <deck-stage> element or on document:
 *
 *   document.querySelector('deck-stage').addEventListener('slidechange', (e) => {
 *     e.detail.index         // new 0-based index
 *     e.detail.previousIndex // previous index, or -1 on init
 *     e.detail.total         // total slide count
 *     e.detail.slide         // the new active slide element
 *     e.detail.previousSlide // the prior slide element, or null on init
 *     e.detail.reason        // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
 *   });
 *
 * Persistence: none at the deck level. The host app keeps the current slide
 * in its own URL (?slide=) and re-delivers it via location.hash on load, so a
 * bare load with no hash always starts at slide 1.
 *
 * Usage:
 *   <style>deck-stage:not(:defined){visibility:hidden}</style>
 *   <deck-stage width="1920" height="1080">
 *     <section data-label="Title">...</section>
 *     <section data-label="Agenda">...</section>
 *   </deck-stage>
 *   <script src="deck-stage.js"></script>
 *
 * The :not(:defined) rule prevents a flash of the first slide at its
 * authored styles before this script runs and attaches the shadow root.
 *
 * Slides are the direct element children of <deck-stage>. Each slide is
 * automatically tagged with:
 *   - data-screen-label="NN Label"   (1-indexed, for comment flow)
 *   - data-om-validate="no_overflowing_text,no_overlapping_text,slide_sized_text"
 *
 * Speaker notes stay in sync because the component posts {slideIndexChanged: N}
 * to the parent — just include the #speaker-notes script tag if asked for notes.
 *
 * Authoring guidance:
 *   - Write slide bodies as static HTML inside <deck-stage>, with sizing via
 *     CSS custom properties in a <style> block rather than JS constants.
 *     Static slide markup is what lets the user click a heading in edit mode
 *     and retype it directly; a slide rendered through <script type="text/babel">,
 *     React, or a loop over a JS array has to round-trip every tweak through a
 *     chat message instead. Reach for script-generated slides only when the
 *     content genuinely needs interactive behaviour static HTML can't express.
 *   - Do NOT set position/inset/width/height on the slide <section> elements —
 *     the component absolutely positions every slotted child for you.
 */
/* END USAGE */

(() => {
  const DESIGN_W_DEFAULT = 1920;
  const DESIGN_H_DEFAULT = 1080;
  const OVERLAY_HIDE_MS = 1800;
  const VALIDATE_ATTR = 'no_overflowing_text,no_overlapping_text,slide_sized_text';
  const FINE_POINTER_MQ = matchMedia('(hover: hover) and (pointer: fine)');
  const NARROW_MQ = matchMedia('(max-width: 640px)');
  // Slide-authored controls that should keep a tap instead of it navigating.
  const INTERACTIVE_SEL = 'a[href], button, input, select, textarea, summary, label, video[controls], audio[controls], [role="button"], [onclick], [tabindex]:not([tabindex^="-"]), [contenteditable]:not([contenteditable="false" i])';
  const pad2 = n => String(n).padStart(2, '0');

  // Label precedence: data-label → data-screen-label (number stripped) → first heading → "Slide".
  const getSlideLabel = el => {
    const explicit = el.getAttribute('data-label');
    if (explicit) return explicit;
    const existing = el.getAttribute('data-screen-label');
    if (existing) return existing.replace(/^\s*\d+\s*/, '').trim() || existing;
    const h = el.querySelector('h1, h2, h3, [data-title]');
    const t = h && (h.textContent || '').trim().slice(0, 40);
    if (t) return t;
    return 'Slide';
  };
  const stylesheet = `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: #000;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
    }
    /* connectedCallback holds this until document.fonts.ready (capped 2s) so
     * the first visible paint has the deck's real typography + final rail
     * layout. opacity (not visibility) so the active slide can't un-hide
     * itself via the ::slotted([data-deck-active]) visibility:visible rule.
     * Only the stage/rail hide — the black :host background stays, so the
     * iframe doesn't flash the page's default white. */
    :host([data-fonts-pending]) .stage,
    :host([data-fonts-pending]) .rail { opacity: 0; pointer-events: none; }

    .stage {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas {
      position: relative;
      transform-origin: center center;
      flex-shrink: 0;
      background: #fff;
      will-change: transform;
    }

    /* Slides live in light DOM (via <slot>) so authored CSS still applies.
       We absolutely position each slotted child to stack them. */
    ::slotted(*) {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      box-sizing: border-box !important;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
    }
    ::slotted([data-deck-active]) {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }

    .overlay {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translate(-50%, 6px) scale(0.92);
      filter: blur(6px);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      background: #000;
      color: #fff;
      border-radius: 999px;
      font-size: 12px;
      font-feature-settings: "tnum" 1;
      letter-spacing: 0.01em;
      opacity: 0;
      pointer-events: none;
      transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.8,.2,1), filter 260ms ease;
      transform-origin: center bottom;
      z-index: 2147483000;
      user-select: none;
    }
    .overlay[data-visible] {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0) scale(1);
      filter: blur(0);
    }

    .btn {
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      margin: 0;
      padding: 0;
      color: inherit;
      font: inherit;
      cursor: default;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      min-width: 28px;
      border-radius: 999px;
      color: rgba(255,255,255,0.72);
      transition: background 140ms ease, color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .btn:active { background: rgba(255,255,255,0.18); }
    .btn:focus { outline: none; }
    .btn:focus-visible { outline: none; }
    .btn::-moz-focus-inner { border: 0; }
    .btn svg { width: 14px; height: 14px; display: block; }
    .btn.reset {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 0 10px 0 12px;
      gap: 6px;
      color: rgba(255,255,255,0.72);
    }
    .btn.reset .kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 10px;
      line-height: 1;
      color: rgba(255,255,255,0.88);
      background: rgba(255,255,255,0.12);
      border-radius: 4px;
    }

    .count {
      font-variant-numeric: tabular-nums;
      color: #fff;
      font-weight: 500;
      padding: 0 8px;
      min-width: 42px;
      text-align: center;
      font-size: 12px;
    }
    .count .sep { color: rgba(255,255,255,0.45); margin: 0 3px; font-weight: 400; }
    .count .total { color: rgba(255,255,255,0.55); }

    .divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.18);
      margin: 0 2px;
    }

    /* ── Thumbnail rail ──────────────────────────────────────────────────
       Fixed column on the left; each thumbnail is a static deep-clone of
       the light-DOM slide scaled into a 16:9 (or design-aspect) frame. The
       stage re-fits around it (see _fit); hidden during present / noscale
       / print so capture geometry and fullscreen output are unchanged. */
    .rail {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--deck-rail-w, 188px);
      background: #141414;
      border-right: 1px solid rgba(255,255,255,0.08);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 10px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 2147482500;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.18) transparent;
    }
    .rail::-webkit-scrollbar { width: 8px; }
    .rail::-webkit-scrollbar-track { background: transparent; margin: 2px; }
    .rail::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.18);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .rail::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.28);
      border: 2px solid transparent;
      background-clip: content-box;
    }
    :host([no-rail]) .rail,
    :host([noscale]) .rail { display: none; }
    .rail[data-presenting] { display: none; }
    @media (max-width: 640px) {
      .rail, .rail-resize { display: none; }
    }
    /* User-driven show/hide (the TweaksPanel toggle) slides instead of
       popping. Transitions are gated on :host([data-rail-anim]) — set only
       for the 200ms around the toggle — so window-resize and rail-width
       drag (which also call _fit) don't lag behind the cursor. */
    .rail[data-user-hidden] { transform: translateX(-100%); }
    :host([data-rail-anim]) .rail { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .stage { transition: left 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .canvas { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    /* transition shorthand replaces rather than merges — repeat the base
       .overlay opacity/transform/filter transitions so visibility changes
       during the 200ms toggle window still fade instead of popping. */
    :host([data-rail-anim]) .overlay {
      transition: margin-left 200ms cubic-bezier(.3,.7,.4,1),
                  opacity 260ms ease,
                  transform 260ms cubic-bezier(.2,.8,.2,1),
                  filter 260ms ease;
    }

    .thumb {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
    .thumb .num {
      width: 16px;
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 500;
      text-align: right;
      color: rgba(255,255,255,0.55);
      padding-top: 2px;
      font-variant-numeric: tabular-nums;
    }
    .thumb .frame {
      position: relative;
      flex: 1;
      min-width: 0;
      aspect-ratio: var(--deck-aspect);
      background: #fff;
      border-radius: 4px;
      outline: 2px solid transparent;
      outline-offset: 0;
      overflow: hidden;
      transition: outline-color 120ms ease;
    }
    .thumb:hover .frame { outline-color: rgba(255,255,255,0.25); }
    .thumb { outline: none; }
    .thumb:focus-visible .frame { outline-color: rgba(255,255,255,0.5); }
    .thumb[data-current] .num { color: #fff; }
    .thumb[data-current] .frame { outline-color: #D97757; }
    .thumb[data-dragging] { opacity: 0.35; }
    .thumb::before {
      content: '';
      position: absolute;
      left: 24px;
      right: 0;
      height: 3px;
      border-radius: 2px;
      background: #D97757;
      opacity: 0;
      pointer-events: none;
    }
    .thumb[data-drop="before"]::before { top: -8px; opacity: 1; }
    .thumb[data-drop="after"]::before { bottom: -8px; opacity: 1; }
    .thumb[data-skip] .frame { opacity: 0.35; }
    .thumb[data-skip] .frame::after {
      content: 'Skipped';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.45);
      color: #fff;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .ctxmenu {
      position: fixed;
      min-width: 150px;
      padding: 4px;
      background: #242424;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 7px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      z-index: 2147483100;
      display: none;
      font-size: 12px;
    }
    .ctxmenu[data-open] { display: block; }
    .ctxmenu button {
      display: block;
      width: 100%;
      appearance: none;
      border: 0;
      background: transparent;
      color: #e8e8e8;
      font: inherit;
      text-align: left;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    .ctxmenu button:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
    .ctxmenu button:disabled { opacity: 0.35; cursor: default; }
    .ctxmenu hr {
      border: 0;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 4px 2px;
    }

    .rail-resize {
      position: fixed;
      left: calc(var(--deck-rail-w, 188px) - 3px);
      top: 0;
      bottom: 0;
      width: 6px;
      cursor: col-resize;
      z-index: 2147482600;
      touch-action: none;
    }
    .rail-resize:hover,
    .rail-resize[data-dragging] { background: rgba(255,255,255,0.12); }
    :host([no-rail]) .rail-resize,
    :host([noscale]) .rail-resize,
    .rail[data-presenting] + .rail-resize,
    .rail[data-user-hidden] + .rail-resize { display: none; }

    /* Delete-confirm popup — matches the SPA's ConfirmDialog layout
       (title + message body, depressed footer with Cancel / Delete). */
    .confirm-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 2147483200;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .confirm-backdrop[data-open] { display: flex; }
    .confirm {
      width: 320px;
      max-width: calc(100vw - 32px);
      background: #2a2a2a;
      color: #e8e8e8;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.5);
      overflow: hidden;
      font-family: inherit;
      animation: deck-confirm-in 0.18s ease;
    }
    @keyframes deck-confirm-in {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .confirm .body { padding: 20px 20px 16px; }
    .confirm .title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .confirm .msg { font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.65); }
    .confirm .footer {
      padding: 14px 20px;
      background: #1f1f1f;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .confirm button {
      appearance: none;
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
    }
    .confirm .cancel {
      background: transparent;
      border: 0;
      color: rgba(255,255,255,0.8);
    }
    .confirm .cancel:hover { background: rgba(255,255,255,0.08); }
    .confirm .danger {
      background: #c96442;
      border: 1px solid rgba(0,0,0,0.15);
      color: #fff;
      box-shadow: 0 1px 3px rgba(166,50,68,0.3), 0 2px 6px rgba(166,50,68,0.18);
    }
    .confirm .danger:hover { background: #b5563a; }

    /* ── Print: one page per slide, no chrome ────────────────────────────
       The screen layout stacks every slide at inset:0 inside a scaled
       canvas; for print we want them in document flow at the authored
       design size so the browser paginates one slide per sheet. The
       @page size is set from the width/height attributes via the inline
       <style id="deck-stage-print-page"> that connectedCallback injects
       into <head> (the @page at-rule has no effect inside shadow DOM). */
    @media print {
      :host {
        position: static;
        inset: auto;
        background: none;
        overflow: visible;
        color: inherit;
      }
      .stage { position: static; display: block; }
      .canvas {
        transform: none !important;
        width: auto !important;
        height: auto !important;
        background: none;
        will-change: auto;
      }
      ::slotted(*) {
        position: relative !important;
        inset: auto !important;
        width: var(--deck-design-w) !important;
        height: var(--deck-design-h) !important;
        box-sizing: border-box !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto;
        break-after: page;
        page-break-after: always;
        break-inside: avoid;
        overflow: hidden;
      }
      /* :last-child alone isn't enough once data-deck-skip hides the
         trailing slide(s) — the last *visible* slide still carries
         break-after:page and prints a blank sheet. _markLastVisible()
         maintains data-deck-last-visible on the last non-skipped slide. */
      ::slotted(*:last-child),
      ::slotted([data-deck-last-visible]) {
        break-after: auto;
        page-break-after: auto;
      }
      ::slotted([data-deck-skip]) { display: none !important; }
      .overlay, .rail, .rail-resize, .ctxmenu, .confirm-backdrop { display: none !important; }
    }
  `;
  class DeckStage extends HTMLElement {
    static get observedAttributes() {
      return ['width', 'height', 'noscale', 'no-rail'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._index = 0;
      this._slides = [];
      this._notes = [];
      this._hideTimer = null;
      this._mouseIdleTimer = null;
      this._menuIndex = -1;
      this._onKey = this._onKey.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onSlotChange = this._onSlotChange.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onTap = this._onTap.bind(this);
      this._onMessage = this._onMessage.bind(this);
      // Capture-phase close so a click anywhere dismisses the menu, but
      // ignore clicks that land inside the menu itself — otherwise the
      // capture handler runs before the menu's own (bubble) handler and
      // clears _menuIndex out from under it.
      this._onDocClick = e => {
        if (this._menu && e.composedPath && e.composedPath().includes(this._menu)) return;
        this._closeMenu();
      };
    }
    get designWidth() {
      return parseInt(this.getAttribute('width'), 10) || DESIGN_W_DEFAULT;
    }
    get designHeight() {
      return parseInt(this.getAttribute('height'), 10) || DESIGN_H_DEFAULT;
    }
    connectedCallback() {
      // Presenter-view popup loads deckUrl?_snthumb=...#N for its prev/cur/
      // next thumbnails — the rail has no business rendering inside those
      // (wrong scale, and it offsets the stage so the thumb shows a gutter).
      if (/[?&]_snthumb=/.test(location.search)) this.setAttribute('no-rail', '');
      this._render();
      this._loadNotes();
      this._syncPrintPageRule();
      window.addEventListener('keydown', this._onKey);
      window.addEventListener('resize', this._onResize);
      window.addEventListener('mousemove', this._onMouseMove, {
        passive: true
      });
      window.addEventListener('message', this._onMessage);
      window.addEventListener('click', this._onDocClick, true);
      this.addEventListener('click', this._onTap);
      // Initial collection + layout happens via slotchange, which fires on mount.
      this._enableRail();
      // Hold the stage hidden until webfonts are ready so the first visible
      // paint has the deck's real typography — the :not(:defined) guard in
      // the page HTML only covers custom-element upgrade, not font load.
      // Capped so a 404'd font URL can't blank the deck indefinitely.
      this.setAttribute('data-fonts-pending', '');
      const reveal = () => this.removeAttribute('data-fonts-pending');
      // rAF first: fonts.ready is a pre-resolved promise until layout has
      // resolved the slotted text's font-family and pushed a FontFace into
      // 'loading'. Reading it here in connectedCallback (parse-time) would
      // settle the race in a microtask before any font fetch starts.
      requestAnimationFrame(() => {
        Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 2000))]).then(reveal, reveal);
      });
    }
    _enableRail() {
      // Idempotent — older host builds still post __omelette_rail_enabled.
      // no-rail guard keeps the observers/stylesheet walk off the cheap path
      // for presenter-popup thumbnail iframes (up to 9 per view).
      if (this._railEnabled || this.hasAttribute('no-rail')) return;
      this._railEnabled = true;
      // Per-viewer preference — restored alongside rail width. Default on;
      // only a stored '0' (from the TweaksPanel toggle) hides it.
      this._railVisible = true;
      try {
        if (localStorage.getItem('deck-stage.railVisible') === '0') this._railVisible = false;
      } catch (e) {}
      // Live thumbnail updates: watch the light-DOM slides for content
      // edits and re-clone just the affected thumb(s), debounced. Ignore
      // the data-deck-* / data-screen-label / data-om-validate attributes
      // this component itself writes so nav and skip don't trigger
      // spurious refreshes.
      const OWN_ATTRS = /^data-(deck-|screen-label$|om-validate$)/;
      this._liveDirty = new Set();
      this._liveObserver = new MutationObserver(records => {
        for (const r of records) {
          if (r.type === 'attributes' && OWN_ATTRS.test(r.attributeName || '')) continue;
          let n = r.target;
          while (n && n.parentElement !== this) n = n.parentElement;
          if (n && this._slideSet && this._slideSet.has(n)) this._liveDirty.add(n);
        }
        if (this._liveDirty.size && !this._liveTimer) {
          this._liveTimer = setTimeout(() => {
            this._liveTimer = null;
            this._liveDirty.forEach(s => this._refreshThumb(s));
            this._liveDirty.clear();
          }, 200);
        }
      });
      this._liveObserver.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      // Lazy thumbnail materialization — clone the slide only when its
      // frame scrolls into (or near) the rail viewport. rootMargin gives
      // ~4 thumbs of pre-load so fast scrolling doesn't flash blanks.
      this._railObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && e.target.__deckThumb) {
            this._materialize(e.target.__deckThumb);
          }
        });
      }, {
        root: this._rail,
        rootMargin: '400px 0px'
      });
      // Tweaks typically change CSS vars / attrs OUTSIDE <deck-stage>
      // (on <html>, <body>, a wrapper div, or a <style> tag), which
      // _liveObserver can't see. Re-snapshot author CSS (constructable
      // sheet is shared by reference, so one replaceSync updates every
      // thumb shadow root) and re-sync each thumb host's attrs + custom
      // properties. In-slide DOM mutations are _liveObserver's job.
      // Debounced so slider drags don't thrash.
      this._onTweakChange = () => {
        clearTimeout(this._tweakTimer);
        this._tweakTimer = setTimeout(() => {
          this._snapshotAuthorCss();
          // One getComputedStyle for the whole batch — each
          // getPropertyValue read below reuses the same computed style
          // as long as nothing invalidates layout between thumbs.
          const cs = getComputedStyle(this);
          (this._thumbs || []).forEach(t => {
            if (t.host) this._syncThumbHostAttrs(t.host, cs);
          });
        }, 120);
      };
      window.addEventListener('tweakchange', this._onTweakChange);
      this._snapshotAuthorCss();
      // Build the rail now that it's enabled — slotchange already fired,
      // so _renderRail's early-return skipped the initial build.
      this._syncRailHidden();
      this._renderRail();
      this._fit();
    }

    /** Snapshot document stylesheets into a constructable sheet that each
     *  thumbnail's nested shadow root adopts — so author CSS styles the
     *  cloned slide content without touching this component's chrome.
     *  Cross-origin sheets throw on .cssRules — skip them. Re-callable:
     *  the existing constructable sheet is reused via replaceSync so every
     *  already-adopted shadow root picks up the fresh CSS without re-adopt. */
    _snapshotAuthorCss() {
      // :root in an adopted sheet inside a shadow root matches nothing
      // (only the document root qualifies), so author rules like
      // `:root[data-voice="modern"] .serif` never reach the clones.
      // Rewrite :root → :host and mirror <html>'s data-*/class/lang onto
      // each thumb host (see _syncThumbHostAttrs) so the same selectors
      // match inside the thumbnail's shadow tree.
      const authorCss = Array.from(document.styleSheets).map(sh => {
        try {
          return Array.from(sh.cssRules).map(r => r.cssText).join('\n');
        } catch (e) {
          return '';
        }
      }).join('\n')
      // The shadow host is featureless outside the functional :host(...)
      // form, so any compound on :root — [attr], .class, #id, :pseudo —
      // must become :host(<compound>) not :host<compound>. Same for the
      // html type selector (Tailwind class-strategy dark mode emits
      // html.dark; Pico uses html[data-theme]), which has nothing to
      // match inside the thumb's shadow tree.
      .replace(/:root((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)/g, ':host($1)').replace(/:root\b/g, ':host').replace(/(^|[\s,>~+(}])html((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)(?![-\w])/g, '$1:host($2)').replace(/(^|[\s,>~+(}])html(?![-\w])/g, '$1:host');
      // Every custom property the author references. _syncThumbHostAttrs
      // mirrors each one's *computed* value at <deck-stage> onto the
      // thumb host so the live value wins over the :host default above
      // regardless of which ancestor the tweak wrote to (<html>, <body>,
      // a wrapper div, or the deck-stage element itself all inherit
      // down to getComputedStyle(this)).
      this._authorVars = new Set(authorCss.match(/--[\w-]+/g) || []);
      try {
        if (!this._adoptedSheet) this._adoptedSheet = new CSSStyleSheet();
        this._adoptedSheet.replaceSync(authorCss);
      } catch (e) {
        this._adoptedSheet = null;
        this._authorCss = authorCss;
      }
    }
    _syncThumbHostAttrs(host, cs) {
      const de = document.documentElement;
      // setAttribute overwrites but can't delete — an attr removed from
      // <html> (toggleAttribute off, classList emptied) would linger on
      // the host and :host([data-*]) / :host(.foo) rules would keep
      // matching. Remove stale mirrored attrs first; iterate backward
      // because removeAttribute mutates the live NamedNodeMap.
      for (let i = host.attributes.length - 1; i >= 0; i--) {
        const n = host.attributes[i].name;
        if ((n.startsWith('data-') || n === 'class' || n === 'lang') && !de.hasAttribute(n)) {
          host.removeAttribute(n);
        }
      }
      for (const a of de.attributes) {
        if (a.name.startsWith('data-') || a.name === 'class' || a.name === 'lang') {
          host.setAttribute(a.name, a.value);
        }
      }
      // The :root→:host rewrite in _snapshotAuthorCss pins each custom
      // property to its stylesheet default on the thumb host, shadowing
      // the live value that would otherwise inherit. Tweaks can write the
      // live value on any ancestor — <html>, <body>, a wrapper div, the
      // deck-stage element — so read it as the *computed* value at
      // <deck-stage> (which sees the whole inheritance chain) rather than
      // trying to guess which element the author wrote to. Inline on the
      // host beats the :host{} rule. remove-stale covers vars dropped
      // from the stylesheet between snapshots.
      const vars = this._authorVars || new Set();
      for (let i = host.style.length - 1; i >= 0; i--) {
        const p = host.style[i];
        if (p.startsWith('--') && !vars.has(p)) host.style.removeProperty(p);
      }
      const live = cs || getComputedStyle(this);
      vars.forEach(p => {
        const v = live.getPropertyValue(p);
        if (v) host.style.setProperty(p, v.trim());else host.style.removeProperty(p);
      });
    }
    disconnectedCallback() {
      window.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('message', this._onMessage);
      window.removeEventListener('click', this._onDocClick, true);
      this.removeEventListener('click', this._onTap);
      if (this._hideTimer) clearTimeout(this._hideTimer);
      if (this._mouseIdleTimer) clearTimeout(this._mouseIdleTimer);
      if (this._liveTimer) clearTimeout(this._liveTimer);
      if (this._tweakTimer) clearTimeout(this._tweakTimer);
      if (this._railAnimTimer) clearTimeout(this._railAnimTimer);
      if (this._scaleRaf) cancelAnimationFrame(this._scaleRaf);
      if (this._liveObserver) this._liveObserver.disconnect();
      if (this._railObserver) this._railObserver.disconnect();
      if (this._onTweakChange) window.removeEventListener('tweakchange', this._onTweakChange);
    }
    attributeChangedCallback() {
      if (this._canvas) {
        this._canvas.style.width = this.designWidth + 'px';
        this._canvas.style.height = this.designHeight + 'px';
        this._canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
        this._canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
        if (this._rail) {
          this._rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
        }
        this._fit();
        this._scaleThumbs();
        this._syncPrintPageRule();
      }
    }
    _render() {
      const style = document.createElement('style');
      style.textContent = stylesheet;
      const stage = document.createElement('div');
      stage.className = 'stage';
      const canvas = document.createElement('div');
      canvas.className = 'canvas';
      canvas.style.width = this.designWidth + 'px';
      canvas.style.height = this.designHeight + 'px';
      canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
      canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
      const slot = document.createElement('slot');
      slot.addEventListener('slotchange', this._onSlotChange);
      canvas.appendChild(slot);
      stage.appendChild(canvas);

      // Overlay: compact, solid black, with clickable controls.
      const overlay = document.createElement('div');
      overlay.className = 'overlay export-hidden';
      overlay.setAttribute('role', 'toolbar');
      overlay.setAttribute('aria-label', 'Deck controls');
      overlay.setAttribute('data-omelette-chrome', '');
      overlay.innerHTML = `
        <button class="btn prev" type="button" aria-label="Previous slide" title="Previous (←)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <span class="count" aria-live="polite"><span class="current">1</span><span class="sep">/</span><span class="total">1</span></span>
        <button class="btn next" type="button" aria-label="Next slide" title="Next (→)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>
        </button>
        <span class="divider"></span>
        <button class="btn reset" type="button" aria-label="Reset to first slide" title="Reset (R)">Reset<span class="kbd">R</span></button>
      `;
      overlay.querySelector('.prev').addEventListener('click', () => this._advance(-1, 'click'));
      overlay.querySelector('.next').addEventListener('click', () => this._advance(1, 'click'));
      overlay.querySelector('.reset').addEventListener('click', () => this._go(0, 'click'));

      // Thumbnail rail + context menu. Thumbnails are populated in
      // _renderRail() after _collectSlides().
      const rail = document.createElement('div');
      rail.className = 'rail export-hidden';
      rail.setAttribute('data-omelette-chrome', '');
      rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
      // Edge auto-scroll while dragging a thumb near the rail's top/bottom
      // so off-screen drop targets are reachable. Native dragover fires
      // continuously while the pointer is stationary, so a per-event nudge
      // (ramped by edge proximity) is enough — no rAF loop needed.
      rail.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        const r = rail.getBoundingClientRect();
        const EDGE = 40;
        const dt = e.clientY - r.top;
        const db = r.bottom - e.clientY;
        if (dt < EDGE) rail.scrollTop -= Math.ceil((EDGE - dt) / 3);else if (db < EDGE) rail.scrollTop += Math.ceil((EDGE - db) / 3);
      });
      const menu = document.createElement('div');
      menu.className = 'ctxmenu export-hidden';
      menu.setAttribute('data-omelette-chrome', '');
      menu.innerHTML = `
        <button type="button" data-act="skip">Skip slide</button>
        <button type="button" data-act="up">Move up</button>
        <button type="button" data-act="down">Move down</button>
        <hr>
        <button type="button" data-act="delete">Delete slide</button>
      `;
      menu.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        const i = this._menuIndex;
        this._closeMenu();
        if (act === 'skip') this._toggleSkip(i);else if (act === 'up') this._moveSlide(i, i - 1);else if (act === 'down') this._moveSlide(i, i + 1);else if (act === 'delete') this._openConfirm(i);
      });
      menu.addEventListener('contextmenu', e => e.preventDefault());

      // Rail resize handle — drag to set --deck-rail-w, persisted to
      // localStorage so the width survives reloads.
      const resize = document.createElement('div');
      resize.className = 'rail-resize export-hidden';
      resize.setAttribute('data-omelette-chrome', '');
      resize.addEventListener('pointerdown', e => {
        e.preventDefault();
        resize.setPointerCapture(e.pointerId);
        resize.setAttribute('data-dragging', '');
        const move = ev => this._setRailWidth(ev.clientX);
        const up = () => {
          resize.removeEventListener('pointermove', move);
          resize.removeEventListener('pointerup', up);
          resize.removeEventListener('pointercancel', up);
          resize.removeAttribute('data-dragging');
          try {
            localStorage.setItem('deck-stage.railWidth', String(this._railPx));
          } catch (err) {}
        };
        resize.addEventListener('pointermove', move);
        resize.addEventListener('pointerup', up);
        resize.addEventListener('pointercancel', up);
      });

      // Delete-confirm dialog — mirrors the SPA's ConfirmDialog layout.
      const confirm = document.createElement('div');
      confirm.className = 'confirm-backdrop export-hidden';
      confirm.setAttribute('data-omelette-chrome', '');
      confirm.innerHTML = `
        <div class="confirm" role="dialog" aria-modal="true">
          <div class="body">
            <div class="title">Delete slide?</div>
            <div class="msg">This slide will be removed from the deck.</div>
          </div>
          <div class="footer">
            <button type="button" class="cancel">Cancel</button>
            <button type="button" class="danger">Delete</button>
          </div>
        </div>
      `;
      confirm.addEventListener('click', e => {
        if (e.target === confirm) this._closeConfirm();
      });
      confirm.querySelector('.cancel').addEventListener('click', () => this._closeConfirm());
      confirm.querySelector('.danger').addEventListener('click', () => {
        const i = this._confirmIndex;
        this._closeConfirm();
        this._deleteSlide(i);
      });
      this._root.append(style, rail, resize, stage, overlay, menu, confirm);
      this._canvas = canvas;
      this._stage = stage;
      this._slot = slot;
      this._overlay = overlay;
      this._rail = rail;
      this._resize = resize;
      this._menu = menu;
      this._confirm = confirm;
      this._countEl = overlay.querySelector('.current');
      this._totalEl = overlay.querySelector('.total');

      // Restore persisted rail width.
      let rw = 188;
      try {
        const s = localStorage.getItem('deck-stage.railWidth');
        if (s) rw = parseInt(s, 10) || rw;
      } catch (err) {}
      this._setRailWidth(rw);
      this._syncRailHidden();
    }
    _setRailWidth(px) {
      const w = Math.max(120, Math.min(360, Math.round(px)));
      this._railPx = w;
      this.style.setProperty('--deck-rail-w', w + 'px');
      this._fit();
      // _scaleThumbs forces a sync layout (frame.offsetWidth) then writes
      // N transforms. During a resize drag this runs per-pointermove;
      // coalesce to one per frame.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
    }

    /** @page must live in the document stylesheet — it's a no-op inside
     *  shadow DOM. Inject/update a single <head> style tag so the print
     *  sheet matches the design size and Save-as-PDF yields one slide per
     *  page with no margins. */
    _syncPrintPageRule() {
      const id = 'deck-stage-print-page';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
        document.head.appendChild(tag);
      }
      tag.textContent = '@page { size: ' + this.designWidth + 'px ' + this.designHeight + 'px; margin: 0; } ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; overflow: visible !important; height: auto !important; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }';
    }
    _onSlotChange() {
      // Rail mutations (delete/move) already reconcile synchronously and
      // emit slidechange with reason 'api'; skip the async slotchange that
      // would otherwise re-broadcast with reason 'init'.
      if (this._squelchSlotChange) {
        this._squelchSlotChange = false;
        return;
      }
      this._collectSlides();
      this._restoreIndex();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'init'
      });
      this._fit();
    }
    _collectSlides() {
      const assigned = this._slot.assignedElements({
        flatten: true
      });
      this._slides = assigned.filter(el => {
        // Skip template/style/script nodes even if someone slots them.
        const tag = el.tagName;
        return tag !== 'TEMPLATE' && tag !== 'SCRIPT' && tag !== 'STYLE';
      });
      this._slideSet = new Set(this._slides);
      this._slides.forEach((slide, i) => {
        const n = i + 1;
        slide.setAttribute('data-screen-label', `${pad2(n)} ${getSlideLabel(slide)}`);

        // Validation attribute for comment flow / auto-checks.
        if (!slide.hasAttribute('data-om-validate')) {
          slide.setAttribute('data-om-validate', VALIDATE_ATTR);
        }
        slide.setAttribute('data-deck-slide', String(i));
      });
      if (this._totalEl) this._totalEl.textContent = String(this._slides.length || 1);
      if (this._index >= this._slides.length) this._index = Math.max(0, this._slides.length - 1);
      this._markLastVisible();
      this._renderRail();
    }

    /** Tag the last non-skipped slide so print CSS can drop its
     *  break-after (see the @media print comment above — :last-child
     *  alone matches a hidden skipped slide). */
    _markLastVisible() {
      let last = null;
      this._slides.forEach(s => {
        s.removeAttribute('data-deck-last-visible');
        if (!s.hasAttribute('data-deck-skip')) last = s;
      });
      if (last) last.setAttribute('data-deck-last-visible', '');
    }
    _loadNotes() {
      const tag = document.getElementById('speaker-notes');
      if (!tag) {
        this._notes = [];
        return;
      }
      try {
        const parsed = JSON.parse(tag.textContent || '[]');
        if (Array.isArray(parsed)) this._notes = parsed;
      } catch (e) {
        console.warn('[deck-stage] Failed to parse #speaker-notes JSON:', e);
        this._notes = [];
      }
    }
    _restoreIndex() {
      // The host's ?slide= param is delivered as a #<int> hash (1-indexed) on
      // the iframe src. No hash → slide 1; the deck itself keeps no position
      // state across loads.
      const h = (location.hash || '').match(/^#(\d+)$/);
      if (h) {
        const n = parseInt(h[1], 10) - 1;
        if (n >= 0 && n < this._slides.length) this._index = n;
      }
    }
    _applyIndex({
      showOverlay = true,
      broadcast = true,
      reason = 'init'
    } = {}) {
      if (!this._slides.length) return;
      const prev = this._prevIndex == null ? -1 : this._prevIndex;
      const curr = this._index;
      // Keep the iframe's own hash in sync so an in-iframe location.reload()
      // (reload banner path in viewer-handle.ts) lands on the current slide,
      // not the stale deep-link hash from initial load.
      try {
        history.replaceState(null, '', '#' + (curr + 1));
      } catch (e) {}
      this._slides.forEach((s, i) => {
        if (i === curr) s.setAttribute('data-deck-active', '');else s.removeAttribute('data-deck-active');
      });
      if (this._countEl) this._countEl.textContent = String(curr + 1);
      // Follow-scroll on every navigation (init deep-link, keyboard, click,
      // tap, external goTo) — the only time we *don't* want the rail to
      // track current is after a rail-internal mutation, where _renderRail
      // has already restored the user's scroll position and yanking back to
      // current would undo it.
      this._syncRail(reason !== 'mutation');
      if (broadcast) {
        // (1) Legacy: host-window postMessage for speaker-notes renderers.
        try {
          window.postMessage({
            slideIndexChanged: curr,
            deckTotal: this._slides.length,
            deckSkipped: this._skippedIndices()
          }, '*');
        } catch (e) {}

        // (2) In-page CustomEvent on the <deck-stage> element itself.
        //     Bubbles and composes out of shadow DOM so slide code can listen:
        //       document.querySelector('deck-stage').addEventListener('slidechange', e => {
        //         e.detail.index, e.detail.previousIndex, e.detail.total, e.detail.slide, e.detail.reason
        //       });
        const detail = {
          index: curr,
          previousIndex: prev,
          total: this._slides.length,
          slide: this._slides[curr] || null,
          previousSlide: prev >= 0 ? this._slides[prev] || null : null,
          reason: reason // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
        };
        this.dispatchEvent(new CustomEvent('slidechange', {
          detail,
          bubbles: true,
          composed: true
        }));
      }
      this._prevIndex = curr;
      if (showOverlay) this._flashOverlay();
    }
    _flashOverlay() {
      // Host posts __omelette_presenting while in fullscreen/tab presentation
      // mode — suppress the nav footer entirely (both hover and slide-change
      // flash) so the audience sees clean slides.
      if (!this._overlay || this._presenting) return;
      this._overlay.setAttribute('data-visible', '');
      if (this._hideTimer) clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this._overlay.removeAttribute('data-visible');
      }, OVERLAY_HIDE_MS);
    }
    _railWidth() {
      // State-based, no offsetWidth: the first _fit() can run before the
      // rail has had layout on some load paths, and a 0 there paints the
      // slide full-width for one frame before the post-slotchange _fit()
      // corrects it.
      if (!this._railEnabled || !this._railVisible || this.hasAttribute('no-rail') || this.hasAttribute('noscale') || this._presenting || this._previewMode || NARROW_MQ.matches) return 0;
      return this._railPx || 0;
    }
    _fit() {
      if (!this._canvas) return;
      const stage = this._canvas.parentElement;
      // PPTX export sets noscale so the DOM capture sees authored-size
      // geometry — the scaled canvas is in shadow DOM, so the exporter's
      // resetTransformSelector can't reach .canvas.style.transform directly.
      if (this.hasAttribute('noscale')) {
        this._canvas.style.transform = 'none';
        if (stage) stage.style.left = '0';
        if (this._overlay) this._overlay.style.marginLeft = '0';
        return;
      }
      const rw = this._railWidth();
      if (stage) stage.style.left = rw + 'px';
      // Overlay is centred on the viewport via left:50% + translate(-50%);
      // marginLeft shifts the centre by rw/2 so it lands in the middle of
      // the [rw, innerWidth] stage region.
      if (this._overlay) this._overlay.style.marginLeft = rw / 2 + 'px';
      const vw = window.innerWidth - rw;
      const vh = window.innerHeight;
      const s = Math.min(vw / this.designWidth, vh / this.designHeight);
      this._canvas.style.transform = `scale(${s})`;
    }
    _onResize() {
      this._fit();
      // Crossing the narrow-viewport breakpoint reveals the rail — rerun the
      // thumbnail scale the same way _setRailWidth does.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
    }
    _onMouseMove() {
      // Keep overlay visible while mouse moves; hide after idle.
      this._flashOverlay();
    }
    _onMessage(e) {
      const d = e.data;
      if (d && typeof d.__omelette_presenting === 'boolean') {
        this._presenting = d.__omelette_presenting;
        if (this._presenting && this._overlay) {
          this._overlay.removeAttribute('data-visible');
          if (this._hideTimer) clearTimeout(this._hideTimer);
        }
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Host's Preview segment (ViewerMode='none'): the rail's drag-reorder /
      // right-click skip-delete affordances are editing chrome, so hide it
      // while the user is just looking at the deck. Same hard-hide path as
      // presenting; independent of the user's _railVisible preference so
      // returning to Edit restores whatever they had.
      if (d && typeof d.__omelette_preview_mode === 'boolean') {
        if (d.__omelette_preview_mode === this._previewMode) return;
        this._previewMode = d.__omelette_preview_mode;
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Per-viewer show/hide, driven by the TweaksPanel's auto-injected
      // "Thumbnail rail" toggle (or any author script). Independent of
      // whether the Tweaks panel itself is open — closing the panel
      // doesn't change rail visibility. Persists alongside rail width.
      if (d && d.type === '__deck_rail_visible' && typeof d.on === 'boolean') {
        if (d.on === this._railVisible) return;
        this._railVisible = d.on;
        try {
          localStorage.setItem('deck-stage.railVisible', d.on ? '1' : '0');
        } catch (e) {}
        // Arm the transition, commit it, then flip state — otherwise the
        // browser coalesces both writes and nothing animates on show.
        this.setAttribute('data-rail-anim', '');
        void (this._rail && this._rail.offsetHeight);
        this._syncRailHidden();
        this._fit();
        this._scaleThumbs();
        clearTimeout(this._railAnimTimer);
        this._railAnimTimer = setTimeout(() => this.removeAttribute('data-rail-anim'), 220);
      }
      if (d && d.type === '__omelette_rail_enabled') this._enableRail();
    }
    _syncRailHidden() {
      if (!this._rail) return;
      // data-presenting is the hard hide (display:none) for flag-off,
      // presentation mode, and the host's Preview segment — instant, no
      // transition. data-user-hidden is the soft hide (translateX(-100%))
      // for the viewer's rail toggle, so show/hide slides under
      // :host([data-rail-anim]).
      const hard = !this._railEnabled || this._presenting || this._previewMode;
      if (hard) this._rail.setAttribute('data-presenting', '');else this._rail.removeAttribute('data-presenting');
      if (!this._railVisible) this._rail.setAttribute('data-user-hidden', '');else this._rail.removeAttribute('data-user-hidden');
      // translateX hide leaves thumbs (tabIndex=0) in the tab order —
      // inert keeps them unfocusable while the rail is off-screen.
      this._rail.inert = hard || !this._railVisible;
    }
    _onTap(e) {
      // Touch-only — keyboard + the overlay toolbar cover nav on desktop.
      if (FINE_POINTER_MQ.matches) return;
      // Only taps that land on the stage (slide content or letterbox); the
      // overlay / rail / menus are siblings with their own click handlers.
      const path = e.composedPath();
      if (!this._stage || !path.includes(this._stage)) return;
      // Let interactive slide content keep the tap. composedPath (not
      // e.target.closest) so we see through open shadow roots — a <button>
      // inside a slide-authored custom element retargets e.target to the
      // host but still appears in the composed path.
      if (e.defaultPrevented) return;
      for (const n of path) {
        if (n === this._stage) break;
        if (n.matches && n.matches(INTERACTIVE_SEL)) return;
      }
      e.preventDefault();
      const rw = this._railWidth();
      const mid = rw + (window.innerWidth - rw) / 2;
      this._advance(e.clientX < mid ? -1 : 1, 'tap');
    }
    _onKey(e) {
      // Ignore when the user is typing.
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      // Confirm dialog swallows nav keys while open; Escape cancels. Enter
      // is left to the focused button's native activation so Tab→Cancel
      // →Enter activates Cancel, not the window-level confirm path.
      if (this._confirm && this._confirm.hasAttribute('data-open')) {
        if (e.key === 'Escape') {
          this._closeConfirm();
          e.preventDefault();
        }
        return;
      }
      if (e.key === 'Escape' && this._menu && this._menu.hasAttribute('data-open')) {
        this._closeMenu();
        e.preventDefault();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      let handled = true;
      if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || key === 'Spacebar') {
        this._advance(1, 'keyboard');
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        this._advance(-1, 'keyboard');
      } else if (key === 'Home') {
        this._go(0, 'keyboard');
      } else if (key === 'End') {
        this._go(this._slides.length - 1, 'keyboard');
      } else if (key === 'r' || key === 'R') {
        this._go(0, 'keyboard');
      } else if (/^[0-9]$/.test(key)) {
        // 1..9 jump to that slide; 0 jumps to 10.
        const n = key === '0' ? 9 : parseInt(key, 10) - 1;
        if (n < this._slides.length) this._go(n, 'keyboard');
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        this._flashOverlay();
      }
    }
    _go(i, reason = 'api') {
      if (!this._slides.length) return;
      const clamped = Math.max(0, Math.min(this._slides.length - 1, i));
      if (clamped === this._index) {
        this._flashOverlay();
        return;
      }
      this._index = clamped;
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason
      });
    }

    /** Step forward/back skipping any slide marked data-deck-skip. Falls
     *  back to _go's clamp-at-ends behaviour (flash overlay) when there's
     *  nothing further in that direction. */
    _advance(dir, reason) {
      if (!this._slides.length) return;
      let i = this._index + dir;
      while (i >= 0 && i < this._slides.length && this._slides[i].hasAttribute('data-deck-skip')) {
        i += dir;
      }
      if (i < 0 || i >= this._slides.length) {
        this._flashOverlay();
        return;
      }
      this._go(i, reason);
    }

    // ── Thumbnail rail ────────────────────────────────────────────────────
    //
    // Thumbs are keyed by slide element and reused across _renderRail()
    // calls, so a reorder/delete is an O(changed) DOM shuffle instead of an
    // O(N) teardown-and-re-clone. Each thumb starts as a lightweight shell
    // (num + empty frame); the clone is materialized lazily by an
    // IntersectionObserver when the frame scrolls into (or near) view, so
    // only visible-ish slides pay the clone + image-decode cost.

    _renderRail() {
      if (!this._rail || !this._railEnabled) {
        this._thumbs = [];
        return;
      }
      // FLIP: record each *materialized* thumb's top before the reconcile.
      // Off-screen (non-materialized) thumbs don't need the animation and
      // skipping their getBoundingClientRect saves a forced layout per
      // off-screen thumb on large decks.
      const prevTops = new Map();
      (this._thumbs || []).forEach(({
        thumb,
        slide,
        host
      }) => {
        if (host) prevTops.set(slide, thumb.getBoundingClientRect().top);
      });
      const st = this._rail.scrollTop;

      // Reconcile: reuse thumbs that already exist for a slide, create
      // shells for new slides, drop thumbs for removed slides.
      const bySlide = new Map();
      (this._thumbs || []).forEach(t => bySlide.set(t.slide, t));
      const next = [];
      this._slides.forEach(slide => {
        let t = bySlide.get(slide);
        if (t) bySlide.delete(slide);else t = this._makeThumb(slide);
        next.push(t);
      });
      // Orphans — slides removed since last render.
      bySlide.forEach(t => {
        if (this._railObserver) this._railObserver.unobserve(t.frame);
        t.thumb.remove();
      });
      // Put thumbs into document order to match _slides. insertBefore on
      // an already-correctly-placed node is a no-op, so this is cheap
      // when nothing moved.
      next.forEach((t, i) => {
        const want = t.thumb;
        const at = this._rail.children[i];
        if (at !== want) this._rail.insertBefore(want, at || null);
        t.i = i;
        t.num.textContent = String(i + 1);
        if (t.slide.hasAttribute('data-deck-skip')) t.thumb.setAttribute('data-skip', '');else t.thumb.removeAttribute('data-skip');
      });
      this._thumbs = next;
      this._rail.scrollTop = st;
      if (prevTops.size) {
        const moved = [];
        this._thumbs.forEach(({
          thumb,
          slide
        }) => {
          const old = prevTops.get(slide);
          if (old == null) return;
          const dy = old - thumb.getBoundingClientRect().top;
          if (Math.abs(dy) < 1) return;
          thumb.style.transition = 'none';
          thumb.style.transform = `translateY(${dy}px)`;
          moved.push(thumb);
        });
        if (moved.length) {
          // Commit the inverted positions before flipping the transition
          // on — otherwise the browser coalesces both style writes and
          // nothing animates.
          void this._rail.offsetHeight;
          moved.forEach(t => {
            t.style.transition = 'transform 180ms cubic-bezier(.2,.7,.3,1)';
            t.style.transform = '';
          });
          setTimeout(() => moved.forEach(t => {
            t.style.transition = '';
          }), 220);
        }
      }
      requestAnimationFrame(() => this._scaleThumbs());
      this._syncRail(false);
    }

    /** Create a lightweight thumb shell for one slide. The clone is
     *  materialized later by the IntersectionObserver. Event handlers
     *  look up the thumb's *current* index (via _thumbs.indexOf) so the
     *  same element can be reused across reorders. */
    _makeThumb(slide) {
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.tabIndex = 0;
      const num = document.createElement('div');
      num.className = 'num';
      const frame = document.createElement('div');
      frame.className = 'frame';
      thumb.append(num, frame);
      const entry = {
        thumb,
        num,
        frame,
        slide,
        clone: null,
        host: null,
        i: -1
      };
      // entry.i is refreshed on every _renderRail reconcile pass, so
      // handlers read the thumb's current position without an O(N) scan.
      const idx = () => entry.i;
      thumb.addEventListener('click', () => this._go(idx(), 'click'));
      // ↑/↓ step through the rail when a thumb has focus. _go clamps at the
      // ends and _applyIndex→_syncRail scrolls the new current thumb into
      // view; we move focus to it (preventScroll — _syncRail already
      // scrolled) so a held key walks the whole list. stopPropagation keeps
      // this out of the window-level _onKey nav handler.
      thumb.addEventListener('keydown', e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        e.stopPropagation();
        this._go(idx() + (e.key === 'ArrowDown' ? 1 : -1), 'keyboard');
        const cur = this._thumbs && this._thumbs[this._index];
        if (cur) cur.thumb.focus({
          preventScroll: true
        });
      });
      thumb.addEventListener('contextmenu', e => {
        e.preventDefault();
        this._openMenu(idx(), e.clientX, e.clientY);
      });
      thumb.draggable = true;
      thumb.addEventListener('dragstart', e => {
        this._dragFrom = idx();
        thumb.setAttribute('data-dragging', '');
        e.dataTransfer.effectAllowed = 'move';
        try {
          e.dataTransfer.setData('text/plain', String(this._dragFrom));
        } catch (err) {}
      });
      thumb.addEventListener('dragend', () => {
        thumb.removeAttribute('data-dragging');
        this._clearDrop();
        this._dragFrom = null;
      });
      thumb.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const r = thumb.getBoundingClientRect();
        this._setDrop(idx(), e.clientY < r.top + r.height / 2 ? 'before' : 'after');
      });
      thumb.addEventListener('drop', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        const i = idx();
        const r = thumb.getBoundingClientRect();
        let to = e.clientY >= r.top + r.height / 2 ? i + 1 : i;
        if (this._dragFrom < to) to--;
        const from = this._dragFrom;
        this._clearDrop();
        this._dragFrom = null;
        if (to !== from) this._moveSlide(from, to);
      });
      if (this._railObserver) this._railObserver.observe(frame);
      frame.__deckThumb = entry;
      return entry;
    }

    /** Lazily build the clone for a thumb that has scrolled into view. */
    _materialize(entry) {
      if (entry.host) return;
      const dw = this.designWidth,
        dh = this.designHeight;
      let clone = entry.slide.cloneNode(true);
      clone.removeAttribute('id');
      clone.removeAttribute('data-deck-active');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      // Neuter heavy media; replace <video> with its poster so the box
      // keeps a visual. <iframe>/<audio> become empty placeholders.
      clone.querySelectorAll('iframe, audio, object, embed').forEach(el => {
        el.removeAttribute('src');
        el.removeAttribute('srcdoc');
        el.removeAttribute('data');
        el.innerHTML = '';
      });
      clone.querySelectorAll('video').forEach(el => {
        if (!el.poster) {
          el.removeAttribute('src');
          el.innerHTML = '';
          return;
        }
        const img = document.createElement('img');
        img.src = el.poster;
        img.alt = '';
        img.style.cssText = el.style.cssText + ';object-fit:cover;width:100%;height:100%;';
        img.className = el.className;
        el.replaceWith(img);
      });
      // Images: defer decode and let the browser pick the smallest
      // srcset candidate for the ~140px thumb. Same-URL clones reuse the
      // slide's decoded bitmap (URL-keyed cache), so the remaining cost
      // is paint/composite — lazy+async keeps that off the main thread.
      clone.querySelectorAll('img').forEach(el => {
        el.loading = 'lazy';
        el.decoding = 'async';
        if (el.srcset) el.sizes = (this._railPx || 188) + 'px';
      });
      // Custom elements inside the slide would have their
      // connectedCallback fire when the clone is appended. Replace them
      // with inert boxes so a component-heavy deck doesn't run N copies
      // of each component's mount logic in the rail. Children are
      // preserved so layout-wrapper elements (<my-column><h2>…</h2>)
      // still show their authored content; the querySelectorAll NodeList
      // is static, so nested custom elements in the moved subtree are
      // still visited on later iterations.
      const neuter = el => {
        const box = document.createElement('div');
        box.style.cssText = (el.getAttribute('style') || '') + ';background:rgba(0,0,0,0.06);border:1px dashed rgba(0,0,0,0.15);';
        box.className = el.className;
        // Preserve theming/i18n hooks so [data-*] / :lang() / [dir]
        // descendant selectors still match the neutered root.
        for (const a of el.attributes) {
          const n = a.name;
          if (n.startsWith('data-') || n.startsWith('aria-') || n === 'lang' || n === 'dir' || n === 'role' || n === 'title') {
            box.setAttribute(n, a.value);
          }
        }
        while (el.firstChild) box.appendChild(el.firstChild);
        return box;
      };
      // querySelectorAll('*') returns descendants only — a custom-element
      // slide root (<my-slide>…</my-slide>) would slip through and upgrade
      // on append. Swap the root first.
      if (clone.tagName.includes('-')) clone = neuter(clone);
      clone.querySelectorAll('*').forEach(el => {
        if (el.tagName.includes('-')) el.replaceWith(neuter(el));
      });
      clone.style.cssText += ';position:absolute;top:0;left:0;transform-origin:0 0;' + 'pointer-events:none;width:' + dw + 'px;height:' + dh + 'px;' + 'box-sizing:border-box;overflow:hidden;visibility:visible;opacity:1;';
      const host = document.createElement('div');
      host.style.cssText = 'position:absolute;inset:0;';
      this._syncThumbHostAttrs(host);
      const sr = host.attachShadow({
        mode: 'open'
      });
      if (this._adoptedSheet) sr.adoptedStyleSheets = [this._adoptedSheet];else {
        const st = document.createElement('style');
        st.textContent = this._authorCss || '';
        sr.appendChild(st);
      }
      sr.appendChild(clone);
      entry.frame.appendChild(host);
      entry.host = host;
      entry.clone = clone;
      if (this._thumbScale) clone.style.transform = 'scale(' + this._thumbScale + ')';
      // Once materialized the IO callback is a no-op early-return —
      // unobserve so scroll doesn't keep firing it.
      if (this._railObserver) this._railObserver.unobserve(entry.frame);
    }

    /** Re-clone a single thumb (live-update path). No-op if the thumb
     *  hasn't been materialized yet — it'll pick up current content when
     *  it scrolls into view. */
    _refreshThumb(slide) {
      const entry = (this._thumbs || []).find(t => t.slide === slide);
      if (!entry || !entry.host) return;
      entry.host.remove();
      entry.host = entry.clone = null;
      this._materialize(entry);
    }
    _scaleThumbs() {
      if (!this._thumbs || !this._thumbs.length) return;
      // Every frame is the same width; if it reads 0 the rail is
      // display:none (noscale / no-rail / presenting / print) — leave the
      // clones as-is and re-run when the rail is revealed.
      const fw = this._thumbs[0].frame.offsetWidth;
      if (!fw) return;
      this._thumbScale = fw / this.designWidth;
      this._thumbs.forEach(({
        clone
      }) => {
        if (clone) clone.style.transform = 'scale(' + this._thumbScale + ')';
      });
    }
    _setDrop(i, where) {
      // dragover fires at pointer-event rate; touch only the previous
      // and new target rather than sweeping all N thumbs.
      const t = this._thumbs && this._thumbs[i];
      if (this._dropOn && this._dropOn !== t) {
        this._dropOn.thumb.removeAttribute('data-drop');
      }
      if (t) t.thumb.setAttribute('data-drop', where);
      this._dropOn = t || null;
    }
    _clearDrop() {
      if (this._dropOn) this._dropOn.thumb.removeAttribute('data-drop');
      this._dropOn = null;
    }
    _syncRail(follow) {
      if (!this._thumbs) return;
      this._thumbs.forEach(({
        thumb
      }, i) => {
        if (i === this._index) {
          thumb.setAttribute('data-current', '');
          if (follow && typeof thumb.scrollIntoView === 'function') {
            thumb.scrollIntoView({
              block: 'nearest'
            });
          }
        } else {
          thumb.removeAttribute('data-current');
        }
      });
    }
    _openMenu(i, x, y) {
      if (!this._menu) return;
      this._menuIndex = i;
      const slide = this._slides[i];
      const skip = slide && slide.hasAttribute('data-deck-skip');
      this._menu.querySelector('[data-act="skip"]').textContent = skip ? 'Unskip slide' : 'Skip slide';
      this._menu.querySelector('[data-act="up"]').disabled = i <= 0;
      this._menu.querySelector('[data-act="down"]').disabled = i >= this._slides.length - 1;
      this._menu.querySelector('[data-act="delete"]').disabled = this._slides.length <= 1;
      // Place, then clamp to viewport after it's measurable.
      this._menu.style.left = x + 'px';
      this._menu.style.top = y + 'px';
      this._menu.setAttribute('data-open', '');
      const r = this._menu.getBoundingClientRect();
      const nx = Math.min(x, window.innerWidth - r.width - 4);
      const ny = Math.min(y, window.innerHeight - r.height - 4);
      this._menu.style.left = Math.max(4, nx) + 'px';
      this._menu.style.top = Math.max(4, ny) + 'px';
    }
    _closeMenu() {
      if (this._menu) this._menu.removeAttribute('data-open');
      this._menuIndex = -1;
    }
    _openConfirm(i) {
      if (!this._confirm) return;
      this._confirmIndex = i;
      this._confirm.querySelector('.title').textContent = 'Delete slide ' + (i + 1) + '?';
      this._confirm.setAttribute('data-open', '');
      const btn = this._confirm.querySelector('.danger');
      if (btn && btn.focus) btn.focus();
    }
    _closeConfirm() {
      if (this._confirm) this._confirm.removeAttribute('data-open');
      this._confirmIndex = -1;
    }
    _emitDeckChange(detail) {
      this.dispatchEvent(new CustomEvent('deckchange', {
        detail,
        bubbles: true,
        composed: true
      }));
    }
    _deleteSlide(i) {
      const slide = this._slides[i];
      if (!slide || this._slides.length <= 1) return;
      const wasCurrent = i === this._index;
      if (i < this._index || wasCurrent && i === this._slides.length - 1) this._index--;
      this._squelchSlotChange = true;
      slide.remove();
      this._emitDeckChange({
        action: 'delete',
        from: i,
        slide
      });
      this._collectSlides();
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason: 'mutation'
      });
    }
    _toggleSkip(i) {
      const slide = this._slides[i];
      if (!slide) return;
      const on = !slide.hasAttribute('data-deck-skip');
      if (on) slide.setAttribute('data-deck-skip', '');else slide.removeAttribute('data-deck-skip');
      if (this._thumbs && this._thumbs[i]) {
        if (on) this._thumbs[i].thumb.setAttribute('data-skip', '');else this._thumbs[i].thumb.removeAttribute('data-skip');
      }
      this._markLastVisible();
      this._emitDeckChange({
        action: on ? 'skip' : 'unskip',
        from: i,
        slide
      });
      // Re-broadcast so the presenter popup's prev/next thumbnails re-pick
      // the nearest non-skipped slide without waiting for a nav event.
      try {
        window.postMessage({
          slideIndexChanged: this._index,
          deckTotal: this._slides.length,
          deckSkipped: this._skippedIndices()
        }, '*');
      } catch (e) {}
    }
    _skippedIndices() {
      const out = [];
      for (let i = 0; i < this._slides.length; i++) {
        if (this._slides[i].hasAttribute('data-deck-skip')) out.push(i);
      }
      return out;
    }
    _moveSlide(i, j) {
      if (j < 0 || j >= this._slides.length || j === i) return;
      const slide = this._slides[i];
      const ref = j < i ? this._slides[j] : this._slides[j].nextSibling;
      // Track the active slide across the reorder so the same content
      // stays on screen.
      const cur = this._index;
      if (cur === i) this._index = j;else if (i < cur && j >= cur) this._index = cur - 1;else if (i > cur && j <= cur) this._index = cur + 1;
      this._squelchSlotChange = true;
      this.insertBefore(slide, ref);
      this._emitDeckChange({
        action: 'move',
        from: i,
        to: j,
        slide
      });
      this._collectSlides();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'mutation'
      });
    }

    // Public API ------------------------------------------------------------

    /** Current slide index (0-based). */
    get index() {
      return this._index;
    }
    /** Total slide count. */
    get length() {
      return this._slides.length;
    }
    /** Programmatically navigate. */
    goTo(i) {
      this._go(i, 'api');
    }
    next() {
      this._advance(1, 'api');
    }
    prev() {
      this._advance(-1, 'api');
    }
    reset() {
      this._go(0, 'api');
    }
  }
  if (!customElements.get('deck-stage')) {
    customElements.define('deck-stage', DeckStage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/deck-stage.js", error: String((e && e.message) || e) }); }

// ui_kits/basetool/components.jsx
try { (() => {
/* Profit Basetool — shared chrome components. Depends on Icon (icons.jsx). */
const {
  useState,
  useEffect,
  useCallback
} = React;
const LOGO_MARK = "../../assets/krt.webp";
function HudBox({
  children,
  className,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "hud-box" + (className ? " " + className : ""),
    style: style
  }, children);
}
function Btn({
  variant,
  children,
  onClick,
  type,
  disabled,
  icon,
  style
}) {
  const cls = "btn" + (variant ? " btn-" + variant : "");
  return /*#__PURE__*/React.createElement("button", {
    className: cls,
    onClick: onClick,
    type: type || "button",
    disabled: disabled,
    style: style
  }, icon ? /*#__PURE__*/React.createElement(Icon, {
    name: icon
  }) : null, children);
}
function Badge({
  variant,
  children
}) {
  const cls = "squadron-badge" + (variant ? " squadron-badge-" + variant : "");
  return /*#__PURE__*/React.createElement("span", {
    className: cls
  }, children);
}
function StatusPill({
  status
}) {
  const map = {
    PLANNED: "status-planned",
    ACTIVE: "status-active",
    COMPLETED: "status-completed",
    CANCELLED: "status-cancelled",
    CANCELED: "status-cancelled"
  };
  return /*#__PURE__*/React.createElement("span", {
    className: "status-pill " + (map[status] || "status-completed")
  }, status);
}
function Header({
  onHamburger,
  admin,
  activeSquadron
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("header", {
    className: "app-header" + (admin ? " admin" : "")
  }, /*#__PURE__*/React.createElement("button", {
    className: "hamburger",
    onClick: onHamburger,
    "aria-label": "Menu"
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null)), /*#__PURE__*/React.createElement("a", {
    className: "brand",
    href: "#",
    onClick: e => e.preventDefault()
  }, /*#__PURE__*/React.createElement("img", {
    src: LOGO_MARK,
    alt: "DAS KARTELL"
  }), /*#__PURE__*/React.createElement("span", {
    className: "logo-text"
  }, "Profit Basetool")), admin ? /*#__PURE__*/React.createElement("span", {
    className: "admin-chip"
  }, "Admin") : null), /*#__PURE__*/React.createElement("div", {
    className: "ctx-chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "Staffel"), /*#__PURE__*/React.createElement("span", {
    className: "val"
  }, activeSquadron || "IRI")));
}
const NAV_MAIN = [{
  id: "home",
  label: "Home"
}, {
  id: "missions",
  label: "Missions"
}, {
  id: "hangar",
  label: "Hangar"
}, {
  id: "materials",
  label: "Price Overview"
}];
const NAV_ADMIN = [{
  id: "members",
  label: "Member Management"
}, {
  id: "uex",
  label: "UEX Data"
}, {
  id: "settings",
  label: "System Settings"
}];
function Sidebar({
  open,
  onClose,
  current,
  onNavigate,
  onLogout
}) {
  const go = id => {
    onNavigate(id);
    onClose();
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sidebar" + (open ? " open" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "sidebar-content"
  }, /*#__PURE__*/React.createElement("button", {
    className: "close-sidebar",
    onClick: onClose,
    "aria-label": "Close"
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    className: "sidebar-links"
  }, NAV_MAIN.map(n => /*#__PURE__*/React.createElement("button", {
    key: n.id,
    className: "navlink" + (current === n.id ? " active" : ""),
    onClick: () => go(n.id)
  }, n.label)), /*#__PURE__*/React.createElement("div", {
    className: "sidebar-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grp-title"
  }, "Administration"), /*#__PURE__*/React.createElement("div", {
    className: "sidebar-sublinks"
  }, NAV_ADMIN.map(n => /*#__PURE__*/React.createElement("button", {
    key: n.id,
    className: "navlink" + (current === n.id ? " active" : ""),
    onClick: () => go(n.id)
  }, n.label)))), /*#__PURE__*/React.createElement("div", {
    className: "sidebar-group"
  }, /*#__PURE__*/React.createElement("button", {
    className: "navlink",
    onClick: onLogout
  }, "Logout"))))), /*#__PURE__*/React.createElement("div", {
    className: "sidebar-overlay" + (open ? " visible" : ""),
    onClick: onClose
  }));
}
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "app-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "links"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Impressum"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Datenschutz"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, "Nutzungsbedingungen")), /*#__PURE__*/React.createElement("span", {
    className: "ver"
  }, "DAS KARTELL \xB7 Profit Basetool \xB7 v1.4.3"));
}

/* Toast system ------------------------------------------------------------- */
function Toast({
  t
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "notification-toast toast-enter" + (t.error ? " error-toast" : "")
  }, /*#__PURE__*/React.createElement("h4", null, t.title), /*#__PURE__*/React.createElement("p", null, t.body));
}
function ToastViewport({
  toasts
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "toast-vp"
  }, toasts.map(t => /*#__PURE__*/React.createElement(Toast, {
    key: t.id,
    t: t
  })));
}
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((title, body, error) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, {
      id,
      title,
      body,
      error
    }]);
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 3200);
  }, []);
  return {
    toasts,
    push
  };
}
Object.assign(window, {
  HudBox,
  Btn,
  Badge,
  StatusPill,
  Header,
  Sidebar,
  Footer,
  Toast,
  ToastViewport,
  useToasts,
  NAV_MAIN,
  NAV_ADMIN
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/basetool/components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/basetool/data.jsx
try { (() => {
/* Profit Basetool — sample data for the kit (fictional, on-theme). */

const NEXT_MISSION = {
  id: 1,
  name: "Operation Tiefschlag",
  status: "PLANNED",
  description: "Coordinated quantanium run through Pyro — combat escort + refinery handover.",
  meetingTime: "29.05.2026, 18:45",
  startTime: "29.05.2026, 19:00",
  participants: "12/18"
};
const MISSIONS = [{
  id: 1,
  name: "Operation Tiefschlag",
  status: "PLANNED",
  start: "29.05.2026, 19:00",
  owner: "Valk",
  dept: "raumueberlegenheit",
  deptLabel: "Raumüberlegenheit",
  participants: "12/18"
}, {
  id: 2,
  name: "Aaron Halo Sweep",
  status: "ACTIVE",
  start: "28.05.2026, 20:30",
  owner: "Mara",
  dept: "profit",
  deptLabel: "Profit",
  participants: "6/8"
}, {
  id: 3,
  name: "Pyro Recon — Ghost Hollow",
  status: "PLANNED",
  start: "31.05.2026, 21:00",
  owner: "Hex",
  dept: "sub-radar",
  deptLabel: "Sub-Radar",
  participants: "3/6"
}, {
  id: 4,
  name: "Daymar Salvage Pull",
  status: "COMPLETED",
  start: "24.05.2026, 19:00",
  owner: "Dane",
  dept: "profit",
  deptLabel: "Profit",
  participants: "9/9"
}, {
  id: 5,
  name: "Refinery Convoy — ARC-L1",
  status: "COMPLETED",
  start: "22.05.2026, 18:00",
  owner: "Mara",
  dept: "search-rescue",
  deptLabel: "Search & Rescue",
  participants: "7/7"
}, {
  id: 6,
  name: "Checkmate Drill",
  status: "CANCELLED",
  start: "20.05.2026, 20:00",
  owner: "Valk",
  dept: "marinekorps",
  deptLabel: "Marinekorps",
  participants: "0/10"
}];
const SHIPS = [{
  id: 1,
  name: "Schwarze Witwe",
  type: "Constellation Andromeda",
  maker: "RSI",
  owner: "Valk",
  insurance: "LTI",
  location: "Area18 — ArcCorp",
  fitted: true
}, {
  id: 2,
  name: "Erntemaschine",
  type: "MOLE",
  maker: "Argo",
  owner: "Mara",
  insurance: "6 Months",
  location: "Lorville — Hurston",
  fitted: true
}, {
  id: 3,
  name: "Nadelöhr",
  type: "Vulture",
  maker: "Drake",
  owner: "Dane",
  insurance: "LTI",
  location: "GrimHEX — Yela",
  fitted: false
}, {
  id: 4,
  name: "Stiller Bote",
  type: "Hull C",
  maker: "MISC",
  owner: "Hex",
  insurance: "12 Months",
  location: "Everus Harbor",
  fitted: false
}, {
  id: 5,
  name: "Eisenfaust",
  type: "Hammerhead",
  maker: "Aegis",
  owner: "Valk",
  insurance: "LTI",
  location: "Seraphim Station",
  fitted: true
}, {
  id: 6,
  name: "Spürhund",
  type: "Terrapin",
  maker: "Anvil",
  owner: "Hex",
  insurance: "24 Months",
  location: "Area18 — ArcCorp",
  fitted: true
}];
const TERMINALS = [{
  name: "TDD Area18",
  planet: "ArcCorp"
}, {
  name: "Baijini Point",
  planet: "ArcCorp"
}, {
  name: "CRU-L1",
  planet: "Crusader"
}, {
  name: "Lorville TDD",
  planet: "Hurston"
}];
const MATERIALS = [{
  kind: "Metals",
  rows: [{
    name: "Laranite",
    prices: [3090, 2980, 3010, 2760]
  }, {
    name: "Agricium",
    prices: [2810, 2700, 2560, 2640]
  }, {
    name: "Titanium",
    prices: [null, 980, 920, 940]
  }]
}, {
  kind: "Gasses",
  rows: [{
    name: "Hydrogen",
    prices: [120, 110, null, 118]
  }, {
    name: "Chlorine",
    prices: [1580, 1490, 1520, null]
  }]
}, {
  kind: "High Value",
  rows: [{
    name: "Quantanium",
    prices: [29400, null, 28800, 27200],
    volatile: true
  }, {
    name: "Bexalite",
    prices: [42100, 41800, null, 40900]
  }]
}];
Object.assign(window, {
  NEXT_MISSION,
  MISSIONS,
  SHIPS,
  TERMINALS,
  MATERIALS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/basetool/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/basetool/icons.jsx
try { (() => {
/* KRT icon sprite + <Icon> — in-house 24px line set, currentColor. */
const KRT_SPRITE = /*#__PURE__*/React.createElement("svg", {
  className: "krt-icon-sprite",
  "aria-hidden": "true",
  style: {
    position: 'absolute',
    width: 0,
    height: 0
  }
}, /*#__PURE__*/React.createElement("symbol", {
  id: "krt-icon-close",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M6 6l12 12M18 6L6 18",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  fill: "none"
})), /*#__PURE__*/React.createElement("symbol", {
  id: "krt-icon-chevron-down",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M6 9l6 6 6-6",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none"
})), /*#__PURE__*/React.createElement("symbol", {
  id: "krt-icon-chevron-right",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M9 6l6 6-6 6",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none"
})), /*#__PURE__*/React.createElement("symbol", {
  id: "krt-icon-warning",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 3l10 18H2L12 3z",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinejoin: "round",
  fill: "none"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 10v5M12 18v0.01",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round"
})), /*#__PURE__*/React.createElement("symbol", {
  id: "krt-icon-success",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M5 12l5 5 9-11",
  stroke: "currentColor",
  strokeWidth: "2.5",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none"
})), /*#__PURE__*/React.createElement("symbol", {
  id: "krt-icon-info",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "9",
  stroke: "currentColor",
  strokeWidth: "2",
  fill: "none"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 11v6M12 7v0.01",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round"
})), /*#__PURE__*/React.createElement("symbol", {
  id: "krt-icon-plus",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 5v14M5 12h14",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round"
})), /*#__PURE__*/React.createElement("symbol", {
  id: "krt-icon-search",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "11",
  cy: "11",
  r: "6",
  stroke: "currentColor",
  strokeWidth: "2",
  fill: "none"
}), /*#__PURE__*/React.createElement("path", {
  d: "M20 20l-4-4",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round"
})), /*#__PURE__*/React.createElement("symbol", {
  id: "krt-icon-filter",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M4 5h16l-6 8v6l-4-2v-4z",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinejoin: "round",
  fill: "none"
})), /*#__PURE__*/React.createElement("symbol", {
  id: "krt-icon-edit",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M14 4l6 6-11 11H3v-6z",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinejoin: "round",
  fill: "none"
})), /*#__PURE__*/React.createElement("symbol", {
  id: "krt-icon-trash",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M5 7h14M9 7V4h6v3M7 7l1 14h8l1-14",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none"
})), /*#__PURE__*/React.createElement("symbol", {
  id: "krt-icon-ship",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 12l18-6-7 6 7 6-18-6z",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinejoin: "round",
  fill: "none"
})), /*#__PURE__*/React.createElement("symbol", {
  id: "krt-icon-mission",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "9",
  stroke: "currentColor",
  strokeWidth: "2",
  fill: "none"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 3v4M12 17v4M3 12h4M17 12h4",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round"
})), /*#__PURE__*/React.createElement("symbol", {
  id: "krt-icon-box",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinejoin: "round",
  fill: "none"
})));
function Icon({
  name,
  size,
  className
}) {
  const cls = "krt-icon" + (size === "lg" ? " krt-icon-lg" : size === "xl" ? " krt-icon-xl" : "") + (className ? " " + className : "");
  return /*#__PURE__*/React.createElement("svg", {
    className: cls,
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("use", {
    href: "#krt-icon-" + name
  }));
}
Object.assign(window, {
  KRT_SPRITE,
  Icon
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/basetool/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/basetool/screen-mission-detail.jsx
try { (() => {
/* Profit Basetool — Mission detail screen. Demonstrates the action hierarchy.
   Depends on components.jsx, data.jsx, icons.jsx. */
const {
  useState: useMD
} = React;
function Panel({
  id,
  title,
  count,
  defaultOpen,
  children
}) {
  const [open, setOpen] = useMD(defaultOpen !== false);
  return /*#__PURE__*/React.createElement("div", {
    className: "mcol" + (open ? "" : " collapsed")
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "panel-header",
    "aria-expanded": open,
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("h2", null, title, count != null ? /*#__PURE__*/React.createElement("span", {
    className: "panel-count"
  }, count) : null), /*#__PURE__*/React.createElement("span", {
    className: "toggle-icon",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: "col-body"
  }, children));
}
function MissionDetailScreen({
  push,
  onBack
}) {
  const [parts, setParts] = useMD([{
    id: 1,
    user: "cmdr.valk",
    org: "IRI",
    job: "Pilot",
    state: "in"
  }, {
    id: 2,
    user: "mara.k",
    org: "IRI",
    job: "Gunner",
    state: "out"
  }, {
    id: 3,
    user: "hex_07",
    org: null,
    job: "Medic",
    state: "pre"
  }]);
  const checkIn = id => {
    setParts(p => p.map(x => x.id === id ? {
      ...x,
      state: "in"
    } : x));
    push("Check-In", "Participant checked in.");
  };
  const del = id => {
    setParts(p => p.filter(x => x.id !== id));
    push("Action successful", "Participant removed.");
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "greeting hud-box",
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "1rem",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: "1.6rem"
    }
  }, "Einsatz: Operation Tiefschlag"), /*#__PURE__*/React.createElement("span", {
    className: "squadron-badge"
  }, "IRI"), /*#__PURE__*/React.createElement("span", {
    className: "status-pill status-planned",
    style: {
      marginLeft: "0.25rem"
    }
  }, "PLANNED")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: onBack
  }, "Zur\xFCck")), /*#__PURE__*/React.createElement("div", {
    className: "mission-cols"
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Details"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hud-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label-sm"
  }, "Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    defaultValue: "Operation Tiefschlag"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label-sm"
  }, "Beschreibung"), /*#__PURE__*/React.createElement("textarea", {
    rows: "2",
    defaultValue: "Quantanium-Run durch Pyro \u2014 Kampfeskorte + Raffinerie-\xDCbergabe."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "1rem",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      flex: 1,
      minWidth: 140
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label-sm"
  }, "Status"), /*#__PURE__*/React.createElement("select", {
    defaultValue: "PLANNED"
  }, /*#__PURE__*/React.createElement("option", null, "PLANNED"), /*#__PURE__*/React.createElement("option", null, "ACTIVE"), /*#__PURE__*/React.createElement("option", null, "COMPLETED"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      flex: 1,
      minWidth: 140
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label-sm"
  }, "Geplanter Start"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    defaultValue: "29.05.2026  19:00"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "hud-box detail-actions",
    style: {
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-quiet-danger",
    style: {
      marginRight: "auto"
    },
    onClick: () => push("Bestätigung", "Wirklich löschen?", true)
  }, "Delete"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: onBack
  }, "Zur\xFCck"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn--cta",
    onClick: () => push("Gespeichert", "Einsatz erfolgreich gespeichert.")
  }, "Speichern"))), /*#__PURE__*/React.createElement(Panel, {
    title: "Organisation"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hud-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kv-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kv-key"
  }, "Einsatzleiter"), /*#__PURE__*/React.createElement("span", {
    className: "data-value"
  }, "cmdr.valk")), /*#__PURE__*/React.createElement("div", {
    className: "kv-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kv-key"
  }, "Flottenfunk"), /*#__PURE__*/React.createElement("span", {
    className: "kv-right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "data-value data-value--mono"
  }, "123.450"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm2",
    onClick: () => push("Frequenz", "Bearbeiten…")
  }, "Edit"))), /*#__PURE__*/React.createElement("div", {
    className: "kv-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "kv-key"
  }, "Bodenfunk"), /*#__PURE__*/React.createElement("span", {
    className: "kv-right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "data-value data-value--mono"
  }, "88.200"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm2",
    onClick: () => push("Frequenz", "Bearbeiten…")
  }, "Edit"))))), /*#__PURE__*/React.createElement(Panel, {
    title: "Teilnehmer",
    count: parts.filter(p => p.state === "in").length + "/" + parts.length
  }, /*#__PURE__*/React.createElement("div", {
    className: "hud-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-toolbar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn--cta",
    onClick: () => push("Anmeldung", "Teilnehmer-Formular geöffnet.")
  }, "\uFF0B Anmelden")), /*#__PURE__*/React.createElement("table", {
    className: "mission-table",
    style: {
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Benutzer"), /*#__PURE__*/React.createElement("th", null, "Org"), /*#__PURE__*/React.createElement("th", null, "Aufgabe"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Aktion"))), /*#__PURE__*/React.createElement("tbody", null, parts.map(p => /*#__PURE__*/React.createElement("tr", {
    key: p.id
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 700
    }
  }, p.user), /*#__PURE__*/React.createElement("td", null, p.org ? /*#__PURE__*/React.createElement(Badge, null, p.org) : /*#__PURE__*/React.createElement(Badge, {
    variant: "muted"
  }, "\u2014")), /*#__PURE__*/React.createElement("td", null, p.job), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "act"
  }, p.state === "pre" ? /*#__PURE__*/React.createElement("button", {
    className: "btn btn-success btn-sm2",
    onClick: () => checkIn(p.id)
  }, "Check-In") : null, p.state === "in" ? /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm2",
    onClick: () => push("Check-Out", "Ausgecheckt.")
  }, "Check-Out") : null, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm2",
    onClick: () => push("Bearbeiten", "Teilnehmer bearbeiten…")
  }, "Edit"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-quiet-danger btn-sm2",
    onClick: () => del(p.id)
  }, "Delete"))))))))), /*#__PURE__*/React.createElement(Panel, {
    title: "Einheiten"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hud-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-toolbar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn--cta",
    onClick: () => push("Einheit", "Einheit hinzufügen…")
  }, "\uFF0B Hinzuf\xFCgen")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem"
    }
  }, [{
    n: "Schwarze Witwe",
    t: "Constellation Andromeda"
  }, {
    n: "Eisenfaust",
    t: "Hammerhead"
  }].map(u => /*#__PURE__*/React.createElement("div", {
    className: "unit-box",
    key: u.n
  }, /*#__PURE__*/React.createElement("div", {
    className: "unit-head"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "unit-name"
  }, u.n), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-gray-1)"
    }
  }, " \u2014 ", u.t)), /*#__PURE__*/React.createElement("div", {
    className: "detail-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline btn-sm2",
    onClick: () => push("Crew", "Crew zuweisen…")
  }, "Crew zuweisen"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm2",
    onClick: () => push("Bearbeiten", "Einheit bearbeiten…")
  }, "Edit"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-quiet-danger btn-sm2",
    onClick: () => push("Einheit", "Einheit gelöscht.")
  }, "Delete"))))))))));
}
Object.assign(window, {
  MissionDetailScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/basetool/screen-mission-detail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/basetool/screens.jsx
try { (() => {
/* Profit Basetool — screens. Depends on components.jsx, data.jsx, icons.jsx. */
const {
  useState: useS
} = React;
const fmt = n => n == null ? null : n.toLocaleString("de-DE");

/* ---------------------------------------------------------------- LOGIN --- */
function LoginScreen({
  onLogin
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "login-stage"
  }, /*#__PURE__*/React.createElement(HudBox, {
    className: "login-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "login-logo"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/krt.webp",
    alt: "DAS KARTELL"
  }), /*#__PURE__*/React.createElement("div", {
    className: "name"
  }, "Profit Basetool"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "IRIDIUM \xB7 Squadron Access")), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onLogin();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Username"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    defaultValue: "cmdr.valk",
    autoComplete: "username"
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Password"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    defaultValue: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    autoComplete: "current-password"
  })), /*#__PURE__*/React.createElement(Btn, {
    variant: null,
    type: "submit"
  }, "Sign in via Keycloak")), /*#__PURE__*/React.createElement("div", {
    className: "login-foot"
  }, "Access is reserved for members & approved guests.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onLogin();
    }
  }, "Create an order as guest \u2192"))));
}

/* ------------------------------------------------------------ DASHBOARD --- */
function Dashboard({
  onOpenMission
}) {
  const m = NEXT_MISSION;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "greeting"
  }, /*#__PURE__*/React.createElement("h1", null, "Welcome, Commander Valk"), /*#__PURE__*/React.createElement("p", null, "Central platform for mission planning and fleet management.")), /*#__PURE__*/React.createElement("div", {
    className: "dash-grid"
  }, /*#__PURE__*/React.createElement(HudBox, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      marginTop: 0
    }
  }, "Next Mission"), /*#__PURE__*/React.createElement("div", {
    className: "info-grid"
  }, /*#__PURE__*/React.createElement("strong", null, "Name:"), /*#__PURE__*/React.createElement("span", null, m.name), /*#__PURE__*/React.createElement("strong", null, "Status:"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(StatusPill, {
    status: m.status
  })), /*#__PURE__*/React.createElement("strong", null, "Description:"), /*#__PURE__*/React.createElement("span", null, m.description), /*#__PURE__*/React.createElement("strong", null, "Meeting (TS):"), /*#__PURE__*/React.createElement("span", null, m.meetingTime), /*#__PURE__*/React.createElement("strong", null, "Server Join:"), /*#__PURE__*/React.createElement("span", null, m.startTime), /*#__PURE__*/React.createElement("strong", null, "Participants:"), /*#__PURE__*/React.createElement("span", null, m.participants)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "1.25rem"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    onClick: () => onOpenMission()
  }, "Open Mission"))), /*#__PURE__*/React.createElement(HudBox, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      marginTop: 0
    }
  }, "Squadron Status"), /*#__PURE__*/React.createElement("div", {
    className: "stat-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat hud-box",
    style: {
      padding: "1rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, "18"), /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Active Pilots")), /*#__PURE__*/React.createElement("div", {
    className: "stat hud-box",
    style: {
      padding: "1rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, "42"), /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Ships in Hangar"))), /*#__PURE__*/React.createElement("div", {
    className: "stat-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat hud-box",
    style: {
      padding: "1rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, "7"), /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Open Job Orders")), /*#__PURE__*/React.createElement("div", {
    className: "stat hud-box",
    style: {
      padding: "1rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "n",
    style: {
      color: "var(--color-success)"
    }
  }, "2.4M"), /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Profit (30d, aUEC)"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "1rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "alert alert-warning",
    style: {
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "warning"
  }), " \xA0UEX price feed last synced 3h ago \u2014 refinery margins may be stale.")));
}

/* ------------------------------------------------------------- MISSIONS --- */
function MissionsScreen({
  push,
  onOpen
}) {
  const [q, setQ] = useS("");
  const [showPast, setShowPast] = useS(true);
  let rows = MISSIONS.filter(m => m.name.toLowerCase().includes(q.toLowerCase()));
  if (!showPast) rows = rows.filter(m => m.status === "PLANNED" || m.status === "ACTIVE");
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "page-head"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "section-title",
    style: {
      border: "none",
      marginBottom: 0
    }
  }, "Mission Management"), /*#__PURE__*/React.createElement(Btn, {
    icon: "plus",
    onClick: () => push("Action", "New mission form opened.")
  }, "New Mission")), /*#__PURE__*/React.createElement("div", {
    className: "toolbar",
    style: {
      marginTop: "1rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "search"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search"
  }), /*#__PURE__*/React.createElement("input", {
    type: "search",
    placeholder: "Enter mission name\u2026",
    value: q,
    onChange: e => setQ(e.target.value)
  })), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      gap: "0.5rem",
      alignItems: "center",
      color: "var(--color-gray-1)",
      fontSize: "0.9rem"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: showPast,
    onChange: e => setShowPast(e.target.checked)
  }), " Show past missions")), /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Mission"), /*#__PURE__*/React.createElement("th", null, "Department"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Server Join"), /*#__PURE__*/React.createElement("th", null, "Owner"), /*#__PURE__*/React.createElement("th", null, "Part."))), /*#__PURE__*/React.createElement("tbody", null, rows.map(m => /*#__PURE__*/React.createElement("tr", {
    key: m.id,
    style: {
      cursor: onOpen ? "pointer" : "default"
    },
    onClick: () => onOpen && onOpen(m.id)
  }, /*#__PURE__*/React.createElement("td", null, m.name), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "dept-tag",
    style: {
      color: "var(--color-dept-" + m.dept + ")"
    }
  }, m.deptLabel)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(StatusPill, {
    status: m.status
  })), /*#__PURE__*/React.createElement("td", null, m.start), /*#__PURE__*/React.createElement("td", null, m.owner), /*#__PURE__*/React.createElement("td", {
    className: "num-cell"
  }, m.participants))), rows.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "6",
    style: {
      textAlign: "center",
      fontStyle: "italic",
      color: "var(--color-gray-2)"
    }
  }, "No missions found.")) : null)));
}

/* --------------------------------------------------------------- HANGAR --- */
function HangarScreen({
  push
}) {
  const [ships, setShips] = useS(SHIPS);
  const toggle = id => setShips(p => p.map(s => s.id === id ? {
    ...s,
    fitted: !s.fitted
  } : s));
  const del = id => {
    setShips(p => p.filter(s => s.id !== id));
    push("Action successful", "Ship successfully deleted.");
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "page-head"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "section-title",
    style: {
      border: "none",
      marginBottom: 0
    }
  }, "Hangar"), /*#__PURE__*/React.createElement(Btn, {
    icon: "plus",
    onClick: () => push("Action", "Add-ship form opened.")
  }, "Add Ship")), /*#__PURE__*/React.createElement("table", {
    style: {
      marginTop: "1rem"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Ship Type"), /*#__PURE__*/React.createElement("th", null, "Maker"), /*#__PURE__*/React.createElement("th", null, "Owner"), /*#__PURE__*/React.createElement("th", null, "Insurance"), /*#__PURE__*/React.createElement("th", null, "Location"), /*#__PURE__*/React.createElement("th", null, "Fitted"), /*#__PURE__*/React.createElement("th", null, "Action"))), /*#__PURE__*/React.createElement("tbody", null, ships.map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.id
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 700
    }
  }, s.name), /*#__PURE__*/React.createElement("td", null, s.type), /*#__PURE__*/React.createElement("td", null, s.maker), /*#__PURE__*/React.createElement("td", null, s.owner), /*#__PURE__*/React.createElement("td", null, s.insurance === "LTI" ? /*#__PURE__*/React.createElement(Badge, null, "LTI") : s.insurance), /*#__PURE__*/React.createElement("td", {
    style: {
      color: "var(--color-gray-1)"
    }
  }, s.location), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "dot",
    onClick: () => toggle(s.id),
    role: "button",
    title: "Toggle fitted",
    style: {
      cursor: "pointer",
      background: s.fitted ? "var(--color-success)" : "var(--color-gray-2)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 8,
      fontSize: "0.8rem",
      color: s.fitted ? "var(--color-success)" : "var(--color-gray-2)"
    }
  }, s.fitted ? "Ready" : "Unfitted")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "row-action"
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: "Edit",
    onClick: () => push("Action", "Editing " + s.name + ".")
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit"
  })), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn danger",
    title: "Delete",
    onClick: () => del(s.id)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash"
  })))))))));
}

/* ------------------------------------------------------------ MATERIALS --- */
function MaterialsScreen() {
  const [collapsed, setCollapsed] = useS({});
  const toggle = k => setCollapsed(p => ({
    ...p,
    [k]: !p[k]
  }));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
    className: "section-title"
  }, "Price Overview"), /*#__PURE__*/React.createElement(HudBox, null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--color-gray-2)",
      fontSize: "0.85rem",
      marginTop: 0
    }
  }, "Sell prices in ", /*#__PURE__*/React.createElement("span", {
    className: "price-sell"
  }, "green (+)"), ", buy prices in ", /*#__PURE__*/React.createElement("span", {
    className: "price-buy"
  }, "red (\u2212)"), ", per terminal. Click a category to collapse."), /*#__PURE__*/React.createElement("div", {
    className: "hud-scroll scroll-x",
    style: {
      marginTop: "0.5rem"
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "matrix-table",
    style: {
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Commodity"), TERMINALS.map(t => /*#__PURE__*/React.createElement("th", {
    key: t.name,
    className: "num-cell",
    title: t.planet
  }, t.name)))), /*#__PURE__*/React.createElement("tbody", null, MATERIALS.map(grp => /*#__PURE__*/React.createElement(React.Fragment, {
    key: grp.kind
  }, /*#__PURE__*/React.createElement("tr", {
    className: "kind-row",
    onClick: () => toggle(grp.kind)
  }, /*#__PURE__*/React.createElement("td", {
    colSpan: TERMINALS.length + 1
  }, collapsed[grp.kind] ? "+" : "−", " \xA0", grp.kind)), !collapsed[grp.kind] && grp.rows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.name
  }, /*#__PURE__*/React.createElement("td", null, r.volatile ? /*#__PURE__*/React.createElement("span", {
    className: "text-warning",
    title: "Volatile",
    style: {
      marginRight: 6
    }
  }, "\u26A0") : null, r.name), r.prices.map((p, i) => /*#__PURE__*/React.createElement("td", {
    key: i,
    className: "num-cell"
  }, p == null ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-gray-3)"
    }
  }, "\u2013") : /*#__PURE__*/React.createElement("span", {
    className: "price-sell"
  }, "+", fmt(p)))))))))))));
}

/* --------------------------------------------------- ADMIN (light) -------- */
function MembersScreen() {
  const members = [{
    name: "Valk",
    roles: "Admin · Officer",
    sk: "—",
    status: "In Keycloak"
  }, {
    name: "Mara",
    roles: "Logistician",
    sk: "Vipers",
    status: "In Keycloak"
  }, {
    name: "Hex",
    roles: "Mission Manager",
    sk: "Vipers",
    status: "In Keycloak"
  }, {
    name: "Dane",
    roles: "Squadron Member",
    sk: "—",
    status: "In Keycloak"
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
    className: "section-title"
  }, "Member Management"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--color-gray-2)",
      fontSize: "0.9rem"
    }
  }, "Manage the members of your squadron."), /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Staffel Roles"), /*#__PURE__*/React.createElement("th", null, "SK"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Action"))), /*#__PURE__*/React.createElement("tbody", null, members.map(m => /*#__PURE__*/React.createElement("tr", {
    key: m.name
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 700
    }
  }, m.name), /*#__PURE__*/React.createElement("td", null, m.roles), /*#__PURE__*/React.createElement("td", null, m.sk === "—" ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-gray-3)"
    }
  }, "\u2014") : /*#__PURE__*/React.createElement(Badge, {
    variant: "sk"
  }, m.sk)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-success)",
      fontSize: "0.85rem"
    }
  }, m.status)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: "Edit"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "edit"
  }))))))));
}
function PlaceholderScreen({
  title,
  note
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
    className: "section-title"
  }, title), /*#__PURE__*/React.createElement(HudBox, null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--color-gray-2)",
      margin: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info"
  }), " \xA0", note)));
}
Object.assign(window, {
  LoginScreen,
  Dashboard,
  MissionsScreen,
  HangarScreen,
  MaterialsScreen,
  MembersScreen,
  PlaceholderScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/basetool/screens.jsx", error: String((e && e.message) || e) }); }

})();
