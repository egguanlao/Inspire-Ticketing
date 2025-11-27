'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import TableFront from './tableFront';
import HeaderFront from './headerFront';
import TicketId from './ticketId';
import AdminLoadingOverlay from './AdminLoadingOverlay';

// Audio file - Place your .mp3 file in the public folder and name it 'reminder.mp3'
// The file will be accessible at /reminder.mp3
const REMINDER_AUDIO_URL = '/reminder.mp3';

// Helper functions
const normalizeStatus = (status) => {
  const value = String(status ?? '').toLowerCase();
  if (value === 'resolved' || value === 'closed') {
    return 'resolved';
  }
  return 'unresolved';
};

const formatDate = (ticket) => {
  if (ticket.submittedAtLocal) {
    return ticket.submittedAtLocal;
  }
  const submittedAt = ticket.submittedAt;
  if (submittedAt && typeof submittedAt.toDate === 'function') {
    return submittedAt.toDate().toLocaleString();
  }
  return 'Unknown';
};

export default function AdminDashboard({ onLogout = () => {} }) {
  const [activeFilter, setActiveFilter] = useState('unresolved');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoutProcessing, setIsLogoutProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize reminderEnabled as false to match server render, then load from localStorage
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [timerCountdown, setTimerCountdown] = useState(60);
  
  const isPlayingRef = useRef(false);
  const previousTicketCountRef = useRef(0);
  const hasCheckedOnLoadRef = useRef(false);
  const reminderEnabledRef = useRef(reminderEnabled);
  const ticketsSummaryRef = useRef({ unresolved: 0 });
  const isLoadingRef = useRef(true);
  const hasUserInteractedRef = useRef(false);
  const pausedCountdownRef = useRef(null);
  const timerCountdownRef = useRef(60);

  // Load reminderEnabled from localStorage after mount (fixes hydration mismatch)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reminderEnabled');
      if (saved === 'true') {
        setReminderEnabled(true);
      }
    }
  }, []);

  // Update refs when values change
  useEffect(() => {
    reminderEnabledRef.current = reminderEnabled;
  }, [reminderEnabled]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Save reminderEnabled to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reminderEnabled', String(reminderEnabled));
    }
  }, [reminderEnabled]);

  // Track user interaction to enable audio playback
  useEffect(() => {
    const handleUserInteraction = () => {
      hasUserInteractedRef.current = true;
      setHasUserInteracted(true);
      
      // Immediately check for unresolved tickets on first interaction if not checked yet
      if (!hasCheckedOnLoadRef.current && !isLoadingRef.current) {
        hasCheckedOnLoadRef.current = true;
        const hasUnresolved = ticketsSummaryRef.current.unresolved > 0;
        
        // Play audio if toggle is on and there are unresolved tickets
        if (reminderEnabledRef.current && hasUnresolved && !isPlayingRef.current) {
          playReminderAudioFiveTimes();
        }
      }
    };

    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });
    window.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Store audio instances to stop them if needed
  const audioInstancesRef = useRef([]);

  // Function to stop all audio playback
const stopAllAudio = () => {
  isPlayingRef.current = false;
  // Stop all audio instances
  audioInstancesRef.current.forEach((audio) => {
    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
  audioInstancesRef.current = [];
};

const handleLogoutClick = () => {
  stopAllAudio();
  setIsLogoutProcessing(true);
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin-authenticated');
    }
    setIsLogoutProcessing(false);
    onLogout?.();
  }, 4000);
};

