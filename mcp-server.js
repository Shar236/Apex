import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MongoClient } from "mongodb";
import { z } from "zod";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "apex_vouchers";

let client;
let db;

try {
  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.error(`[MCP] Connected successfully to MongoDB database: ${DB_NAME}`);
} catch (err) {
  console.error(`[MCP] Failed to connect to MongoDB: ${err.message}`);
  process.exit(1);
}

// Initialize the MCP server
const server = new McpServer({
  name: "apex-mongodb-mcp-server",
  version: "1.0.0"
});

// Tool 1: List Collections
server.tool(
  "list_collections",
  "List all collections in the connected MongoDB database",
  {},
  async () => {
    try {
      const collections = await db.listCollections().toArray();
      const names = collections.map((c) => c.name);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(names, null, 2)
          }
        ]
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${err.message}` }]
      };
    }
  }
);

// Tool 2: Find Documents
server.tool(
  "find_documents",
  "Find documents in a specific collection matching a query filter",
  {
    collection: z.string().describe("Target collection name"),
    filter: z.string().optional().describe("JSON stringified query filter (e.g., '{\"status\": \"active\"}')"),
    limit: z.number().default(10).describe("Maximum number of documents to return")
  },
  async ({ collection, filter, limit }) => {
    try {
      const query = filter ? JSON.parse(filter) : {};
      const docs = await db.collection(collection).find(query).limit(limit).toArray();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(docs, null, 2)
          }
        ]
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${err.message}` }]
      };
    }
  }
);

// Tool 3: Count Documents
server.tool(
  "count_documents",
  "Count total documents in a collection matching a query filter",
  {
    collection: z.string().describe("Target collection name"),
    filter: z.string().optional().describe("JSON stringified query filter (e.g., '{\"status\": \"AVAILABLE\"}')")
  },
  async ({ collection, filter }) => {
    try {
      const query = filter ? JSON.parse(filter) : {};
      const count = await db.collection(collection).countDocuments(query);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ collection, count }, null, 2)
          }
        ]
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${err.message}` }]
      };
    }
  }
);

// Tool 4: Insert Document
server.tool(
  "insert_document",
  "Insert a single JSON document into a collection",
  {
    collection: z.string().describe("Target collection name"),
    document: z.string().describe("JSON stringified document to insert")
  },
  async ({ collection, document }) => {
    try {
      const doc = JSON.parse(document);
      const result = await db.collection(collection).insertOne(doc);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ insertedId: result.insertedId }, null, 2)
          }
        ]
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${err.message}` }]
      };
    }
  }
);

// Tool 5: Update Document
server.tool(
  "update_document",
  "Update document(s) in a collection matching a query filter",
  {
    collection: z.string().describe("Target collection name"),
    filter: z.string().describe("JSON stringified query filter"),
    update: z.string().describe("JSON stringified update operation (e.g., '{\"$set\": {\"status\": \"active\"}}')")
  },
  async ({ collection, filter, update }) => {
    try {
      const queryFilter = JSON.parse(filter);
      const updateOp = JSON.parse(update);
      const result = await db.collection(collection).updateMany(queryFilter, updateOp);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount }, null, 2)
          }
        ]
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${err.message}` }]
      };
    }
  }
);

// Tool 6: Delete Document
server.tool(
  "delete_document",
  "Delete document(s) from a collection matching a filter",
  {
    collection: z.string().describe("Target collection name"),
    filter: z.string().describe("JSON stringified query filter")
  },
  async ({ collection, filter }) => {
    try {
      const queryFilter = JSON.parse(filter);
      const result = await db.collection(collection).deleteMany(queryFilter);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ deletedCount: result.deletedCount }, null, 2)
          }
        ]
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${err.message}` }]
      };
    }
  }
);

// Start server over stdio
const transport = new StdioServerTransport();
await server.connect(transport);

console.error(`MongoDB MCP Server running on stdio (Connected to database: ${DB_NAME})`);

process.on("SIGINT", async () => {
  if (client) await client.close();
  process.exit(0);
});

