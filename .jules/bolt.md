
## 2024-05-20 - Modular Memoization for Chat History
**Learning:** For performance-critical list items in a chat app, extracting them into a separate modular component (e.g., `src/components/MessageItem.tsx`) and using `React.memo` is the most effective way to prevent O(N) re-renders during frequent state updates like typing. Stabilizing parent callbacks with `useCallback` is essential to maintain the memoization benefit.
**Action:** Follow a modular structure for UI components that require optimization, placing them in `src/components/` instead of inlining them in large page-level components.
