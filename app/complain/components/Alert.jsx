'use client';

export default function Alert({ feedback, alertProgress, onDismiss }) {
  if (!feedback) return null;

  return (
    <>
      {/* Blurred Background Overlay */}
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={onDismiss} />
      
      {/* Centered Alert */}
      <div
        className={`fixed left-1/2 top-1/2 z-[65] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl sm:rounded-2xl border border-[rgba(79,163,227,0.35)] bg-[rgba(16,18,31,0.95)] p-6 sm:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3 sm:gap-5">
          <span
            className={`mt-0.5 inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full text-xl sm:text-2xl font-semibold ${
              feedback.type === 'success'
                ? 'bg-[rgba(39,174,96,0.2)] text-[#27AE60]'
                : 'bg-[rgba(211,84,0,0.2)] text-[#D35400]'
            }`}
          >
            {feedback.type === 'success' ? '✓' : '!'}
          </span>
          <div className="flex-1">
            <p className="text-base sm:text-lg font-semibold tracking-wide text-[#F2F6FF]">
              {feedback.type === 'success' ? 'Ticket Submitted' : 'Submission Failed'}
            </p>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-[#A9B0D6]">{feedback.message}</p>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 sm:h-2 bg-[rgba(79,163,227,0.1)]">
          <div
            className={`h-full transition-all duration-75 ease-linear ${
              feedback.type === 'success'
                ? 'bg-[#27AE60]'
                : 'bg-[#D35400]'
            }`}
            style={{ width: `${alertProgress}%` }}
          />
        </div>
      </div>
    </>
  );
}

