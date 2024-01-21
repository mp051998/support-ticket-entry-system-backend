import { Collection } from "./collection";

export class AgentsModel extends Collection {
  constructor() {
    super('agents');
  }

  // Function to get all the configs
  async getAgentByID(id: string) {
    const query = {
      id: id
    };
    const result = await this.findOne(query) || {};
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

}
