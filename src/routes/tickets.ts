import { Request, Response } from 'express';

import { AgentsModel } from '../models/agentsModel';
import { Express } from 'express';
import { TicketAssignmentModule } from '../modules/assignments';
import { TicketsModel } from '../models/ticketsModel';
import { TicketsSchema } from '../utils/schemas/tickets';

export class TicketsRoute {
  
  constructor(app: Express) {
    this.registerRoutes(app);
  }

  registerRoutes(app: Express) {
    app.get('/api/tickets', this.getTickets);
    app.get('/api/tickets/:id', this.getTicketByID);
    app.post('/api/tickets', this.createTicket);
    
    console.log("Registered Tickets route(s)");
  }

  async getTicketByID(req: Request, res: Response) {
    let id = null;
    try {
      ({ id } = req.params);
      id = parseInt(id);
    } catch (error) {
      res.status(400).json({ error: `Error parsing request parameters: ${error}` });
    }

    try {
      // Logic to fetch a single ticket from the database
      const ticketsModel = new TicketsModel();
      const ticket = await ticketsModel.getTicketByID(id as number);

      // Send back the ticket as the response
      const responseData = {
        meta: {
          id: id,
        },
        data: ticket,
      }
      res.json(responseData);
    } catch (error) {
      res.status(500).json({ error: error });
    }

  }

  async getTickets(req: Request, res: Response) {
    let parsedStatus: string[] = [];
    let parsedSeverity: string[] = [];
    let parsedPage: number = 1;
    let parsedSize: number = 10;

    try {
      // Get the request arguments with default values
      const { page = '1', size = '10', status = [], severity = []} = req.query;
      parsedStatus = (typeof status === 'string') && status.length > 0 ? status.split(',') : [];
      parsedSeverity = (typeof severity === 'string') && severity.length > 0 ? severity.split(',') : [];
      parsedPage = parseInt(page.toString(), 10);
      parsedSize = parseInt(size.toString(), 10);
    } catch (error) {
      res.status(400).json({ error: `Error parsing request parameters: ${error}` });
    }

    try {
      // Logic to fetch all tickets from the database
      const ticketsModel = new TicketsModel();
      const { data, count } = await ticketsModel.getTickets(parsedStatus, parsedSeverity, parsedPage, parsedSize);

      // Send back the tickets as the response
      const responseData = {
        meta: {
          page: parsedPage,
          size: parsedSize,
          count: count,
        },
        data: data,
      }
      res.json(responseData);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  async createTicket(req: Request, res: Response) {
    const { error } = TicketsSchema.createTicketSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }
    
    console.log("req.body", req.body );

    const { topic, description, severity, ticketType } = req.body;

    try {
      // Logic to create a ticket in the database
      const ticketsModel = new TicketsModel();
      const agentsModel = new AgentsModel();

      const ticket = await ticketsModel.createTicket(topic, description, severity, ticketType);
      if (!ticket) {
        res.status(500).json({ error: "Error creating ticket" });
        return;
      }

      // Auto assign the ticket if possible
      const ticketAssignmentModule = new TicketAssignmentModule(ticketsModel, agentsModel)
      await ticketAssignmentModule.autoAssignTicket(ticket.id);

      // Fetch the ticket again to get the latest data
      const updatedTicket = await ticketsModel.getTicketByID(ticket.id);

      // Send back the ticket as the response
      const responseData = {
        meta: {
          topic: topic,
          description: description,
          severity: severity,
          ticketType: ticketType,
        },
        data: updatedTicket,
      }
      res.json(responseData);
    } catch (error) {
      console.log("Error creating ticket: ", error);
      res.status(500).json({ error: error });
    }
  }
  
}
