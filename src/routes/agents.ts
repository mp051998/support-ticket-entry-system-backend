import { Request, Response } from 'express';

import { Agent } from '../interfaces/agent';
import { AgentsModel } from '../models/agentsModel';
import { Express } from 'express';

export class AgentsRoute {
  
  constructor(app: Express) {
    this.registerRoutes(app);
  }

  registerRoutes(app: Express) {
    app.get('/api/agents/:id', this.getAgentByID);
    app.get('/api/agents', this.getAgents);
    app.post('/api/agents', this.createAgent);
    
    console.log("Registered Agents route(s)");
  }

  async getAgentByID(req: Request, res: Response) {
    const { id } = req.params;

    // Logic to fetch a single agent from the database
    const agentsModel = new AgentsModel();
    const agent = await agentsModel.getAgentByID(parseInt(id)) as unknown as Agent;

    // Send back the agent as the response
    const responseData = {
      meta: {
        id: id,
      },
      data: agent,
    }
    res.json(responseData);
  }

  async getAgents(req: Request, res: Response) {
    // Get the request arguments with default values
    const { page = '1', size = '10', status = [], severity = []} = req.query;
    const parsedStatus = (typeof status === 'string') && status.length > 0 ? status.split(',') : [];
    const parsedSeverity = (typeof severity === 'string') && severity.length > 0 ? severity.split(',') : [];
    const parsedPage = parseInt(page.toString(), 10);
    const parsedSize = parseInt(size.toString(), 10);

    // Logic to fetch all agents from the database
    const agentsModel = new AgentsModel();
    const agents = await agentsModel.getAgents(parsedStatus, parsedSeverity, parsedPage, parsedSize);

    // Send back the agents as the response
    const responseData = {
      meta: {
        page: page,
        size: size,
      },
      data: agents,
    }
    res.json(responseData);
  }

  async createAgent(req: Request, res: Response) {
    const { name, email, phone, description } = req.body;

    // Logic to create a new agent in the database
    const agentsModel = new AgentsModel();
    if (await agentsModel.createAgent(name, email, phone, description)) {
      res.status(201).json({ message: 'Agent created successfully' });
    }
  }
}
