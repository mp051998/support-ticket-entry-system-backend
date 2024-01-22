
export const severities = ['low', 'medium', 'high', 'critical'];

export const ticketTypes = ['bug', 'enhancement', 'feature', 'issue'];


/// 
/// New: The ticket has been created and is waiting to be assigned to an agent
/// Assigned: The ticket has been assigned to an agent and is waiting to be resolved
/// Resolved: The ticket has been resolved by the agent and is waiting to be closed
/// Closed: The ticket has been closed by the agent
///
export class TicketStatus {
  static new = 'new';
  static assigned = 'assigned';
  static resolved = 'resolved';
  static closed = 'closed';
}

