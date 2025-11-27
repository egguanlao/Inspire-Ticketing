'use client';

import { useTicketForm } from './TicketFormB';
import TicketFormF from './TicketFormF';

export default function TicketForm() {
  const formLogic = useTicketForm();

  return <TicketFormF {...formLogic} />;
}

