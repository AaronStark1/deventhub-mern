// Joins class names, skipping falsy values. No Tailwind conflict merging —
// none of the callers need it.
export const cx = (...parts) => parts.filter(Boolean).join(" ");
