import { Ticket } from "../interfaces/ticket";

export class TicketsHelper {
  static getAutoAssignedAgentID(ticket: Ticket) {
    return ticket.autoAssignedTo;
  }
}
