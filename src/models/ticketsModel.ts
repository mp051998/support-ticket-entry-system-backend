import { Collection } from "./collection";

export class TicketsModel extends Collection {
  constructor() {
    super('tickets');
  }

  async generateID() {
    const count = await this.count({}) || 0;
    return count + 1;
  }

  // Function to get all the configs
  async getTicketByID(id: string) {
    const query = {
      id: id
    };
    const result = await this.findOne(query) || {};
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
  async createTicket(title: string, description: string, severity: string, ticketType: string) {
    const query = {
      id: await this.generateID(),
      title: title,
      description: description,
      severity: severity,
      ticketType: ticketType,
    };

    const result = await this.insertOne(query);
    if (result) {
      return query;
    }
    return null;
  }

}
