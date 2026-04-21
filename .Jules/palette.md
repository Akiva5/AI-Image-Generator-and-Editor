## 2025-05-14 - [Accessibility: Icon-only Buttons]
**Learning:** This AI Studio application uses many icon-only buttons (lucide-react) for critical actions like downloading, clearing history, and connecting integrations. These were missing ARIA labels, making them inaccessible to screen readers.
**Action:** Always verify that Lucide icon buttons have descriptive `aria-label` attributes, especially in toolbars and chat interfaces where icons are the primary interaction point.
