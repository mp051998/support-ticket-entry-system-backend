import { severities, ticketTypes } from "../../config/globals";

import Joi from "joi";

export class TicketsSchema {

  // For validating the POST request to API /api/tickets
  static createTicketSchema = Joi.object({
    topic: Joi.string().required(),
    description: Joi.string().required(),
    severity: Joi.string().valid(...severities).required(),
    ticketType: Joi.string().valid(...ticketTypes).required()
  });
}
