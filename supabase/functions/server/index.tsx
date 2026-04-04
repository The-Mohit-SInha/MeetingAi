// This Edge Function has been disabled
// All Google Meet integration features have been removed from the application

import { Hono } from "npm:hono";

const app = new Hono();

// Minimal health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "disabled", message: "This edge function is not in use" });
});

// Return 404 for all other routes
app.all("*", (c) => {
  return c.json({ error: "This endpoint has been disabled" }, 404);
});

Deno.serve(app.fetch);
