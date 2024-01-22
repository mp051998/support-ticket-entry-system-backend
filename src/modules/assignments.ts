import { AgentsModel } from "../models/agentsModel";
import { Ticket } from "../interfaces/ticket";
import { TicketsHelper } from "../helper/tickets";
import { TicketsModel } from "../models/ticketsModel";

export class TicketAssignmentModule {

  private ticketsModel: TicketsModel;
  private agentsModel: AgentsModel;

  constructor(ticketsModel: TicketsModel, agentsModel: AgentsModel) {
    this.ticketsModel = ticketsModel;
    this.agentsModel = agentsModel;
  }

  private async getNextAgentIDToAutoAssignTo() {
    const latestAutoAssignedTicket = await this.ticketsModel.getLatestAutoAssignedTicket() as unknown as Ticket;

    // Parse the agent ID from the ticket (if it exists)
    const agentID = latestAutoAssignedTicket ? TicketsHelper.getAutoAssignedAgentID(latestAutoAssignedTicket) : null;

    // Get the agent details for the next agent in the database
    // For simplicity sake agentID will be stored as sequential integers in the database
    // If the agentID is null, then the first agent will be returned
    // If the agentID is not null, then the next agent will be returned
    // If there is not agentID for the next agent, then the first agent will be returned
    
    let nextAgentID = null;
    if(!agentID) {
      nextAgentID = 1;
    }
    else {
      const nextAgentData = await this.agentsModel.getAgentByID(agentID + 1);
      if(!nextAgentData) {
        nextAgentID = 1;
      } else {
        nextAgentID = agentID + 1;
      }
    }
    
    return nextAgentID;
  }

  async autoAssignTicket(ticketID:number) {
    // Ensure atleast one agent exists, else throw an error
    const agentsCount = await this.agentsModel.count({});
    if(agentsCount === 0) {
      // NOTE: For now return null, later handle the error better
      // throw new Error("No agents exist to auto assign tickets to");
      return true;
    }

    // TODO: The logic can break if the agentID is not sequential
    //   So, we need to find the next agentID to auto assign to
    //   Find the next closest agentID to the last auto assigned agentID
    //   A simple findOne query with a sort and an appropriate filter should do the trick

    // Get the next agent to auto assign to
    const nextAgentID = await this.getNextAgentIDToAutoAssignTo();

    const updated = await this.ticketsModel.updateAutoAssignedTicket(ticketID, nextAgentID);
    if(updated) {
      return true;
    }
    return false;
  }
}
