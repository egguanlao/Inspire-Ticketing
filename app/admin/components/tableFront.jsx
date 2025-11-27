'use client';

const severityBadgeStyles = {
  Low: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50',
  Medium: 'bg-amber-500/20 text-amber-200 border-amber-400/50',
  High: 'bg-orange-500/20 text-orange-200 border-orange-400/50',
  Critical: 'bg-[#8B1E3F]/35 text-rose-100 border-[#8B1E3F]/60',
};

const statusBadgeStyles = {
  unresolved: 'bg-[#FF4C4C]/20 text-[#FF4C4C] border-[#FF4C4C]/50',
  resolved: 'bg-[#4CFF7C]/20 text-[#4CFF7C] border-[#4CFF7C]/50',
};

export default function TableFront({ tickets, isLoading, error, normalizeStatus, formatDate, onTicketClick }) {
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
    <div 
      className="h-full overflow-y-auto overflow-x-auto"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(79,163,227,0.3) transparent'
      }}
    >
      <table className="w-full table-auto border-separate border-spacing-y-3 text-center text-sm text-[#C5CCE6]">
        <thead className="sticky top-0 z-10 bg-[rgba(18,21,36,0.95)] backdrop-blur-sm">
          <tr className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D8FEA]">
            <th className="rounded-l-2xl bg-[rgba(27,30,56,0.35)] px-4 py-3 text-center">Name</th>
            <th className="bg-[rgba(27,30,56,0.35)] px-4 py-3 text-center">Department</th>
            <th className="bg-[rgba(27,30,56,0.35)] px-4 py-3 text-center">Category</th>
            <th className="bg-[rgba(27,30,56,0.35)] px-4 py-3 text-center">Severity</th>
            <th className="bg-[rgba(27,30,56,0.35)] px-4 py-3 text-center">Details</th>
            <th className="bg-[rgba(27,30,56,0.35)] px-4 py-3 text-center">Submitted</th>
            <th className="rounded-r-2xl bg-[rgba(27,30,56,0.35)] px-4 py-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => onTicketClick(ticket.id)}
              className="cursor-pointer rounded-2xl border border-[rgba(79,163,227,0.25)] bg-[rgba(16,18,31,0.85)] text-sm text-[#F2F6FF] transition-all duration-200 hover:border-[rgba(79,163,227,0.6)] hover:bg-[rgba(79,163,227,0.15)] hover:shadow-[0_0_20px_rgba(79,163,227,0.3)]"
            >
              <td className="rounded-l-2xl border border-transparent px-4 py-4 text-center text-[#F2F6FF]">
                {ticket.name}
              </td>
              <td className="border border-transparent px-4 py-4 text-center text-[#A9B0D6]">
                {ticket.department || 'Unassigned'}
              </td>
              <td className="border border-transparent px-4 py-4 text-center" title={ticket.category}>
                {ticket.category && ticket.category.length > 20
                  ? `${ticket.category.slice(0, 20)}...`
                  : ticket.category}
              </td>
              <td className="border border-transparent px-4 py-4 text-center">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                    severityBadgeStyles[ticket.severity] ?? 'border-[#4FA3E3]/40 text-[#F2F6FF]'
                  }`}
                >
                  {ticket.severity}
                </span>
              </td>
              <td className="border border-transparent px-4 py-4 text-center text-[#C5CCE6]">
                <div className="max-w-xs mx-auto" title={ticket.details}>
                  {ticket.details && ticket.details.length > 20
                    ? `${ticket.details.slice(0, 22)}...`
                    : ticket.details}
                </div>
              </td>
              <td className="border border-transparent px-4 py-4 text-center text-[#A9B0D6]">
                {formatDate(ticket)}
              </td>
              <td className="rounded-r-2xl border border-transparent px-4 py-4 text-center">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                    statusBadgeStyles[normalizeStatus(ticket.status)] ??
                    'border-[#6E63C6]/40 text-[#F2F6FF]'
                  }`}
                >
                  {normalizeStatus(ticket.status) === 'resolved' ? 'Resolved' : 'Unresolved'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

