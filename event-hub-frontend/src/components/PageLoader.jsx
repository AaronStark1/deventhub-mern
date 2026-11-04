// Shown while a lazily-loaded page's code is downloading. Tall enough that
// the footer doesn't jump up into view for a split second.
export default function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-muted dark:text-muted-dark">Loading…</p>
    </div>
  );
}
