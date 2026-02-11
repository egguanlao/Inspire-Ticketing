'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0F0F0F] px-4 py-6 sm:px-6 sm:py-10 text-[#F2F6FF]">

      <section className="relative z-10 w-full max-w-3xl rounded-[20px] sm:rounded-[28px] border border-[rgba(79,163,227,0.35)] bg-[rgba(27,30,56,0.82)] p-[1px] shadow-[0_25px_70px_rgba(11,14,31,0.6)] backdrop-blur">
        <div className="rounded-[18px] sm:rounded-[26px] border border-[rgba(79,163,227,0.25)] bg-[rgba(16,18,31,0.92)] px-6 py-10 sm:px-10 sm:py-14 text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#6E86E0]">Inspire IT</p>
          <h1 className="mt-4 sm:mt-6 text-2xl sm:text-4xl lg:text-5xl font-semibold leading-tight">Welcome to Inspire IT Ticketing</h1>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#A9B0D6] px-2">
          Share your information and a short description of the issue, and our support team will help you as soon as possible.
          </p>

          <div className="mt-8 sm:mt-10 flex justify-center">
            <Link
              href="/complain"
              className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#4B4F8F] via-[#6E63C6] to-[#4FA3E3] px-6 py-3 sm:px-7 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-[rgba(79,163,227,0.35)] transition transform-gpu hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#4FA3E3] focus:ring-offset-2 focus:ring-offset-[#111325]"
            >
              Create a ticket
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4 sm:h-5 sm:w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5h12m0 0v12m0-12L3.75 21" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

