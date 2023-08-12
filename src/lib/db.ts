import { env } from '$env/dynamic/private';
import { MongoClient } from 'mongodb';

const client = await MongoClient.connect(env.MONGODB_URI || "");
export default client.db("production");

