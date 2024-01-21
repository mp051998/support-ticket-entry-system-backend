# Support Ticket Entry System Backend

This is the backend for the Support Ticket Entry System app. It is built with Express and runs on port 3091.

## NOTE: This is the backend of the application. The frontend can be found [here](https://github.com/mp051998/support-ticket-entry-system).

## Prerequisites

- Node.js (version 18.19.0)
- npm (version 10.2.3)

## Getting Started

1. Clone the repository:

  ```bash
  git clone https://github.com/mp051998/support-ticket-entry-system-backend.git
  ```

2. Install the dependencies:

  ```bash
  cd support-ticket-entry-system-backend
  npm install
  ```

3. Create a `.env` file in the root directory of the project. Add the following environment variables to it:

  ```bash
  PORT=<your-port-number>

  MONGODB_CONNECTION_URI=<your-mongodb-uri>
  MONGODB_DATABASE_NAME=<your-mongodb-database-name>
  ```

3. Start the server:

  ```bash
  npm start
  ```

4. The server should now be running on `http://localhost:<your-port-number>`.


## PM2

PM2 is a process manager for Node.js applications that allows you to easily manage and monitor your application's processes. It provides features like automatic restarts, load balancing, and log management. With PM2, you can ensure that your Node.js application stays up and running, even in production environments.

This project supports PM2 to manage the application's processes. The server once started will be running in the background. You can use the following commands to manage the server.

### To install PM2, run the following command:

```bash
npm install pm2
```

You are now all set to use PM2 to manage the server.

### To start the server

```bash
npm run start:pm2
```

### To stop the server:

```bash
npm run stop:pm2
```

### To restart the server:

```bash
npm run restart:pm2
```

### To get the status of the server:

```bash
npm run status:pm2
```

### To delete the server:

```bash
npm run delete:pm2
```

### To get the logs of the server, you can use the following command:

```bash
npm run logs:pm2
```

