# Poem Reading Surface Design

Date: 2026-08-16

## Goal

When a visitor opens a poem card, the experience should become a dedicated full-screen reading surface inspired by the hierarchy, density, borders, and interaction vocabulary of the provided “Podcast” reference. The reference could not be loaded in the available browser/search surfaces, so the implementation will use the user-provided direction without claiming exact reference CSS values.

The opened poem should feel like a focused mobile utility rather than a translucent gallery modal: legible, structured, responsive, and easy to navigate between poems.

## Visual direction

Use a near-white paper background with charcoal text, muted gray borders, and the existing amber accent. Keep interface text in the existing sans-serif family and reserve the existing serif family for the poem itself. Use compact metadata, clear top-level controls, restrained spacing, and thin bordered panels. Remove the atmospheric image overlay and glassmorphism from the opened state so reading remains high contrast and calm.

The memorable move is a bordered poem reading panel that behaves like a focused content module inside a full-screen utility surface. The gallery remains expressive; the open state becomes precise and readable.

## Structure

`Home` remains responsible for `selectedPoemIdx`, poem selection, and previous/next index calculations. `PoemModal` keeps its existing public props and becomes the full-screen reading surface so no changes are needed to poem data or the gallery card contract.

The reading surface contains:

1. A compact header with close, collection label, poem number, and previous/next controls.
2. A constrained content column with poem title and tagline metadata.
3. A bordered, scrollable poem panel containing stanza-separated poem lines.
4. Mobile navigation at the end of the reading content when desktop side navigation is unavailable.

## Interaction and accessibility

- Opening a poem locks background scrolling; closing restores the prior document scroll behavior.
- Escape closes the reading surface.
- Left and right arrow keys navigate when a previous or next poem exists.
- All actions remain real buttons with visible labels or accessible names.
- The close control and navigation controls have visible keyboard focus states.
- The reading surface exposes a clear accessible label based on the poem title.
- The poem panel remains readable at narrow widths and supports natural vertical scrolling on mobile.
- Reduced-motion users receive shorter/no transition movement through a `prefers-reduced-motion` override.

## Responsive behavior

- Mobile: full viewport reading surface, compact header, single-column content, and inline previous/next controls after the poem.
- Desktop: full viewport reading surface with a comfortable max-width reading column and previous/next controls in the header or side gutters.
- The poem body uses a readable line length and responsive type scale without requiring horizontal scrolling.

## Error and state handling

The existing `poem` nullable state remains the source of truth for whether the reading surface is mounted. If no poem is selected, nothing renders. Previous/next controls only render when their corresponding `hasPrev`/`hasNext` props are true. Switching poems keeps the surface open and animates the content change without resetting the overall reading context.

## Verification

Run `npm run typecheck` and `npm run build`. Inspect the opened state at mobile and desktop viewport sizes, checking contrast, scroll behavior, focus visibility, keyboard navigation, and that the gallery still opens the correct poem.
