import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MongoClient } from "mongodb";
import { z } from "zod";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "apex_vouchers";

const client = new MongoClient(MONGO_URI);
await client.connect();
const db = client.db(DB_NAME);

// Initialize the MCP server
const server = new McpServer({
  name: "mongodb-mcp-server",
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
    limit: z.number().default(5).describe("Maximum number of documents to return")
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

// Tool 3: Insert Document
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

// Start server over stdio
const transport = new StdioServerTransport();
await server.connect(transport);

// Log status to stderr so stdio JSON-RPC is not corrupted
console.error(`MongoDB MCP Server running on stdio (Connected to database: ${DB_NAME})`);
