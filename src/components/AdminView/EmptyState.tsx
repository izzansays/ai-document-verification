export function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center text-gray-500">
        <svg
          className="mx-auto mb-4 h-16 w-16 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>Document icon</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg">Select a claim to view details</p>
      </div>
    </div>
  );
}
