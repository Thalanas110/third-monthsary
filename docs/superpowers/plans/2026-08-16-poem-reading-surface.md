# Poem Reading Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current atmospheric poem modal with a full-screen, responsive reading surface inspired by the supplied “Podcast” utility direction.

**Architecture:** Keep `Home` as the owner of poem selection and navigation state. Refactor `src/components/PoemModal.tsx` in place so its existing prop interface remains compatible, but render a structured full-screen surface with an accessible header, constrained poem content, and responsive navigation. Add only the global CSS needed for the light reading surface and reduced-motion behavior.

**Tech Stack:** React 19, TypeScript, Framer Motion, Lucide React, Tailwind CSS v4, Vite.

## Global Constraints

- The opened poem is a full-screen reading surface on all viewport sizes.
- Use a near-white paper background, charcoal text, muted gray borders, and the existing amber accent.
- Use sans-serif for interface text and serif for poem text.
- Remove the atmospheric image overlay and glassmorphism from the opened state.
- Keep the existing `PoemModal` props and poem data contract unchanged.
- Escape closes; left/right arrows navigate only when the corresponding poem exists.
- Use real buttons, visible focus states, accessible labels, and reduced-motion support.
- Verify with `npm run typecheck` and `npm run build`.

## Files and responsibilities

- Modify `src/components/PoemModal.tsx`: full-screen reading surface markup, navigation, keyboard behavior, focus behavior, and poem layout.
- Modify `src/index.css`: light reading-surface tokens/utilities and reduced-motion overrides that are shared by the modal.
- Do not modify `src/pages/Home.tsx`, `src/data/poems.ts`, or `src/components/PoemCard.tsx`; their existing interfaces already provide the required selected poem and navigation callbacks.

### Task 1: Replace modal presentation with the structured reading surface

**Files:**
- Modify: `src/components/PoemModal.tsx`

**Interfaces:**
- Consumes: `PoemModalProps` with `poem`, `onClose`, `onNext`, `onPrev`, `hasPrev`, and `hasNext`.
- Produces: a mounted reading surface with a `role="dialog"`, `aria-modal="true"`, accessible poem title, compact header, bordered poem panel, and responsive navigation.

- [ ] **Step 1: Preserve the existing prop interface and poem stanza grouping.**

Keep the current exported `PoemModalProps` fields and derive stanzas from `poem.content` by splitting on empty strings. This prevents changes to `Home` or `Poem` data.

- [ ] **Step 2: Remove the image overlay and old centered modal chrome.**

Delete the `bgImage` import and the absolute background-image layer. Replace the `fixed` wrapper with a full-height reading surface using `bg-[#f5f3ee]`/equivalent CSS, charcoal text, and a thin bottom border in the header.

- [ ] **Step 3: Add the compact reading header.**

Render a header with:

```tsx
<header className="reading-surface__header">
  <button type="button" aria-label="Close poem" onClick={onClose}>
    <X aria-hidden="true" />
    <span>Close</span>
  </button>
  <div aria-label="Collection and poem number">
    <span>Departures</span>
    <span>{poem.numeral} / IX</span>
  </div>
  <nav aria-label="Poem navigation">
    <button type="button" aria-label="Previous poem" onClick={onPrev} disabled={!hasPrev}>
      <ArrowLeft aria-hidden="true" />
    </button>
    <button type="button" aria-label="Next poem" onClick={onNext} disabled={!hasNext}>
      <ArrowRight aria-hidden="true" />
    </button>
  </nav>
</header>
```

Use visible text for the close action, accessible names for icon-only navigation, and disabled state styling for unavailable neighbors.

- [ ] **Step 4: Add title metadata and the bordered poem reading panel.**

Render the poem title as the dialog heading, the tagline as supporting metadata, and the poem lines inside a bordered panel. Keep stanza gaps explicit and use `whitespace-nowrap` only where it does not harm small screens; poem lines must wrap naturally on narrow viewports.

Use the following shape:

