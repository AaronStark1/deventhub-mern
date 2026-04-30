export default function EventPagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  return (
    <div className="flex justify-center gap-2 mt-12">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
        (page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              w-10 h-10 rounded-full
              transition
              ${
                currentPage === page
                  ? "bg-primary text-white"
                  : "bg-surface dark:bg-surface-dark hover:bg-primary hover:text-white"
              }
            `}
          >
            {page}
          </button>
        )
      )}
    </div>
  );
}
