import { Db, MongoClient } from 'mongodb';

let db: Db;

async function connectToDB(uri: string | undefined, dbName: string | undefined) {
  if (!uri) {
    throw new Error('Please provide a valid MongoDB URI');
  }
  if (!dbName) {
    throw new Error('Please provide a valid MongoDB database name');
  }
  
  const client = new MongoClient(uri);
  await client.connect();
  console.log('Connected to MongoDB');
  db = client.db(dbName);
  console.log(`Database: ${db.databaseName}`);
  return db;
}

export { connectToDB };

