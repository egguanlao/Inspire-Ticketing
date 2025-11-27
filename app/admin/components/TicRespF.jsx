'use client';

import { useEffect } from 'react';

const SEVERITY_COLORS = {
  Low: 'text-emerald-200 border-emerald-400/50 bg-emerald-500/20',
  Medium: 'text-amber-200 border-amber-400/50 bg-amber-500/20',
  High: 'text-orange-200 border-orange-400/50 bg-orange-500/20',
  Critical: 'text-rose-100 border-[#8B1E3F]/60 bg-[#8B1E3F]/35',
};

export default function TicRespF({
  ticket,
  formData,
  isLoading,
  isSaving,
  error,
  feedback,
  handleChange,
  handleSubmit,
  normalizeStatus,
  onClose,
  isModal = false,
}) {
  const autofillStyles = (
    <style jsx global>{`
      input[data-autofill='admin-primary']:-webkit-autofill,
      input[data-autofill='admin-primary']:-webkit-autofill:hover,
      input[data-autofill='admin-primary']:-webkit-autofill:focus,
      input[data-autofill='admin-primary']:-webkit-autofill:active,
      textarea[data-autofill='admin-primary']:-webkit-autofill,
      textarea[data-autofill='admin-primary']:-webkit-autofill:hover,
      textarea[data-autofill='admin-primary']:-webkit-autofill:focus,
      textarea[data-autofill='admin-primary']:-webkit-autofill:active {
        -webkit-text-fill-color: #f2f6ff !important;
        color: #f2f6ff !important;
        caret-color: #f2f6ff;
        -webkit-box-shadow: 0 0 0 1000px rgba(12, 15, 26, 0.92) inset;
        box-shadow: 0 0 0 1000px rgba(12, 15, 26, 0.92) inset;
        transition: background-color 5000s ease-in-out 0s;
      }
    `}</style>
  );

  if (isLoading) {
    return (
      <>
        {autofillStyles}
        <div className="rounded-2xl border border-[rgba(79,163,227,0.3)] bg-[rgba(19,22,38,0.85)] px-6 py-8 text-center text-[#A9B0D6]">
          Loading ticket details…
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {autofillStyles}
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-6 text-center text-sm text-red-200">
          {error}
        </div>
      </>
    );
  }

  if (!ticket) {
    return (
      <>
        {autofillStyles}
        <div className="rounded-2xl border border-[rgba(79,163,227,0.3)] bg-[rgba(19,22,38,0.85)] px-6 py-8 text-center text-[#A9B0D6]">
          Ticket data unavailable.
        </div>
      </>
    );
  }

  const normalizedStatus = normalizeStatus(ticket.status);
  const isResolved = normalizedStatus === 'resolved';
  const resolvedDate = ticket.closedAt ? new Date(ticket.closedAt).toLocaleString() : null;

  const formContent = (
    <>
      {feedback && (
        <div
          className={`rounded-2xl border px-6 py-4 text-sm mb-6 ${
            feedback.type === 'success'
              ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
              : 'border-red-500/40 bg-red-500/10 text-red-100'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-6 rounded-2xl border border-[rgba(79,163,227,0.3)] bg-[rgba(19,22,38,0.9)] px-8 py-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#F2F6FF]">Support Response Log</h2>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7D8FEA]">
                Status
              </label>
              <button
                type="button"
                onClick={() => {
                  if (!isResolved && handleChange) {
                    const newStatus = formData.status === 'resolved' ? 'unresolved' : 'resolved';
                    handleChange({ target: { name: 'status', value: newStatus } });
                  }
                }}
                disabled={isResolved}
                className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6E63C6] focus:ring-offset-2 focus:ring-offset-[rgba(12,15,26,0.92)] disabled:cursor-not-allowed disabled:opacity-50 ${
                  formData.status === 'resolved'
                    ? 'bg-[#4CFF7C]/20 text-[#4CFF7C] border-[#4CFF7C]/50 hover:bg-[#4CFF7C]/30 hover:border-[#4CFF7C]/70'
                    : 'bg-[#FF4C4C]/20 text-[#FF4C4C] border-[#FF4C4C]/50 hover:bg-[#FF4C4C]/30 hover:border-[#FF4C4C]/70'
                } ${!isResolved ? 'cursor-pointer' : ''}`}
              >
                {formData.status === 'resolved' ? 'Resolved' : 'Unresolved'}
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7D8FEA]">
                Name of Support Agent
              </label>
              <input
                data-autofill="admin-primary"
                type="text"
                name="supportAgentName"
                value={formData.supportAgentName}
                onChange={isResolved ? undefined : handleChange}
                autoComplete="name"
                className="w-full rounded-2xl border border-[rgba(79,163,227,0.35)] bg-[rgba(12,15,26,0.92)] px-4 py-3 text-sm text-[#F2F6FF] placeholder:text-[#A9B0D6] focus:border-[#6E63C6] focus:outline-none focus:ring-2 focus:ring-[#6E63C6]"
                placeholder="Enter the name of the support agent"
                required
                readOnly={isResolved}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7D8FEA]">
                Situation when approached by support personnel
              </label>
              <textarea
                data-autofill="admin-primary"
                name="situation"
                value={formData.situation}
                onChange={isResolved ? undefined : handleChange}
                rows={4}
                autoComplete="off"
                className="w-full rounded-2xl border border-[rgba(79,163,227,0.35)] bg-[rgba(12,15,26,0.92)] px-4 py-3 text-sm text-[#F2F6FF] placeholder:text-[#A9B0D6] focus:border-[#6E63C6] focus:outline-none focus:ring-2 focus:ring-[#6E63C6]"
                placeholder="Describe what the user reported when the support team arrived…"
                required
                readOnly={isResolved}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7D8FEA]">
                Solution (What the support personnel did)
              </label>
              <textarea
                data-autofill="admin-primary"
                name="solution"
                value={formData.solution}
                onChange={isResolved ? undefined : handleChange}
                rows={4}
                autoComplete="off"
                className="w-full rounded-2xl border border-[rgba(79,163,227,0.35)] bg-[rgba(12,15,26,0.92)] px-4 py-3 text-sm text-[#F2F6FF] placeholder:text-[#A9B0D6] focus:border-[#6E63C6] focus:outline-none focus:ring-2 focus:ring-[#6E63C6]"
                placeholder="Document the troubleshooting steps or fix applied…"
                required
                readOnly={isResolved}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-[rgba(79,163,227,0.35)] bg-transparent px-6 py-3 text-sm font-semibold text-[#F2F6FF] transition hover:border-[rgba(79,163,227,0.55)] hover:bg-[rgba(79,163,227,0.18)]"
              >
                {isModal ? 'Close' : 'Back'}
              </button>
              {!isResolved && (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4B4F8F] via-[#6E63C6] to-[#4FA3E3] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(79,163,227,0.35)] transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#4FA3E3] focus:ring-offset-2 focus:ring-offset-[#0F0F0F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? 'Saving…' : 'Save ticket update'}
                </button>
              )}
            </div>
          </form>
        </section>

        <aside className="space-y-6 rounded-2xl border border-[rgba(79,163,227,0.3)] bg-[rgba(19,22,38,0.9)] px-7 py-7 text-sm text-[#C5CCE6]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D8FEA]">Requester</p>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#F2F6FF]">
              <span className="text-lg font-semibold">{ticket.name}</span>
              <span className="rounded-full border border-[rgba(79,163,227,0.35)] bg-[rgba(79,163,227,0.12)] px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-[#A9B0D6]">
                {ticket.department || 'Unassigned'}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D8FEA]">Category</p>
              <p className="mt-1 text-sm font-medium text-[#F2F6FF]">{ticket.category}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D8FEA]">Severity</p>
              <span
                className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                  SEVERITY_COLORS[ticket.severity] ?? 'border-[#4FA3E3]/40 text-[#F2F6FF]'
                }`}
              >
                {ticket.severity}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D8FEA]">Submitted</span>
            <p className="mt-2 text-sm text-[#A9B0D6]">
              {ticket.submittedAtLocal ??
                (ticket.submittedAt && typeof ticket.submittedAt.toDate === 'function'
                  ? ticket.submittedAt.toDate().toLocaleString()
                  : 'Unknown')}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D8FEA]">Details</span>
            <p className="mt-2 whitespace-pre-wrap text-sm text-[#C5CCE6]">{ticket.details}</p>
          </div>

          {resolvedDate && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D8FEA]">
                Resolved
              </span>
              <p className="mt-1 text-2xl font-semibold text-[#F2F6FF]">{resolvedDate}</p>
            </div>
          )}
        </aside>
      </div>
    </>
  );

  // If used as modal, return just the content without full page wrapper
  if (isModal) {
    return (
      <>
        {autofillStyles}
        <div className="rounded-2xl border border-[rgba(79,163,227,0.35)] bg-[rgba(18,21,36,0.9)] p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold uppercase tracking-[0.35em] text-[#6E86E0]">
              Ticket Response Form
            </h1>
          </div>
          {formContent}
        </div>
      </>
    );
  }

  // If used as standalone page, return with full page wrapper
  return (
    <>
      {autofillStyles}
      <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#08090E] px-6 py-10 text-[#F2F6FF]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(110,99,198,0.18),rgba(8,9,14,0)_55%)]"
      />
      <div className="absolute top-16 right-10 h-72 w-72 rounded-full bg-[#4FA3E3]/30 blur-[140px]" />
      <div className="absolute bottom-16 left-12 h-80 w-80 rounded-full bg-[#6E63C6]/35 blur-[170px]" />

      <section className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col gap-6">
        <header className="rounded-[28px] border border-[rgba(79,163,227,0.35)] bg-[rgba(18,21,36,0.88)] p-[1px] shadow-[0_25px_70px_rgba(11,14,31,0.6)] backdrop-blur">
          <div className="flex flex-col items-center rounded-[26px] border border-[rgba(79,163,227,0.25)] bg-[rgba(12,15,26,0.92)] px-10 py-10 text-center">
            <p className="text-2xl font-semibold uppercase tracking-[0.35em] text-[#6E86E0]">
              Ticket Response Form
            </p>
          </div>
        </header>
        {formContent}
      </section>
    </main>
    </>
  );
}

