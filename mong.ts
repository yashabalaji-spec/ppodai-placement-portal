
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

  console.log('MongoDB connected successfully!');

  return database;
}

export { client };
