
## 2024-05-20 - Memoization for Chat History
**Learning:** In a chat application where typing in the input field triggers re-renders of the entire App component, the entire chat history re-renders every keystroke. Extracting the message item into a `React.memo` component and stabilizing callbacks with `useCallback` prevents this O(N) re-render cost.
**Action:** Always extract items in long lists into memoized components if the parent state changes frequently (e.g., controlled inputs).
