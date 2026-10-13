export default function NotFound() {
  return (
    <div className="panel p-6">
      <h1 className="font-display text-xl">Not found</h1>
      <p className="text-sm text-text-secondary mt-2">
        The page you tried to open does not exist. Use the navigation rail or
        the link below to start a new investigation.
      </p>
      <a
        href="/"
        className="inline-block mt-4 px-3 py-1.5 text-sm rounded border border-border bg-surface hover:bg-surface-raised"
      >
        Back to investigate
      </a>
    </div>
  );
}