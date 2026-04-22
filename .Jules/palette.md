## 2025-05-14 - [Accessibility: Icon-only Buttons]
**Learning:** This AI Studio application uses many icon-only buttons (lucide-react) for critical actions like downloading, clearing history, and connecting integrations. These were missing ARIA labels, making them inaccessible to screen readers.
**Action:** Always verify that Lucide icon buttons have descriptive `aria-label` attributes, especially in toolbars and chat interfaces where icons are the primary interaction point.
## 2025-05-14 - [Accessibility: Hover vs Focus Overlays]
**Learning:** Using `group-hover:opacity-100` for action overlays (like download buttons on images) makes them inaccessible to keyboard users who cannot hover.
**Action:** Always pair `group-hover` with `group-focus-within` (or `group-focus`) to ensure overlays become visible when a child element (like a button) receives focus via keyboard navigation.
