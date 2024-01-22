
export interface Ticket {
  id: string;
  title: string;
  description: string;
  severity: string;
  type: string;
  status: string;
  autoAssignedTo: number;
  autoAssignedAt: number;
  assignedTo: number;
  createdAt: number;
  updatedAt: number;
  assignedAt: number;
}
