
import 'dotenv/config';
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is missing from the .env file');
}

const client = new MongoClient(uri);

let database: Db;

export async function connectMongoDB(): Promise<Db> {
  if (database) {
    return database;
  }

  await client.connect();

  database = client.db('ppodai');

// Create the AI screening reports collection if it doesn't exist.
const collectionExists = await database
  .listCollections({ name: 'ai_screening_reports' })
  .hasNext();

if (!collectionExists) {
  await database.createCollection('ai_screening_reports');
  console.log('Created MongoDB collection: ai_screening_reports');
}

console.log('MongoDB connected successfully!');

  return database;
}

export { client };
