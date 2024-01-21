import { Request, Response } from 'express';

import { Express } from 'express';
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
    let id = '';
    try {
      ({ id } = req.params);
    } catch (error) {
      res.status(400).json({ error: `Error parsing request parameters: ${error}` });
    }

    try {
      // Logic to fetch a single ticket from the database
      const ticketsModel = new TicketsModel();
      const ticket = await ticketsModel.getTicketByID(id);

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
      const tickets = await ticketsModel.getTickets(parsedStatus, parsedSeverity, parsedPage, parsedSize);

      // Send back the tickets as the response
      const responseData = {
        meta: {
          page: parsedPage,
          size: parsedSize,
        },
        data: tickets,
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

    // console.log("req", req );
    console.log("req.body", req.body );

    const { topic, description, severity, ticketType } = req.body;

    try {
      // Logic to create a ticket in the database
      const ticketsModel = new TicketsModel();
      const ticket = await ticketsModel.createTicket(topic, description, severity, ticketType);
      if (!ticket) {
        res.status(500).json({ error: "Error creating ticket" });
        return;
      }

      // Sleep for 5 seconds
      setTimeout(() => {
        // Code to execute after 5 seconds
      }, 5000);

      // Send back the ticket as the response
      const responseData = {
        meta: {
          topic: topic,
          description: description,
          severity: severity,
          ticketType: ticketType,
        },
        data: ticket,
      }
      res.json(responseData);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
  
}
