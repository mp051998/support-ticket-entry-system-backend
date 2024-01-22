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
  async getTickets(queryString:string='', status:string[]=[], severity:string[]=[], ticketType:string[]=[], page:number=1, size:number=10) {
    const query: { 
      $or?: { 
        topic?: RegExp
        description?: RegExp
      }[],
      status?: { $in: string[] },
      severity?: { $in: string[] },
      type?: { $in: string[]}
    } = {};

    // TODO: Check if using const will affect this functioning
    if (status.length > 0) {
      query.status = { $in: status };
    }
    if (severity.length > 0) {
      query.severity = { $in: severity };
    }
    if (ticketType.length > 0) {
      query.type = { $in: ticketType };
    }
    if (queryString.length > 0) {
      const regex = new RegExp(queryString, 'i');
      query.$or = [
        { topic: regex },
        { description: regex}
      ];
    }

    // Aggregation pipeline
    const aggregationPipelineData = [{
        $match: query
      }, {
        $skip: (page-1) * size
      }, {
        $limit: size
      }, {
        $lookup: {
          from: 'agents',
          localField: 'assignedTo',
          foreignField: 'id',
          as: 'assignedToAgentData'
        }
      }, {
        $unwind: {
          path: '$assignedToAgentData',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'agents',
          localField: 'autoAssignedTo',
          foreignField: 'id',
          as: 'autoAssignedToAgentData'
        }
      }, {
        $unwind: {
          path: '$autoAssignedToAgentData',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $project: {
          _id: 0,
          id: 1,
          topic: 1,
          description: 1,
          severity: 1,
          type: 1,
          status: 1,
          autoAssignedTo: {
            id: '$autoAssignedToAgentData.id',
            name: '$autoAssignedToAgentData.name',
          },
          assignedTo: {
            id: '$assignedToAgentData.id',
            name: '$assignedToAgentData.name',
          },
          createdAt: 1,
          updatedAt: 1,
          assignedAt: 1,
          autoAssignedAt: 1
        }
      }
    ];

    const aggregationPipelineCount = [{
        $match: query
      }, {
        $count: 'count'
      }
    ];

    const aggregationPipeline = [{
        $facet: {
          data: aggregationPipelineData,
          count: aggregationPipelineCount
        }
      }, {
        $project: {
          data: 1,
          count: {
            $arrayElemAt: ['$count.count', 0]
          }
        }
      }
    ];

    const results = await this.aggregate(aggregationPipeline);
    console.log("Results in getTickets: ", results);

    try {
      const data = results[0].data;
      const count = results[0].count;
      return { data, count };
    } catch {
      return { data: [], count: 0 };
    }
  }

  // Function to create a new ticket
  async createTicket(topic: string, description: string, severity: string, ticketType: string) {
    const query = {
      id: await this.generateID(),
      topic: topic,
      description: description,
      severity: severity,
      type: ticketType,
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
