'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { createPortal } from 'react-dom';

const severityBadgeStyles = {
  Low: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50',
  Medium: 'bg-amber-500/20 text-amber-200 border-amber-400/50',
  High: 'bg-orange-500/20 text-orange-200 border-orange-400/50',
  Critical: 'bg-[#8B1E3F]/35 text-rose-100 border-[#8B1E3F]/60',
};

const statusBadgeStyles = {
  open: 'bg-[#FF4C4C]/20 text-[#FF4C4C] border-[#FF4C4C]/50 hover:bg-[#FF4C4C]/30',
  in_progress: 'bg-[#FFB84C]/20 text-[#FFB84C] border-[#FFB84C]/50 hover:bg-[#FFB84C]/30',
  complete: 'bg-[#4CFF7C]/20 text-[#4CFF7C] border-[#4CFF7C]/50',
};

const normalizeStatus = (status) => {
  const value = String(status ?? '').toLowerCase();
  if (value === 'complete' || value === 'resolved' || value === 'closed') {
    return 'complete';
  }
  if (value === 'in progress' || value === 'processing' || value === 'in_progress') {
    return 'in_progress';
  }
  return 'open';
};

const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === 'complete') return 'Complete';
  if (normalized === 'in_progress') return 'In Progress';
  return 'Open';
};

// Solution Modal Component
function SolutionModal({ isOpen, ticket, onSubmit, onCancel, isSaving }) {
  const [solution, setSolution] = useState('');

  if (!isOpen || !ticket) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (solution.trim()) {
      onSubmit(solution.trim());
      setSolution('');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => {
          setSolution('');
          onCancel();
        }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Modal Content */}
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <div 
          className="relative w-full max-w-lg my-8 rounded-xl sm:rounded-2xl border border-[rgba(79,163,227,0.35)] bg-[rgba(18,21,36,0.98)] backdrop-blur-xl p-5 sm:p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <h3 className="mb-4 sm:mb-5 text-xl sm:text-2xl font-semibold text-[#F2F6FF]">
            Complete Ticket
          </h3>
          
          <div className="mb-4 rounded-xl border border-[rgba(79,163,227,0.25)] bg-[rgba(27,30,56,0.5)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7D8FEA] mb-2">Requester</p>
            <p className="text-base font-semibold text-[#F2F6FF]">{ticket.name}</p>
            <p className="text-sm text-[#A9B0D6] mt-1">{ticket.department}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="solution" className="block text-sm font-semibold text-[#F2F6FF] mb-2">
                Solution / Resolution <span className="text-red-400">*</span>
              </label>
              <textarea
                id="solution"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Describe the solution or fix applied to resolve this ticket..."
                rows={5}
                required
                className="w-full rounded-xl border border-[rgba(79,163,227,0.35)] bg-[rgba(12,15,26,0.9)] px-4 py-3 text-sm text-[#F2F6FF] placeholder:text-[#7D8FEA] focus:border-[rgba(79,163,227,0.6)] focus:outline-none focus:ring-2 focus:ring-[rgba(79,163,227,0.3)] resize-none"
              />
              <p className="mt-2 text-xs text-[#A9B0D6]">
                Provide a clear description of how the issue was resolved.
              </p>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSolution('');
                  onCancel();
                }}
                disabled={isSaving}
                className="w-full sm:w-auto rounded-xl border border-[rgba(79,163,227,0.35)] bg-transparent px-6 py-3 text-sm font-semibold text-[#F2F6FF] transition hover:bg-[rgba(79,163,227,0.15)] active:bg-[rgba(79,163,227,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !solution.trim()}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#4B4F8F] via-[#6E63C6] to-[#4FA3E3] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Mark as Complete'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

