export default function EventFilters({
  search,
  setSearch,
  type,
  setType,
  mode,
  setMode,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-10">

      {/* SEARCH */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search events..."
        className="
          flex-1 px-4 py-3 rounded-lg
          bg-surface dark:bg-surface-dark
          border border-black/10 dark:border-white/10
          outline-none
        "
      />

      {/* TYPE FILTER */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="
          px-4 py-3 rounded-lg
          bg-surface dark:bg-surface-dark
          border border-black/10 dark:border-white/10
        "
      >
        <option value="">All Types</option>
        <option value="Meetup">Meetup</option>
        <option value="Hackathon">Hackathon</option>
        <option value="Workshop">Workshop</option>
        <option value="Conference">Conference</option>
      </select>

      {/* MODE FILTER */}
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="
          px-4 py-3 rounded-lg
          bg-surface dark:bg-surface-dark
          border border-black/10 dark:border-white/10
        "
      >
        <option value="">All Modes</option>
        <option value="Online">Online</option>
        <option value="Offline">Offline</option>
      </select>
    </div>
  );
}