// Function to play reminder audio exactly 3 times
const playReminderAudioFiveTimes = async () => {

  if (!reminderEnabledRef.current || !REMINDER_AUDIO_URL || isPlayingRef.current || !hasUserInteractedRef.current) {
      return;
    }

    isPlayingRef.current = true;

    try {
      for (let i = 0; i < 3; i++) {
        // Check if toggle is still on before each play
        if (!reminderEnabledRef.current || !isPlayingRef.current) {
          break;
        }

        // Create a new audio instance for each play
        const audio = new Audio(REMINDER_AUDIO_URL);
        audio.volume = 0.7; // Set volume to 70%
        audioInstancesRef.current.push(audio);
        
        await new Promise((resolve) => {
          // Play the audio
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Wait for audio to finish playing
                audio.addEventListener('ended', () => {
                  // Small gap between plays (100ms)
                  setTimeout(() => {
                    resolve();
                  }, 100);
                });
                
                // Fallback timeout in case 'ended' event doesn't fire
                setTimeout(() => {
                  resolve();
                }, 3000); // 3 seconds max wait time
              })
              .catch((err) => {
                console.error('Error playing audio:', err);
                resolve();
              });
          } else {
            resolve();
          }
        });

        // Remove from array after play
        audioInstancesRef.current = audioInstancesRef.current.filter(a => a !== audio);
      }
    } catch (error) {
      console.error('Error playing reminder audio:', error);
    } finally {
      isPlayingRef.current = false;
      audioInstancesRef.current = [];
    }
  };


  // Backend: Data fetching
  useEffect(() => {
    try {
      const ticketsQuery = query(collection(db, 'Tickets'), orderBy('submittedAt', 'desc'));
      const unsubscribe = onSnapshot(
        ticketsQuery,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          const currentCount = items.length;
          const previousCount = previousTicketCountRef.current;
          
          // Check if new tickets arrived (count increased)
          const newTicketsArrived = currentCount > previousCount && previousCount > 0;
          
          // Update previous count
          previousTicketCountRef.current = currentCount;
          
          setTickets(items);
          setIsLoading(false);

          // Play audio if toggle is on, new tickets arrived, and user has interacted
          if (reminderEnabledRef.current && newTicketsArrived && !isPlayingRef.current && hasUserInteractedRef.current) {
            playReminderAudioFiveTimes();
          }
        },
        (snapshotError) => {
          console.error('Failed to load tickets:', snapshotError);
          setError('Unable to load tickets right now.');
          setIsLoading(false);
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (caughtError) {
      console.error('Ticket subscription error:', caughtError);
      setError('Unable to load tickets right now.');
      setIsLoading(false);
    }
  }, [reminderEnabled]);

  // Backend: Business logic
  const timeValue = (ticket) => {
    if (ticket.submittedAt && typeof ticket.submittedAt.toDate === 'function') {
      return ticket.submittedAt.toDate().getTime();
    }
    const local = ticket.submittedAtLocal ? Date.parse(ticket.submittedAtLocal) : NaN;
    return Number.isNaN(local) ? 0 : local;
  };

  // Sort tickets by date/time (newest first)
  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      return timeValue(b) - timeValue(a);
    });
  }, [tickets]);

  const ticketsSummary = useMemo(() => {
    const total = sortedTickets.length;
    const resolved = sortedTickets.filter((ticket) => normalizeStatus(ticket.status) === 'resolved').length;
    const unresolved = total - resolved;

    return { total, resolved, unresolved };
  }, [sortedTickets]);

  // Update ticketsSummary ref when it changes
  useEffect(() => {
    ticketsSummaryRef.current = ticketsSummary;
  }, [ticketsSummary]);

  // Check for unresolved tickets on page load/refresh (after user interaction) - backup check
  useEffect(() => {
    // Only check once after user has interacted and data is loaded
    if (!isLoadingRef.current && hasUserInteractedRef.current && !hasCheckedOnLoadRef.current) {
      hasCheckedOnLoadRef.current = true;
      const hasUnresolved = ticketsSummaryRef.current.unresolved > 0;
      
      // Play audio if toggle is on and there are unresolved tickets on page load
      if (reminderEnabledRef.current && hasUnresolved && !isPlayingRef.current) {
        playReminderAudioFiveTimes();
      }
    }
  }, [isLoading, ticketsSummary.unresolved, reminderEnabled, hasUserInteracted]);

  // Track countdown in ref for pause/resume logic
  useEffect(() => {
    timerCountdownRef.current = timerCountdown;
  }, [timerCountdown]);

  // 60-second timer to check for unresolved tickets when reminder is ON
  useEffect(() => {
    if (!reminderEnabled || !hasUserInteractedRef.current) {
      setTimerCountdown(60);
      timerCountdownRef.current = 60;
      pausedCountdownRef.current = null;
      return;
    }

    // Pause timer if modal is open (response form is being filled)
    if (selectedTicketId) {
      // Save current countdown value when modal opens
      if (pausedCountdownRef.current === null) {
        pausedCountdownRef.current = timerCountdownRef.current;
      }
      return;
    }

    // Resume countdown from saved value when modal closes, or reset if starting fresh
    if (pausedCountdownRef.current !== null) {
      setTimerCountdown(pausedCountdownRef.current);
      timerCountdownRef.current = pausedCountdownRef.current;
      pausedCountdownRef.current = null;
    } else {
      // Reset countdown when reminder is turned on (first time)
      setTimerCountdown(60);
      timerCountdownRef.current = 60;
    }

    // Countdown timer (updates every second) - only runs when modal is closed
    const countdownInterval = setInterval(() => {
      setTimerCountdown((prev) => {
        const newValue = prev <= 1 ? 60 : prev - 1;
        timerCountdownRef.current = newValue;
        return newValue;
      });
    }, 1000);

    // Check interval (every 60 seconds)
    const timerInterval = setInterval(() => {
      // Check if reminder is still on and user has interacted
      if (reminderEnabledRef.current && hasUserInteractedRef.current && !isLoadingRef.current) {
        const hasUnresolved = ticketsSummaryRef.current.unresolved > 0;
        
        // Play audio if there are unresolved tickets and not already playing
        if (hasUnresolved && !isPlayingRef.current) {
          playReminderAudioFiveTimes();
          // Reset countdown after playing
          setTimerCountdown(60);
          timerCountdownRef.current = 60;
        }
      }
    }, 60000); // 60 seconds

    return () => {
      clearInterval(timerInterval);
      clearInterval(countdownInterval);
    };
  }, [reminderEnabled, hasUserInteracted, selectedTicketId]);

  // Stop audio when user clicks a ticket
  useEffect(() => {
    if (selectedTicketId) {
      stopAllAudio();
    }
  }, [selectedTicketId]);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  // Get unique departments for filter dropdown
  const departments = useMemo(() => {
    const deptSet = new Set();
    sortedTickets.forEach((ticket) => {
      if (ticket.department) {
        deptSet.add(ticket.department);
      }
    });
    return Array.from(deptSet).sort();
  }, [sortedTickets]);

  // Filter and search tickets
  const filteredTickets = useMemo(() => {
    let result = [...sortedTickets];

    // Apply status filter
    if (activeFilter === 'resolved') {
      result = result.filter((ticket) => normalizeStatus(ticket.status) === 'resolved');
    } else if (activeFilter === 'unresolved') {
      result = result.filter((ticket) => normalizeStatus(ticket.status) !== 'resolved');
    }

    // Apply severity filter
    if (filterSeverity !== 'all') {
      result = result.filter((ticket) => 
        String(ticket.severity ?? '').toLowerCase() === filterSeverity.toLowerCase()
      );
    }

    // Apply department filter
    if (filterDepartment !== 'all') {
      result = result.filter((ticket) => ticket.department === filterDepartment);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((ticket) => {
        const name = String(ticket.name ?? '').toLowerCase();
        const department = String(ticket.department ?? '').toLowerCase();
        const category = String(ticket.category ?? '').toLowerCase();
        const details = String(ticket.details ?? '').toLowerCase();
        const severity = String(ticket.severity ?? '').toLowerCase();
        const status = normalizeStatus(ticket.status).toLowerCase();
        
        return (
          name.includes(query) ||
          department.includes(query) ||
          category.includes(query) ||
          details.includes(query) ||
          severity.includes(query) ||
          status.includes(query)
        );
      });
    }

    return result;
  }, [sortedTickets, activeFilter, filterSeverity, filterDepartment, searchQuery]);

  const handleTicketClick = (ticketId) => {
    setSelectedTicketId(ticketId);
  };

  const handleCloseTicket = () => {
    setSelectedTicketId(null);
  };

  return (
    <>
    <main className="relative flex h-screen flex-col overflow-hidden bg-[#08090E] px-6 py-10 text-[#F2F6FF]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(110,99,198,0.18),rgba(8,9,14,0)_55%)]"
      />
      <div className="absolute top-16 right-10 h-72 w-72 rounded-full bg-[#4FA3E3]/30 blur-[140px]" />
      <div className="absolute bottom-16 left-12 h-80 w-80 rounded-full bg-[#6E63C6]/35 blur-[170px]" />

      <div className="fixed top-6 left-6 z-20">
        <button
          type="button"
          onClick={handleLogoutClick}
          className="rounded-2xl border border-[rgba(79,163,227,0.4)] bg-[rgba(12,15,26,0.9)] px-4 py-2 text-sm font-semibold text-[#F2F6FF] shadow-[0_10px_30px_rgba(5,6,10,0.5)] transition hover:bg-[rgba(79,163,227,0.18)] focus:outline-none focus:ring-2 focus:ring-[#4FA3E3] focus:ring-offset-2 focus:ring-offset-[#08090E]"
        >
          Log out
        </button>
      </div>

      {/* Reminder Toggle - Upper Right Corner */}
      <div className="fixed top-6 right-6 z-20">
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(79,163,227,0.35)] bg-[rgba(18,21,36,0.9)] px-4 py-3 backdrop-blur">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="peer sr-only"
            />
            <div className="relative h-6 w-11 rounded-full bg-[rgba(79,163,227,0.2)] border border-[rgba(79,163,227,0.35)] transition-all duration-300 ease-in-out peer-checked:bg-[#4CFF7C] peer-checked:border-[#4CFF7C]">
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#F2F6FF] shadow-md transition-all duration-300 ease-in-out ${
                reminderEnabled ? 'left-[22px]' : 'left-0.5'
              }`}></div>
            </div>
          </label>
          <span className="text-sm text-[#A9B0D6]">Reminder</span>
          {reminderEnabled && hasUserInteracted && (
            <span className="text-xs font-medium text-[#4FA3E3]">
              Next check: {timerCountdown}s
            </span>
          )}
        </div>
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-4 h-full overflow-hidden">
        {/* Frontend: Header UI Component */}
        <div className="flex-shrink-0">
          <HeaderFront
            ticketsSummary={ticketsSummary}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            isLoading={isLoading}
          />
        </div>

        <section className="relative flex flex-col flex-1 min-h-0 rounded-[28px] border border-[rgba(79,163,227,0.35)] bg-[rgba(18,21,36,0.9)] shadow-[0_20px_60px_rgba(8,12,30,0.55)] backdrop-blur overflow-hidden">
          <div className="flex flex-col h-full rounded-[26px] border border-[rgba(79,163,227,0.2)] px-8 py-6 overflow-hidden">
            {/* Title, Search and Filter Section - All in One Row */}
            <div className="mb-4 flex flex-col lg:flex-row lg:items-center gap-3 flex-shrink-0">
              {/* Title */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <h2 className="text-2xl font-semibold text-[#F2F6FF] whitespace-nowrap">Ticket Registry</h2>
                {isLoading && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(79,163,227,0.3)] bg-[rgba(79,163,227,0.12)] px-4 py-2 text-sm text-[#A9B0D6]">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#6E63C6]" />
                    Syncing latest entries…
                  </span>
                )}
              </div>

              {/* Search Input */}
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets..."
                  className="w-full rounded-xl border border-[rgba(79,163,227,0.35)] bg-[rgba(12,15,26,0.9)] px-3 py-2 pl-9 text-sm text-[#F2F6FF] placeholder:text-[#7D8FEA] focus:border-[rgba(79,163,227,0.6)] focus:outline-none focus:ring-2 focus:ring-[rgba(79,163,227,0.3)]"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7D8FEA]"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[#7D8FEA] hover:text-[#F2F6FF] transition"
                    aria-label="Clear search"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filter Dropdowns */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Severity Filter */}
                <div className="w-[140px]">
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full rounded-xl border border-[rgba(79,163,227,0.35)] bg-[rgba(12,15,26,0.9)] px-3 py-2 text-sm text-[#F2F6FF] focus:border-[rgba(79,163,227,0.6)] focus:outline-none focus:ring-2 focus:ring-[rgba(79,163,227,0.3)]"
                  >
                    <option value="all">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Department Filter */}
                <div className="w-[140px]">
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full rounded-xl border border-[rgba(79,163,227,0.35)] bg-[rgba(12,15,26,0.9)] px-3 py-2 text-sm text-[#F2F6FF] focus:border-[rgba(79,163,227,0.6)] focus:outline-none focus:ring-2 focus:ring-[rgba(79,163,227,0.3)]"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters Button */}
                {(filterSeverity !== 'all' || filterDepartment !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterSeverity('all');
                      setFilterDepartment('all');
                    }}
                    className="rounded-xl border border-[rgba(79,163,227,0.35)] bg-[rgba(79,163,227,0.15)] px-3 py-2 text-xs font-semibold text-[#F2F6FF] transition hover:bg-[rgba(79,163,227,0.25)] focus:outline-none focus:ring-2 focus:ring-[rgba(79,163,227,0.3)] whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Results Count */}
            {filteredTickets.length !== sortedTickets.length && (
              <div className="mb-2 text-xs text-[#A9B0D6] flex-shrink-0">
                Showing {filteredTickets.length} of {sortedTickets.length} tickets
              </div>
            )}

            {/* Frontend: Table UI Component */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <TableFront
                tickets={filteredTickets}
                isLoading={isLoading}
                error={error}
                normalizeStatus={normalizeStatus}
                formatDate={formatDate}
                onTicketClick={handleTicketClick}
              />
            </div>
          </div>
        </section>
      </section>

      {/* Ticket Detail Modal/Overlay */}
      {selectedTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <button
              onClick={handleCloseTicket}
              className="absolute top-4 right-4 z-10 rounded-full bg-[rgba(79,163,227,0.2)] p-2 text-[#F2F6FF] hover:bg-[rgba(79,163,227,0.4)] transition"
              aria-label="Close ticket details"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <TicketId ticketId={selectedTicketId} onClose={handleCloseTicket} />
          </div>
        </div>
      )}
    </main>

    <AdminLoadingOverlay
      isActive={isLoading || isLogoutProcessing}
      message={isLogoutProcessing ? 'Signing out…' : 'Loading dashboard…'}
    />
    </>
  );
}

