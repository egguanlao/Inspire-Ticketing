'use client';

import { useTicketResponse } from './TicRespB';
import TicRespF from './TicRespF';

export default function TicketId({ ticketId, onClose }) {
  const isModal = !!onClose;
  
  const {
    ticket,
    formData,
    isLoading,
    isSaving,
    error,
    feedback,
    handleChange,
    handleSubmit,
    normalizeStatus,
  } = useTicketResponse(ticketId);

  return (
    <TicRespF
      ticket={ticket}
      formData={formData}
      isLoading={isLoading}
      isSaving={isSaving}
      error={error}
      feedback={feedback}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      normalizeStatus={normalizeStatus}
      onClose={onClose}
      isModal={isModal}
    />
  );
}

