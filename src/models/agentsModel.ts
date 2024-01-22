import { Collection } from "./collection";
import { getTimestampInMs } from "../utils/tools";

export class AgentsModel extends Collection {
  constructor() {
    super('agents');
  }

  // Function to generate a new ID
  async generateID() {
    const count = await this.count({}) || 0;
    return count + 1;
  }

  // Function to get all the configs
  async getAgentByID(id: number) {
    const query = {
      id: id
    };
    const result = await this.findOne(query) || null;
    return result;
  }

  // Function to get all the agents
  async getAgents(status:string[]=[], severity:string[]=[], page:number=1, size:number=10) {
    const query: { status?: { $in: string[] }, severity?: { $in: string[] } } = {};

    if (status.length > 0) {
      query['status'] = { $in: status };
    }
    if (severity.length > 0) {
      query['severity'] = { $in: severity };
    }

    console.log(query);

    const count = await this.count(query);
    const results = await this.findManyPaginated(query, {}, page, size);
    return { results, count };
  }

  // Function to create a new agent
  async createAgent(name: string, email: string, phone: string, description: string) {
    const query = {
      id: await this.generateID(),
      name: name,
      email: email,
      phone: phone,
      description: description,
      active: true,
      createdAt: getTimestampInMs(),
      updatedAt: getTimestampInMs(),
    };
    const result = await this.insertOne(query);
    return result;
  }

}
