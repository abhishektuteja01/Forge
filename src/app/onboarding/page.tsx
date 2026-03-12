export default function OnboardingPlaceholder() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-8 text-center">
      <h1 className="mb-4 font-display text-4xl font-bold text-gray-900">
        Welcome to Forge
      </h1>
      <p className="mb-8 max-w-lg text-xl text-gray-500">
        This is the Onboarding setup. Let&apos;s forge your path.
      </p>

      {/* Visual cue to confirm we hit the correct route */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 font-medium text-indigo-700">
        (Onboarding Implementation Pending)
      </div>
    </div>
  );
}