// Ticket Details Modal Component
function TicketDetailsModal({ isOpen, ticket, onClose, onStatusChange, isSaving }) {
  if (!isOpen || !ticket) return null;

  const currentStatus = normalizeStatus(ticket.status);
  const resolvedDate = ticket.closedAt ? new Date(ticket.closedAt).toLocaleString() : null;

  const modalContent = (
    <div className="fixed inset-0 z-[99998]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Modal Content */}
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <div 
          className="relative w-full max-w-2xl my-8 rounded-xl sm:rounded-2xl border border-[rgba(79,163,227,0.35)] bg-[rgba(18,21,36,0.98)] backdrop-blur-xl p-5 sm:p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 rounded-full bg-[rgba(79,163,227,0.2)] p-2 text-[#F2F6FF] hover:bg-[rgba(79,163,227,0.4)] active:bg-[rgba(79,163,227,0.4)] transition z-10"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h3 className="mb-5 sm:mb-6 text-xl sm:text-2xl font-semibold text-[#F2F6FF] pr-12">Ticket Details</h3>

          <div className="space-y-5 sm:space-y-6">
            {/* Requester Info */}
            <div className="rounded-xl border border-[rgba(79,163,227,0.25)] bg-[rgba(27,30,56,0.5)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7D8FEA] mb-2">Requester</p>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg sm:text-xl font-semibold text-[#F2F6FF]">{ticket.name}</p>
                <span className="rounded-full border border-[rgba(79,163,227,0.35)] bg-[rgba(79,163,227,0.15)] px-3 py-1 text-xs font-semibold uppercase text-[#A9B0D6]">
                  {ticket.department || 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Category & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[rgba(79,163,227,0.25)] bg-[rgba(27,30,56,0.5)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7D8FEA] mb-2">Category</p>
                <p className="text-sm sm:text-base text-[#F2F6FF] font-medium">{ticket.category}</p>
              </div>
              <div className="rounded-xl border border-[rgba(79,163,227,0.25)] bg-[rgba(27,30,56,0.5)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7D8FEA] mb-2">Severity</p>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs sm:text-sm font-semibold ${severityBadgeStyles[ticket.severity] ?? 'border-[#4FA3E3]/40 text-[#F2F6FF]'}`}>
                  {ticket.severity}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="rounded-xl border border-[rgba(79,163,227,0.25)] bg-[rgba(27,30,56,0.5)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7D8FEA] mb-2">Details</p>
              <p className="whitespace-pre-wrap break-words text-sm sm:text-base text-[#C5CCE6] leading-relaxed">{ticket.details}</p>
            </div>

            {/* Submitted Date */}
            <div className="rounded-xl border border-[rgba(79,163,227,0.25)] bg-[rgba(27,30,56,0.5)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7D8FEA] mb-2">Submitted</p>
              <p className="text-sm sm:text-base text-[#A9B0D6]">
                {ticket.submittedAtLocal ?? (ticket.submittedAt?.toDate?.().toLocaleString() ?? 'Unknown')}
              </p>
            </div>

            {/* Solution (if complete) */}
            {currentStatus === 'complete' && ticket.adminSolution && (
              <div className="rounded-xl border border-[rgba(76,255,124,0.3)] bg-[rgba(76,255,124,0.05)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#4CFF7C] mb-2">Solution</p>
                <p className="whitespace-pre-wrap break-words text-sm sm:text-base text-[#C5CCE6] leading-relaxed">
                  {ticket.adminSolution}
                </p>
              </div>
            )}

            {/* Resolved Date */}
            {resolvedDate && (
              <div className="rounded-xl border border-[rgba(76,255,124,0.3)] bg-[rgba(76,255,124,0.05)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#4CFF7C] mb-2">Resolved</p>
                <p className="text-sm sm:text-base text-[#4CFF7C] font-medium">{resolvedDate}</p>
              </div>
            )}

            {/* Status Update Section */}
            <div className="pt-4 border-t border-[rgba(79,163,227,0.2)]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#7D8FEA]">Update Status</p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => onStatusChange(ticket.id, 'open')}
                  disabled={currentStatus === 'open' || currentStatus === 'complete' || isSaving}
                  className={`flex-1 sm:flex-none rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                    currentStatus === 'open'
                      ? 'bg-[#FF4C4C]/30 text-[#FF4C4C] border-[#FF4C4C]/60 cursor-default'
                      : 'border-[rgba(79,163,227,0.35)] text-[#A9B0D6] hover:bg-[#FF4C4C]/20 hover:text-[#FF4C4C] hover:border-[#FF4C4C]/50 active:bg-[#FF4C4C]/20 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => onStatusChange(ticket.id, 'in_progress')}
                  disabled={currentStatus === 'in_progress' || currentStatus === 'complete' || isSaving}
                  className={`flex-1 sm:flex-none rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                    currentStatus === 'in_progress'
                      ? 'bg-[#FFB84C]/30 text-[#FFB84C] border-[#FFB84C]/60 cursor-default'
                      : 'border-[rgba(79,163,227,0.35)] text-[#A9B0D6] hover:bg-[#FFB84C]/20 hover:text-[#FFB84C] hover:border-[#FFB84C]/50 active:bg-[#FFB84C]/20 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => onStatusChange(ticket.id, 'complete')}
                  disabled={currentStatus === 'complete' || isSaving}
                  className={`flex-1 sm:flex-none rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                    currentStatus === 'complete'
                      ? 'bg-[#4CFF7C]/30 text-[#4CFF7C] border-[#4CFF7C]/60 cursor-default'
                      : 'border-[rgba(79,163,227,0.35)] text-[#A9B0D6] hover:bg-[#4CFF7C]/20 hover:text-[#4CFF7C] hover:border-[#4CFF7C]/50 active:bg-[#4CFF7C]/20 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  Complete
                </button>
              </div>
              {currentStatus === 'complete' && (
                <p className="mt-3 text-xs text-[#A9B0D6] bg-[rgba(79,163,227,0.1)] rounded-lg p-3">
                  ℹ️ This ticket has been completed and cannot be changed.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

export default function TableFront({ tickets, isLoading, error, formatDate }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [solutionModalTicket, setSolutionModalTicket] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Handle status change
  const handleStatusChange = async (ticketId, newStatus) => {
    // If changing to complete, show solution modal
    if (newStatus === 'complete') {
      const ticket = tickets.find(t => t.id === ticketId);
      setSolutionModalTicket(ticket);
      return;
    }

    // For other status changes, update directly
    try {
      setIsSaving(true);
      const ticketRef = doc(db, 'Tickets', ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update ticket status. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle solution submit (for complete status)
  const handleSolutionSubmit = async (solution) => {
    if (!solutionModalTicket) return;

    try {
      setIsSaving(true);
      const ticketRef = doc(db, 'Tickets', solutionModalTicket.id);
      await updateDoc(ticketRef, {
        status: 'complete',
        adminSolution: solution,
        closedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setSolutionModalTicket(null);
      setSelectedTicket(null);
    } catch (err) {
      console.error('Failed to complete ticket:', err);
      alert('Failed to complete ticket. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick status change from table row
  const handleQuickStatusChange = (e, ticket) => {
    e.stopPropagation();
    const currentStatus = normalizeStatus(ticket.status);
    
    if (currentStatus === 'complete') return;
    
    if (currentStatus === 'open') {
      handleStatusChange(ticket.id, 'in_progress');
    } else if (currentStatus === 'in_progress') {
      setSolutionModalTicket(ticket);
    }
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-5 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="h-full flex items-center justify-center rounded-2xl border border-[rgba(79,163,227,0.2)] bg-[rgba(12,15,26,0.8)] px-6 py-10 text-center text-[#A9B0D6]">
        <p className="text-base font-medium text-[#F2F6FF]">No tickets in this view.</p>
      </div>
    );
  }

  return (
    <>
      <div 
        className="h-full overflow-y-auto overflow-x-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(79,163,227,0.3) transparent'
        }}
      >
        <table className="w-full min-w-[800px] table-auto border-separate border-spacing-y-2 sm:border-spacing-y-3 text-center text-xs sm:text-sm text-[#C5CCE6]">
          <thead className="sticky top-0 z-10 bg-[rgba(18,21,36,0.95)] backdrop-blur-sm">
            <tr className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#7D8FEA]">
              <th className="rounded-l-xl sm:rounded-l-2xl bg-[rgba(27,30,56,0.35)] px-2 py-2 sm:px-4 sm:py-3 text-center">Name</th>
              <th className="bg-[rgba(27,30,56,0.35)] px-2 py-2 sm:px-4 sm:py-3 text-center">Department</th>
              <th className="bg-[rgba(27,30,56,0.35)] px-2 py-2 sm:px-4 sm:py-3 text-center">Category</th>
              <th className="bg-[rgba(27,30,56,0.35)] px-2 py-2 sm:px-4 sm:py-3 text-center">Severity</th>
              <th className="bg-[rgba(27,30,56,0.35)] px-2 py-2 sm:px-4 sm:py-3 text-center">Details</th>
              <th className="bg-[rgba(27,30,56,0.35)] px-2 py-2 sm:px-4 sm:py-3 text-center">Submitted</th>
              <th className="rounded-r-xl sm:rounded-r-2xl bg-[rgba(27,30,56,0.35)] px-2 py-2 sm:px-4 sm:py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => {
              const currentStatus = normalizeStatus(ticket.status);
              const isComplete = currentStatus === 'complete';
              
              return (
                <tr
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="cursor-pointer rounded-xl sm:rounded-2xl border border-[rgba(79,163,227,0.25)] bg-[rgba(16,18,31,0.85)] text-xs sm:text-sm text-[#F2F6FF] transition-all duration-200 hover:border-[rgba(79,163,227,0.6)] hover:bg-[rgba(79,163,227,0.15)] hover:shadow-[0_0_20px_rgba(79,163,227,0.3)] active:bg-[rgba(79,163,227,0.15)]"
                >
                  <td className="rounded-l-xl sm:rounded-l-2xl border border-transparent px-2 py-3 sm:px-4 sm:py-4 text-center text-[#F2F6FF]">
                    {ticket.name}
                  </td>
                  <td className="border border-transparent px-2 py-3 sm:px-4 sm:py-4 text-center text-[#A9B0D6]">
                    {ticket.department || 'Unassigned'}
                  </td>
                  <td className="border border-transparent px-2 py-3 sm:px-4 sm:py-4 text-center" title={ticket.category}>
                    {ticket.category && ticket.category.length > 20
                      ? `${ticket.category.slice(0, 20)}...`
                      : ticket.category}
                  </td>
                  <td className="border border-transparent px-2 py-3 sm:px-4 sm:py-4 text-center">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold ${
                        severityBadgeStyles[ticket.severity] ?? 'border-[#4FA3E3]/40 text-[#F2F6FF]'
                      }`}
                    >
                      {ticket.severity}
                    </span>
                  </td>
                  <td className="border border-transparent px-2 py-3 sm:px-4 sm:py-4 text-center text-[#C5CCE6]">
                    <div className="max-w-xs mx-auto" title={ticket.details}>
                      {ticket.details && ticket.details.length > 20
                        ? `${ticket.details.slice(0, 22)}...`
                        : ticket.details}
                    </div>
                  </td>
                  <td className="border border-transparent px-2 py-3 sm:px-4 sm:py-4 text-center text-[#A9B0D6]">
                    {formatDate(ticket)}
                  </td>
                  <td className="rounded-r-xl sm:rounded-r-2xl border border-transparent px-2 py-3 sm:px-4 sm:py-4 text-center">
                    <button
                      onClick={(e) => handleQuickStatusChange(e, ticket)}
                      disabled={isComplete || isSaving}
                      className={`inline-flex rounded-full border px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold capitalize transition ${
                        statusBadgeStyles[currentStatus] ?? 'border-[#6E63C6]/40 text-[#F2F6FF]'
                      } ${!isComplete ? 'cursor-pointer' : 'cursor-default'}`}
                      title={isComplete ? 'Completed' : `Click to ${currentStatus === 'open' ? 'start progress' : 'complete'}`}
                    >
                      {getStatusLabel(ticket.status)}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Ticket Details Modal */}
      <TicketDetailsModal
        isOpen={!!selectedTicket && !solutionModalTicket}
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onStatusChange={handleStatusChange}
        isSaving={isSaving}
      />

      {/* Solution Modal */}
      <SolutionModal
        isOpen={!!solutionModalTicket}
        ticket={solutionModalTicket}
        onSubmit={handleSolutionSubmit}
        onCancel={() => setSolutionModalTicket(null)}
        isSaving={isSaving}
      />
    </>
  );
}