```tsx
<main className="reading-surface__main" aria-labelledby={`poem-title-${poem.id}`}>
  <div className="reading-surface__intro">
    <p>{poem.numeral}</p>
    <h2 id={`poem-title-${poem.id}`}>{poem.title}</h2>
    <p>{poem.tagline}</p>
  </div>
  <article className="reading-surface__poem" aria-label={`${poem.title} poem text`}>
    {stanzas.map((stanza, stanzaIndex) => (
      <div key={stanzaIndex}>
        {stanza.map((line, lineIndex) => <p key={`${stanzaIndex}-${lineIndex}`}>{line}</p>)}
      </div>
    ))}
  </article>
</main>
```

- [ ] **Step 5: Add responsive inline navigation.**

Render previous/next text buttons below the poem panel for narrow screens. Keep the desktop header navigation available at every width; the inline controls are a second, easier-to-reach mobile affordance and must use the same callbacks/disabled states.

- [ ] **Step 6: Run the typecheck after the component refactor.**

Run: `npm run typecheck`

Expected: TypeScript exits with code 0 and reports no errors.

### Task 2: Add keyboard, focus, scroll, and motion behavior

**Files:**
- Modify: `src/components/PoemModal.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: the same `PoemModalProps` callbacks and nullable poem state.
- Produces: Escape close, conditional arrow navigation, focus restoration, body-scroll restoration, and reduced-motion behavior.

- [ ] **Step 1: Add an effect that manages keyboard input while a poem is open.**

Use a `useEffect` with dependencies `[poem, onClose, onNext, onPrev, hasNext, hasPrev]`. When `poem` is null, return early. When open, listen for `keydown`; call `onClose` on `Escape`, `onPrev` on `ArrowLeft` when `hasPrev`, and `onNext` on `ArrowRight` when `hasNext`. Ignore key events originating from editable elements.

- [ ] **Step 2: Preserve and restore document scroll state.**

When opening, capture `document.body.style.overflow`, set it to `hidden`, and restore the captured value in cleanup. Do not overwrite unrelated body styles.

- [ ] **Step 3: Focus the close button on open and restore the previously focused element on close.**

Use a `closeButtonRef`. Before locking the surface, capture `document.activeElement` if it is an `HTMLElement`. After the modal content mounts, focus the close button. In cleanup, restore focus when the previous element is still connected. Keep the focus operation guarded so SSR/test environments without a DOM do not fail.

- [ ] **Step 4: Add CSS for consistent focus, disabled, responsive, and motion states.**

In `src/index.css`, add narrowly scoped `.reading-surface` classes for:

```css
.reading-surface button:focus-visible {
  outline: 2px solid #b56b2a;
  outline-offset: 4px;
}

.reading-surface button:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

@media (prefers-reduced-motion: reduce) {
  .reading-surface *,
  .reading-surface *::before,
  .reading-surface *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

Keep all colors within the approved near-white/charcoal/gray/amber system and avoid adding a second visual direction.

- [ ] **Step 5: Run typecheck and build.**

Run: `npm run typecheck; npm run build`

Expected: both commands exit with code 0.

### Task 3: Verify the responsive reading experience

**Files:**
- Verify: `src/components/PoemModal.tsx`
- Verify: `src/index.css`

**Interfaces:**
- Consumes: the built Vite application.
- Produces: evidence that card opening, reading, navigation, close behavior, and responsive layout work at mobile and desktop sizes.

- [ ] **Step 1: Start the local Vite server.**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite reports a local URL without compilation errors.

- [ ] **Step 2: Inspect the opened state at a mobile viewport.**

Open the home page, select a poem card, and verify that the reading surface fills the viewport, the header remains visible, poem lines wrap without horizontal scrolling, and inline previous/next controls are reachable after the poem.

- [ ] **Step 3: Inspect the opened state at a desktop viewport.**

Verify that the content column is comfortably constrained, the bordered poem panel is visually distinct, the header navigation is available, and the surface no longer shows the atmospheric image/glassmorphism treatment.

- [ ] **Step 4: Verify keyboard and focus behavior.**

With a poem open, press Escape to close, reopen it and press ArrowRight/ArrowLeft where available, and tab through controls to confirm the focus ring is visible. Confirm the close button receives focus when the surface opens.

- [ ] **Step 5: Run final verification.**

Run: `npm run typecheck; npm run build; git diff --check`

Expected: all commands exit with code 0 and `git diff --check` reports no whitespace errors.

