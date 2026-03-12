export default function ScorecardPlaceholder() {
  return (
    <div className="m-4 flex h-[80vh] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
      <h1 className="mb-4 font-display text-4xl font-bold text-gray-900">
        The Scorecard
      </h1>
      <p className="mb-8 max-w-lg text-xl text-gray-500">
        Your daily inventory will live here.
      </p>

      {/* Visual cue to confirm we hit the correct route */}
      <div className="rounded-xl bg-gray-900 p-4 font-medium text-white">
        (Scorecard Implementation Pending)
      </div>
    </div>
  );
}
