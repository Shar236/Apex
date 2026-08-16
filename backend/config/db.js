import mongoose from 'mongoose';
import { config } from '../config/index.js';

let cached = global.mongoConn || null;

export async function connectDB() {
  if (cached && mongoose.connection.readyState === 1) {
    return cached;
  }

  try {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };
    const conn = await mongoose.connect(config.mongodbUri, opts);
    cached = conn;
    global.mongoConn = conn;
    console.log(`[db] connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('[db] connection failed:', err.message);
    throw err;
  }
}

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
