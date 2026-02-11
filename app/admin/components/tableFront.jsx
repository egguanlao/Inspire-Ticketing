'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-3 sm:p-4">
      <div className="w-full max-w-lg rounded-xl sm:rounded-2xl border border-[rgba(79,163,227,0.35)] bg-[rgba(18,21,36,0.95)] p-4 sm:p-6 shadow-2xl">
        <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#F2F6FF]">
          Complete Ticket - Solution Required
        </h3>
        <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-[#A9B0D6]">
          Please provide the solution for ticket from <span className="font-semibold text-[#F2F6FF]">{ticket.name}</span>
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Describe the solution or fix applied..."
            rows={4}
            required
            className="mb-3 sm:mb-4 w-full rounded-lg sm:rounded-xl border border-[rgba(79,163,227,0.35)] bg-[rgba(12,15,26,0.9)] px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-[#F2F6FF] placeholder:text-[#7D8FEA] focus:border-[rgba(79,163,227,0.6)] focus:outline-none focus:ring-2 focus:ring-[rgba(79,163,227,0.3)]"
          />
          <div className="flex justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setSolution('');
                onCancel();
              }}
              disabled={isSaving}
              className="rounded-lg sm:rounded-xl border border-[rgba(79,163,227,0.35)] bg-transparent px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#F2F6FF] transition hover:bg-[rgba(79,163,227,0.15)] active:bg-[rgba(79,163,227,0.15)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !solution.trim()}
              className="rounded-lg sm:rounded-xl bg-gradient-to-r from-[#4B4F8F] via-[#6E63C6] to-[#4FA3E3] px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Mark Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Ticket Details Modal Component
function TicketDetailsModal({ isOpen, ticket, onClose, onStatusChange, isSaving }) {
  if (!isOpen || !ticket) return null;

  const currentStatus = normalizeStatus(ticket.status);
  const resolvedDate = ticket.closedAt ? new Date(ticket.closedAt).toLocaleString() : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl border border-[rgba(79,163,227,0.35)] bg-[rgba(18,21,36,0.95)] p-4 sm:p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 rounded-full bg-[rgba(79,163,227,0.2)] p-1.5 sm:p-2 text-[#F2F6FF] hover:bg-[rgba(79,163,227,0.4)] active:bg-[rgba(79,163,227,0.4)] transition"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="mb-4 sm:mb-6 text-lg sm:text-xl font-semibold text-[#F2F6FF] pr-8">Ticket Details</h3>

        <div className="space-y-3 sm:space-y-4">
          {/* Requester Info */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#7D8FEA]">Requester</p>
              <p className="mt-1 text-base sm:text-lg font-semibold text-[#F2F6FF]">{ticket.name}</p>
            </div>
            <span className="rounded-full border border-[rgba(79,163,227,0.35)] bg-[rgba(79,163,227,0.12)] px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase text-[#A9B0D6]">
              {ticket.department || 'Unassigned'}
            </span>
          </div>

          {/* Category & Severity */}
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#7D8FEA]">Category</p>
              <p className="mt-1 text-xs sm:text-sm text-[#F2F6FF]">{ticket.category}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#7D8FEA]">Severity</p>
              <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold ${severityBadgeStyles[ticket.severity] ?? 'border-[#4FA3E3]/40 text-[#F2F6FF]'}`}>
                {ticket.severity}
              </span>
            </div>
          </div>

          {/* Details */}
          <div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#7D8FEA]">Details</p>
            <p className="mt-2 whitespace-pre-wrap break-words text-xs sm:text-sm text-[#C5CCE6]">{ticket.details}</p>
          </div>

          {/* Submitted Date */}
          <div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#7D8FEA]">Submitted</p>
            <p className="mt-1 text-xs sm:text-sm text-[#A9B0D6]">
              {ticket.submittedAtLocal ?? (ticket.submittedAt?.toDate?.().toLocaleString() ?? 'Unknown')}
            </p>
          </div>

          {/* Solution (if complete) */}
          {currentStatus === 'complete' && ticket.adminSolution && (
            <div>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#7D8FEA]">Solution</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-xs sm:text-sm text-[#C5CCE6] rounded-lg sm:rounded-xl border border-[rgba(79,163,227,0.2)] bg-[rgba(12,15,26,0.6)] p-2 sm:p-3">
                {ticket.adminSolution}
              </p>
            </div>
          )}

          {/* Resolved Date */}
          {resolvedDate && (
            <div>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#7D8FEA]">Resolved</p>
              <p className="mt-1 text-xs sm:text-sm text-[#4CFF7C]">{resolvedDate}</p>
            </div>
          )}

          {/* Status Update Section */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[rgba(79,163,227,0.2)]">
            <p className="mb-2 sm:mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#7D8FEA]">Update Status</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onStatusChange(ticket.id, 'open')}
                disabled={currentStatus === 'open' || currentStatus === 'complete' || isSaving}
                className={`rounded-lg sm:rounded-xl border px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition ${
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
                className={`rounded-lg sm:rounded-xl border px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition ${
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
                className={`rounded-lg sm:rounded-xl border px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition ${
                  currentStatus === 'complete'
                    ? 'bg-[#4CFF7C]/30 text-[#4CFF7C] border-[#4CFF7C]/60 cursor-default'
                    : 'border-[rgba(79,163,227,0.35)] text-[#A9B0D6] hover:bg-[#4CFF7C]/20 hover:text-[#4CFF7C] hover:border-[#4CFF7C]/50 active:bg-[#4CFF7C]/20 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                Complete
              </button>
            </div>
            {currentStatus === 'complete' && (
              <p className="mt-2 text-[10px] sm:text-xs text-[#A9B0D6]">This ticket has been completed and cannot be changed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
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
