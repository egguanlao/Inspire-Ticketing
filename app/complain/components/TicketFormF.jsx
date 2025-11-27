'use client';

import { useEffect } from 'react';
import {
  CATEGORY_OPTIONS,
  SEVERITY_OPTIONS,
  severityColors,
  stepOrder,
} from './TicketFormB';
import LoadingOverlay from './LoadingOverlay';
import Alert from './Alert';

export default function TicketFormF({
  // State
  userDetails,
  category,
  otherCategoryDetails,
  severity,
  details,
  detailsError,
  feedback,
  alertProgress,
  activeStep,
  isSubmitting,
  // Validation
  isUserDetailsValid,
  isCategoryValid,
  isSeverityValid,
  isDetailsValid,
  // Handlers
  handleUserDetailsChange,
  handleDetailsChange,
  handleOtherCategoryDetailsChange,
  setCategory,
  setOtherCategoryDetails,
  setSeverity,
  resetForm,
  dismissFeedback,
  isStepAccessible,
  handleStepChange,
  handleCardKeyDown,
  isNextDisabled,
  handleBack,
  handleNext,
  // Helpers
  getSeverityHighlightStyles,
  categorySummary,
  severitySummary,
  nextLabel,
}) {
  const autofillStyles = (
    <style jsx global>{`
      input[data-autofill],
      textarea[data-autofill] {
        -webkit-text-fill-color: #f2f6ff !important;
        color: #f2f6ff !important;
        caret-color: #f2f6ff;
        transition: background-color 5000s ease-in-out 0s;
      }

      input[data-autofill='ticket-primary']:-webkit-autofill,
      textarea[data-autofill='ticket-primary']:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 1000px rgba(27, 30, 56, 0.85) inset;
        box-shadow: 0 0 0 1000px rgba(27, 30, 56, 0.85) inset;
      }

      input[data-autofill='ticket-secondary']:-webkit-autofill,
      textarea[data-autofill='ticket-secondary']:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 1000px rgba(16, 18, 31, 0.9) inset;
        box-shadow: 0 0 0 1000px rgba(16, 18, 31, 0.9) inset;
      }
    `}</style>
  );

  // Inject global styles for autofill text color
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active,
      textarea:-webkit-autofill,
      textarea:-webkit-autofill:hover,
      textarea:-webkit-autofill:focus,
      textarea:-webkit-autofill:active {
        -webkit-text-fill-color: #F2F6FF !important;
        color: #F2F6FF !important;
      }
    `;
    style.setAttribute('data-autofill-fix', 'true');
    if (!document.head.querySelector('style[data-autofill-fix]')) {
      document.head.appendChild(style);
    }
  }, []);

  const isCardActive = (step) => activeStep === step;

  const getCardClasses = (step) => {
    const base =
      'group relative flex h-full flex-col items-start gap-3 rounded-2xl border px-5 py-5 text-left transition focus:outline-none focus:ring-2 focus:ring-[#4FA3E3] focus:ring-offset-2 focus:ring-offset-[#0F0F0F]';
    const activeClass =
      'border-[rgba(79,163,227,0.6)] bg-[rgba(79,163,227,0.18)] shadow-[0_0_25px_rgba(79,163,227,0.3)]';
    const inactiveClass =
      'border-[rgba(79,163,227,0.35)] bg-[rgba(79,163,227,0.08)] hover:border-[rgba(79,163,227,0.55)] hover:bg-[rgba(79,163,227,0.15)]';
    const disabledClass = isStepAccessible(step)
      ? 'cursor-pointer'
      : 'cursor-not-allowed opacity-40 pointer-events-none';
    return `${base} ${isCardActive(step) ? activeClass : inactiveClass} ${disabledClass}`;
  };

  const renderUserDetailsSection = () => (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-[#F2F6FF]">
          Name
        </label>
        <input
          data-autofill="ticket-primary"
          id="name"
          name="name"
          type="text"
          value={userDetails.name}
          onChange={handleUserDetailsChange}
          placeholder="Enter your full name"
          autoComplete="name"
          className="w-full rounded-2xl border border-[rgba(104,110,161,0.55)] bg-[rgba(27,30,56,0.85)] px-5 py-4 text-sm text-[#F2F6FF] placeholder:text-[#A9B0D6] focus:outline-none focus:ring-2 focus:ring-[#4FA3E3]"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="department" className="text-sm font-medium text-[#F2F6FF]">
          Department
        </label>
        <input
          data-autofill="ticket-primary"
          id="department"
          name="department"
          type="text"
          value={userDetails.department}
          onChange={handleUserDetailsChange}
          placeholder="Enter your department"
          autoComplete="organization"
          className="w-full rounded-2xl border border-[rgba(104,110,161,0.55)] bg-[rgba(27,30,56,0.85)] px-5 py-4 text-sm text-[#F2F6FF] placeholder:text-[#A9B0D6] focus:outline-none focus:ring-2 focus:ring-[#4FA3E3]"
          required
        />
      </div>
    </div>
  );

  const renderCategorySection = () => (
    <>
      <p className="text-sm text-[#A9B0D6]">
        Choose the area that best matches the problem you experienced.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {CATEGORY_OPTIONS.map((option) => (
          <label
            key={option}
            className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border border-[rgba(79,163,227,0.35)] bg-[rgba(79,163,227,0.08)] px-4 py-4 transition hover:border-[rgba(79,163,227,0.6)] hover:bg-[rgba(79,163,227,0.18)] ${
              category === option ? 'ring-2 ring-[#4FA3E3]' : ''
            }`}
          >
            <input
              type="radio"
              name="category"
              value={option}
              checked={category === option}
              onChange={() => setCategory(option)}
              className="sr-only"
            />
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(79,163,227,0.4)] bg-[rgba(79,163,227,0.2)] text-sm font-semibold text-[#F2F6FF]">
              {option.slice(0, 1)}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#F2F6FF]">{option}</p>
              <p className="text-xs text-[#A9B0D6]">
                {option === 'Hardware'
                  ? 'Device issues like not opening, not clicking, etc.'
                  : option === 'Software'
                  ? "Outdated apps, can't download or upload, etc."
                  : option === 'Network'
                  ? 'WiFi connection issues.'
                  : option === 'Printer'
                  ? "Can't print, can't detect printer, etc."
                  : 'Custom category—share context below.'}
              </p>
            </div>
          </label>
        ))}
      </div>

      {category === 'Others' && (
        <div className="rounded-xl border border-[rgba(79,163,227,0.35)] bg-[rgba(27,30,56,0.85)] p-4">
          <label htmlFor="otherCategory" className="text-sm font-medium text-[#F2F6FF]">
            Custom category details
          </label>
          <input
            data-autofill="ticket-secondary"
            id="otherCategory"
            type="text"
            value={otherCategoryDetails}
            onChange={handleOtherCategoryDetailsChange}
            maxLength={25}
            autoComplete="off"
            className="mt-2 w-full rounded-lg border border-[rgba(79,163,227,0.4)] bg-[rgba(16,18,31,0.9)] px-4 py-3 text-sm text-[#F2F6FF] placeholder:text-[#A9B0D6] focus:outline-none focus:ring-2 focus:ring-[#4FA3E3]"
            placeholder="Provide the specific system or workflow impacted"
            required
          />
          <div className="mt-2 flex items-center justify-between text-xs text-[#A9B0D6]">
            <span></span>
            <span>{otherCategoryDetails.length}/25</span>
          </div>
        </div>
      )}
    </>
  );

  const renderSeveritySection = () => (
    <>
      <p className="text-sm text-[#A9B0D6]">How urgent is the issue?</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {SEVERITY_OPTIONS.map((level) => (
          <label
            key={level}
            className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-[rgba(79,163,227,0.35)] bg-[rgba(79,163,227,0.08)] px-4 py-4 text-sm font-medium uppercase tracking-wide transition hover:border-[rgba(79,163,227,0.6)] hover:bg-[rgba(79,163,227,0.18)]"
            style={getSeverityHighlightStyles(level, severity === level)}
          >
            <input
              type="radio"
              name="severity"
              value={level}
              checked={severity === level}
              onChange={() => setSeverity(level)}
              className="sr-only"
            />
            <span className="text-xs text-[#A9B0D6]">Priority</span>
            <span
              className="text-base font-semibold text-[#F2F6FF] transition"
              style={severity === level ? { color: severityColors[level] } : undefined}
            >
              {level}
            </span>
          </label>
        ))}
      </div>
    </>
  );

  const renderDetailsSection = () => (
    <>
      <div>
        <label htmlFor="details" className="text-sm font-medium text-[#F2F6FF]">
          Enter the details of concern
        </label>
        <textarea
          data-autofill="ticket-primary"
          id="details"
          value={details}
          onChange={handleDetailsChange}
          maxLength={150}
          autoComplete="off"
          className={`mt-3 h-32 w-full rounded-xl border ${
            detailsError
              ? 'border-red-400 ring-2 ring-red-500/40'
              : 'border-[rgba(79,163,227,0.35)] focus:ring-[#4FA3E3]'
          } bg-[rgba(27,30,56,0.85)] px-4 py-3 text-sm text-[#F2F6FF] placeholder:text-[#A9B0D6] focus:outline-none`}
          placeholder="Describe the issue in 150 characters or less..."
          required
        />
        <div className="mt-2 flex items-center justify-between text-xs text-[#A9B0D6]">
          <span className={detailsError ? 'text-red-400' : ''}>{detailsError}</span>
          <span>{details.length}/150</span>
        </div>
      </div>
    </>
  );

  const renderSummarySection = () => (
    <div className="space-y-6 text-sm text-[#A9B0D6]">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-[#A9B0D6]">
            Name
          </span>
          <span className="mt-2 block text-xl font-semibold text-[#F2F6FF]">
            {userDetails.name || '—'}
          </span>
        </div>
        <div>
          <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-[#A9B0D6]">
            Department
          </span>
          <span className="mt-2 block text-xl font-semibold text-[#F2F6FF]">
            {userDetails.department || '—'}
          </span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-[#A9B0D6]">
            Category
          </span>
          <span className="mt-2 block text-xl font-semibold text-[#F2F6FF]">
            {categorySummary}
          </span>
        </div>
        <div>
          <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-[#A9B0D6]">
            Severity
          </span>
          <span
            className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xl font-semibold"
            style={
              severity
                ? {
                    color: severityColors[severity],
                    border: `1px solid ${severityColors[severity]}7f`,
                    backgroundColor: `${severityColors[severity]}1A`,
                  }
                : undefined
            }
          >
            {severitySummary}
          </span>
        </div>
      </div>
      <div>
        <span className="font-semibold text-[#F2F6FF]">Details</span>
        <p className="mt-3 whitespace-pre-wrap text-base text-[#F2F6FF]/90">
          {details || 'No details provided yet'}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {autofillStyles}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0F0F0F] px-8 py-4 font-sans text-[#F2F6FF] sm:px-10 sm:py-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(110,99,198,0.22),rgba(15,15,15,0)_55%)]"
      />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[#4FA3E3]/30 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[90rem]">
        <section className="rounded-3xl border border-[rgba(79,163,227,0.25)] bg-[rgba(53,59,103,0.2)] p-1 shadow-[0_25px_70px_rgba(11,14,31,0.6)] backdrop-blur">
          <div className="rounded-[22px] border border-[rgba(79,163,227,0.2)] bg-[rgba(16,18,31,0.9)] px-12 py-8 sm:px-16 sm:py-10">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-[#F2F6FF] sm:text-4xl">
                  Submit a support ticket
                </h1>
                <p className="mt-2 text-sm text-[#A9B0D6]">
                  Start with your information, then describe the issue so our support team can assist quickly.
                </p>
              </div>
            </div>

            <form className="space-y-8" onSubmit={handleNext}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStepChange('userDetails')}
                  onKeyDown={(event) => handleCardKeyDown(event, 'userDetails')}
                  aria-disabled={!isStepAccessible('userDetails')}
                  className={getCardClasses('userDetails')}
                >
                  <div className="flex items-center gap-3 text-base font-semibold uppercase tracking-[0.25em] text-[#F2F6FF]">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(79,163,227,0.4)] bg-[rgba(79,163,227,0.18)]">
                      1
                    </span>
                    User
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#F2F6FF]">
                    Tell us who is submitting the ticket.
                  </p>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStepChange('category')}
                  onKeyDown={(event) => handleCardKeyDown(event, 'category')}
                  aria-disabled={!isStepAccessible('category')}
                  className={getCardClasses('category')}
                >
                  <div className="flex items-center gap-3 text-base font-semibold uppercase tracking-[0.25em] text-[#F2F6FF]">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(79,163,227,0.4)] bg-[rgba(79,163,227,0.18)]">
                      2
                    </span>
                    Category
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#F2F6FF]">
                    What kind of problem did you experience?
                  </p>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStepChange('severity')}
                  onKeyDown={(event) => handleCardKeyDown(event, 'severity')}
                  aria-disabled={!isStepAccessible('severity')}
                  className={getCardClasses('severity')}
                >
                  <div className="flex items-center gap-3 text-base font-semibold uppercase tracking-[0.25em] text-[#F2F6FF]">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(79,163,227,0.4)] bg-[rgba(79,163,227,0.18)]">
                      3
                    </span>
                    Severity
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#F2F6FF]">How urgent is the issue?</p>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStepChange('details')}
                  onKeyDown={(event) => handleCardKeyDown(event, 'details')}
                  aria-disabled={!isStepAccessible('details')}
                  className={getCardClasses('details')}
                >
                  <div className="flex items-center gap-3 text-base font-semibold uppercase tracking-[0.25em] text-[#F2F6FF]">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(79,163,227,0.4)] bg-[rgba(79,163,227,0.18)]">
                      4
                    </span>
                    Details
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#F2F6FF]">
                    Enter the specifics of the issue.
                  </p>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStepChange('summary')}
                  onKeyDown={(event) => handleCardKeyDown(event, 'summary')}
                  aria-disabled={!isStepAccessible('summary')}
                  className={getCardClasses('summary')}
                >
                  <div className="flex items-center gap-3 text-base font-semibold uppercase tracking-[0.25em] text-[#F2F6FF]">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(79,163,227,0.4)] bg-[rgba(79,163,227,0.18)]">
                      5
                    </span>
                    Summary
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#F2F6FF]">Review &amp; submit.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[rgba(79,163,227,0.25)] bg-[rgba(79,163,227,0.06)] px-6 py-6">
                {activeStep === 'userDetails' && renderUserDetailsSection()}
                {activeStep === 'category' && renderCategorySection()}
                {activeStep === 'severity' && renderSeveritySection()}
                {activeStep === 'details' && renderDetailsSection()}
                {activeStep === 'summary' && renderSummarySection()}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-xl border border-[rgba(79,163,227,0.35)] bg-[rgba(27,30,56,0.65)] px-5 py-3 text-sm font-semibold text-[#F2F6FF] transition hover:border-[rgba(79,163,227,0.6)] hover:bg-[rgba(79,163,227,0.18)] sm:w-auto"
                >
                  Clear form
                </button>
                <div className="flex w-full justify-end gap-3 sm:w-auto">
                  {stepOrder.indexOf(activeStep) > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-full rounded-xl border border-[rgba(79,163,227,0.35)] bg-transparent px-5 py-3 text-sm font-semibold text-[#F2F6FF] transition hover:border-[rgba(79,163,227,0.6)] hover:bg-[rgba(79,163,227,0.15)] sm:w-auto"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isNextDisabled()}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#4B4F8F] via-[#6E63C6] to-[#4FA3E3] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(79,163,227,0.35)] transition transform-gpu hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#4FA3E3] focus:ring-offset-2 focus:ring-offset-[#0F0F0F] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                  >
                    <span>{nextLabel}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6-6m6 6l-6 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>

      <LoadingOverlay isSubmitting={isSubmitting} />
      <Alert feedback={feedback} alertProgress={alertProgress} onDismiss={dismissFeedback} />
    </div>
    </>
  );
}

