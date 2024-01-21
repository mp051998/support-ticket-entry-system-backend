/* eslint-disable @typescript-eslint/no-unused-vars */

import * as dotenv from 'dotenv';

import { AgentsRoute } from './routes/agents';
import { Db } from 'mongodb';
import { TicketsRoute } from './routes/tickets';
import { connectToDB } from './database/mongodb';
import cors from 'cors';
import express from 'express';

// Load the environment variables
dotenv.config();

const app = express();
console.log("Type of app is: ", typeof app);
const port = process.env.PORT;
if (!port) {
  console.error('Port not set in environment variables');
  process.exit(1);
}

// Enable CORS
app.use(cors());

// Enable JSON parsing
app.use(express.json());

let db: Db;
(async () => {
  db = await connectToDB(process.env.MONGODB_CONNECTION_URI, process.env.MONGODB_DATABASE_NAME);
})();
export { db };

// Register the routes
const agentsRoute = new AgentsRoute(app);
const ticketsRoute = new TicketsRoute(app);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;
