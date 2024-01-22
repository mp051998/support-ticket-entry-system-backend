import { Collection } from "./collection";
import { Sort } from "mongodb";
import { TicketStatus } from "../config/globals";
import { getTimestampInMs } from "../utils/tools";

export class TicketsModel extends Collection {
  constructor() {
    super('tickets');
  }

  async generateID() {
    const count = await this.count({}) || 0;
    return count + 1;
  }

  // Function to get all the configs
  async getTicketByID(id:number) {
    const query = {
      id: id
    };
    const result = await this.findOne(query) || {};
    return result;
  }

  // Function to get the latest ticket
  async getLatestAutoAssignedTicket() {
    const query = {
      status: TicketStatus.assigned,
      autoAssignedTo: { $ne: null }
    };
    const sort = {
      createdAt: -1
    } as Sort;
    
    const result = await this.findOne(query, sort) || {};
    return result;
  }

  // Function to get all tickets paginated
  async getTickets(status:string[]=[], severity:string[]=[], page:number=1, size:number=10) {
    const query: { status?: { $in: string[] }, severity?: { $in: string[] } } = {};

    // TODO: Check if using const will affect this functioning
    if (status.length > 0) {
      query['status'] = { $in: status };
    }
    if (severity.length > 0) {
      query['severity'] = { $in: severity };
    }

    const count = await this.count(query);
    const results = await this.findManyPaginated(query, {}, page, size);
    return { results, count };
  }

  // Function to create a new ticket
  async createTicket(topic: string, description: string, severity: string, ticketType: string) {
    const query = {
      id: await this.generateID(),
      topic: topic,
      description: description,
      severity: severity,
      ticketType: ticketType,
      status: TicketStatus.new,
      createdAt: getTimestampInMs(),
      updatedAt: getTimestampInMs()
    };

    const result = await this.insertOne(query);
    if (result) {
      return query;
    }
    return null;
  }

  // Function to assign a ticket to an agent
  async updateAutoAssignedTicket(id:number, agentID:number) {
    const query = {
      id: id
    };
    const data = {
      status: TicketStatus.assigned,
      autoAssignedTo: agentID,
      assignedTo: agentID,
      assignedAt: getTimestampInMs(),
      updatedAt: getTimestampInMs()
    };

    const result = await this.updateOne(query, { $set: data });
    if (result) {
      return true;
    }
    return false;
  }

}
