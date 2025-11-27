'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

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

// Custom hook for ticket data management
function useTicketsData() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
          setTickets(items);
          setIsLoading(false);
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
  }, []);

  const severityWeight = (severity) => {
    switch (String(severity ?? '').toLowerCase()) {
      case 'critical':
        return 3;
      case 'high':
        return 2;
      case 'medium':
        return 1;
      default:
        return 0;
    }
  };

  const timeValue = (ticket) => {
    if (ticket.submittedAt && typeof ticket.submittedAt.toDate === 'function') {
      return ticket.submittedAt.toDate().getTime();
    }
    const local = ticket.submittedAtLocal ? Date.parse(ticket.submittedAtLocal) : NaN;
    return Number.isNaN(local) ? 0 : local;
  };

  const weightedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      const statusA = normalizeStatus(a.status);
      const statusB = normalizeStatus(b.status);

      if (statusA !== statusB) {
        return statusA === 'unresolved' ? -1 : 1;
      }

      const severityDiff = severityWeight(a.severity) - severityWeight(b.severity);
      if (severityDiff !== 0) {
        return severityDiff > 0 ? -1 : 1;
      }

      return timeValue(b) - timeValue(a);
    });
  }, [tickets]);

  const ticketsSummary = useMemo(() => {
    const total = weightedTickets.length;
    const resolved = weightedTickets.filter((ticket) => normalizeStatus(ticket.status) === 'resolved').length;
    const unresolved = total - resolved;

    return { total, resolved, unresolved };
  }, [weightedTickets]);

  const getFilteredTickets = (activeFilter) => {
    if (activeFilter === 'resolved') {
      return weightedTickets.filter((ticket) => normalizeStatus(ticket.status) === 'resolved');
    }
    if (activeFilter === 'unresolved') {
      return weightedTickets.filter((ticket) => normalizeStatus(ticket.status) !== 'resolved');
    }
    return weightedTickets;
  };

  return {
    tickets,
    isLoading,
    error,
    weightedTickets,
    ticketsSummary,
    getFilteredTickets,
    normalizeStatus,
    formatDate,
  };
}

export { useTicketsData };
