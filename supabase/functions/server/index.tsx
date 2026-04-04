import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

const app = new Hono();

// CORS configuration
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Logger
app.use("*", logger(console.log));

// Health check endpoint
app.get("/make-server-af44c8dd/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Return 404 for all other routes
app.all("*", (c) => {
  return c.json({ error: "Not found" }, 404);
});

Deno.serve(app.fetch);