'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const normalizeStatus = (status) => {
  const value = String(status ?? '').toLowerCase();
  if (value === 'resolved' || value === 'closed') {
    return 'resolved';
  }
  return 'unresolved';
};

export function useTicketResponse(ticketId) {
  const [ticket, setTicket] = useState(null);
  const [formData, setFormData] = useState({
    supportAgentName: '',
    situation: '',
    solution: '',
    status: 'unresolved',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Fetch ticket data
  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId || typeof ticketId !== 'string') {
        setError('Invalid ticket identifier');
        setIsLoading(false);
        return;
      }

      try {
        const ticketRef = doc(db, 'Tickets', ticketId);
        const snapshot = await getDoc(ticketRef);
        if (!snapshot.exists()) {
          setError('Ticket not found.');
        } else {
          const data = snapshot.data();
          setTicket({ id: snapshot.id, ...data });
          setFormData({
            supportAgentName: data.supportAgentName ?? '',
            situation: data.adminSituation ?? '',
            solution: data.adminSolution ?? '',
            status: normalizeStatus(data.status),
          });
        }
      } catch (fetchError) {
        console.error('Failed to load ticket:', fetchError);
        setError('Unable to load ticket details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  // Handle form field changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!ticket) return;

    try {
      setIsSaving(true);
      setFeedback(null);
      const ticketRef = doc(db, 'Tickets', ticket.id);

      const resolvedAt = formData.status === 'resolved' ? new Date().toISOString() : null;

      await updateDoc(ticketRef, {
        supportAgentName: formData.supportAgentName.trim(),
        adminSituation: formData.situation.trim(),
        adminSolution: formData.solution.trim(),
        status: formData.status,
        closedAt: resolvedAt,
        updatedAt: new Date().toISOString(),
      });

      setFeedback({ type: 'success', message: 'Ticket updated successfully.' });
      setTicket((prev) =>
        prev
          ? {
              ...prev,
              supportAgentName: formData.supportAgentName,
              adminSituation: formData.situation,
              adminSolution: formData.solution,
              status: formData.status,
              closedAt: resolvedAt,
            }
          : prev
      );
    } catch (saveError) {
      console.error('Failed to update ticket:', saveError);
      setFeedback({ type: 'error', message: 'Failed to update ticket. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    ticket,
    formData,
    isLoading,
    isSaving,
    error,
    feedback,
    handleChange,
    handleSubmit,
    normalizeStatus,
  };
}

