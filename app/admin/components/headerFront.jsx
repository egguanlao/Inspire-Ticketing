'use client';

import { useEffect, useRef, useState } from 'react';

const FILTER_COLORS = {
  all: 'rgba(110,99,198,0.25)',
  unresolved: 'rgba(255,76,76,0.2)',
  resolved: 'rgba(76,255,124,0.2)',
};

export default function HeaderFront({ ticketsSummary, activeFilter, onFilterChange }) {
  const [previousFilter, setPreviousFilter] = useState(activeFilter);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);
  const buttonRefs = useRef({});
  const timerRef = useRef(null);

  const getButtonPosition = (filter) => {
    const button = buttonRefs.current[filter];
    if (!button || !containerRef.current) return { left: 0, width: 0 };
    const container = containerRef.current;
    const buttonRect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return {
      left: buttonRect.left - containerRect.left,
      width: buttonRect.width,
    };
  };

  const prevPos = getButtonPosition(previousFilter);
  const currentPos = getButtonPosition(activeFilter);
  const animationDuration = 300;

  useEffect(() => {
    if (previousFilter !== activeFilter) {
      // Small delay to ensure DOM is updated
      const rafId = requestAnimationFrame(() => {
        setIsAnimating(true);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          setIsAnimating(false);
          setPreviousFilter(activeFilter);
          timerRef.current = null;
        }, animationDuration);
      });
      
      return () => {
        cancelAnimationFrame(rafId);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [activeFilter, previousFilter, animationDuration]);

  const prevColor = FILTER_COLORS[previousFilter] || FILTER_COLORS.all;
  const currentColor = FILTER_COLORS[activeFilter] || FILTER_COLORS.all;

  return (
    <header className="rounded-[20px] sm:rounded-[28px] border border-[rgba(79,163,227,0.35)] bg-[rgba(18,21,36,0.88)] p-[1px] shadow-[0_25px_70px_rgba(11,14,31,0.6)] backdrop-blur">
      <div className="flex flex-col items-center rounded-[18px] sm:rounded-[26px] border border-[rgba(79,163,227,0.25)] bg-[rgba(12,15,26,0.92)] px-4 py-6 sm:px-10 sm:py-12 text-center">
        <p className="text-sm sm:text-lg font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-[#6E86E0]">Inspire IT Ticketing</p>

        <div ref={containerRef} className="relative mt-4 sm:mt-8 grid w-full gap-2 sm:gap-4 grid-cols-3">
          {/* Tank transfer animation - drain downwards, fill upwards */}
          {isAnimating && (
            <>
              {/* Source button - color draining downwards */}
              <div
                className="absolute rounded-xl sm:rounded-2xl pointer-events-none z-10 overflow-hidden"
                style={{
                  left: `${prevPos.left}px`,
                  width: `${prevPos.width}px`,
                  height: '100%',
                }}
              >
                <div
                  className="absolute inset-0 rounded-xl sm:rounded-2xl"
                  style={{
                    background: prevColor,
                    clipPath: 'inset(0 0 0 0)',
                    animation: `tankDrain ${animationDuration}ms ease-in-out forwards`,
                  }}
                />
              </div>
              
              {/* Target button - color filling upwards */}
              <div
                className="absolute rounded-xl sm:rounded-2xl pointer-events-none z-10 overflow-hidden"
                style={{
                  left: `${currentPos.left}px`,
                  width: `${currentPos.width}px`,
                  height: '100%',
                }}
              >
                <div
                  className="absolute inset-0 rounded-xl sm:rounded-2xl"
                  style={{
                    background: currentColor,
                    clipPath: 'inset(100% 0 0 0)',
                    animation: `tankFill ${animationDuration}ms ease-in-out forwards`,
                  }}
                />
              </div>
            </>
          )}

          <button
            ref={(el) => (buttonRefs.current.all = el)}
            type="button"
            onClick={() => onFilterChange('all')}
            className={`relative z-10 rounded-xl sm:rounded-2xl border px-2 py-3 sm:px-5 sm:py-4 transition-[border,shadow] duration-300 ${
              activeFilter === 'all'
                ? 'border-[#6E63C6] bg-[rgba(110,99,198,0.25)] shadow-[0_0_25px_rgba(110,99,198,0.45)]'
                : 'border-[rgba(79,163,227,0.35)] bg-[rgba(27,30,56,0.3)] hover:border-[rgba(79,163,227,0.55)] hover:bg-[rgba(27,30,56,0.45)] active:bg-[rgba(27,30,56,0.45)]'
            }`}
          >
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#7D8FEA]">Total</p>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-semibold text-[#F2F6FF]">{ticketsSummary.total}</p>
          </button>
          <button
            ref={(el) => (buttonRefs.current.unresolved = el)}
            type="button"
            onClick={() => onFilterChange('unresolved')}
            className={`relative z-10 rounded-xl sm:rounded-2xl border px-2 py-3 sm:px-5 sm:py-4 transition-[border,shadow] duration-300 ${
              activeFilter === 'unresolved'
                ? 'border-[#FF4C4C]/50 bg-[#FF4C4C]/20 shadow-[0_0_25px_rgba(255,76,76,0.45)]'
                : 'border-[rgba(79,163,227,0.35)] bg-[rgba(27,30,56,0.3)] hover:border-[rgba(79,163,227,0.55)] hover:bg-[rgba(27,30,56,0.45)] active:bg-[rgba(27,30,56,0.45)]'
            }`}
          >
            <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-colors duration-300 ${activeFilter === 'unresolved' ? 'text-[#FF4C4C]' : 'text-[#7D8FEA]'}`}>Unresolved</p>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-semibold text-[#F2F6FF]">{ticketsSummary.unresolved}</p>
          </button>
          <button
            ref={(el) => (buttonRefs.current.resolved = el)}
            type="button"
            onClick={() => onFilterChange('resolved')}
            className={`relative z-10 rounded-xl sm:rounded-2xl border px-2 py-3 sm:px-5 sm:py-4 transition-[border,shadow] duration-300 ${
              activeFilter === 'resolved'
                ? 'border-[#4CFF7C]/50 bg-[#4CFF7C]/20 shadow-[0_0_25px_rgba(76,255,124,0.45)]'
                : 'border-[rgba(79,163,227,0.35)] bg-[rgba(27,30,56,0.3)] hover:border-[rgba(79,163,227,0.55)] hover:bg-[rgba(27,30,56,0.45)] active:bg-[rgba(27,30,56,0.45)]'
            }`}
          >
            <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-colors duration-300 ${activeFilter === 'resolved' ? 'text-[#4CFF7C]' : 'text-[#7D8FEA]'}`}>Resolved</p>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-semibold text-[#F2F6FF]">{ticketsSummary.resolved}</p>
          </button>
        </div>

        <p className="mt-4 sm:mt-6 text-[10px] sm:text-xs text-[#8E97BA] px-2">
          Navigate directly to <code className="rounded-md bg-black/40 px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs">/admin</code> to access
          this console. There are no links from the requester experience on purpose.
        </p>
      </div>
    </header>
  );
}

