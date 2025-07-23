import express from "express";
import { registerVite } from "./vite.js";
import { registerRoutes } from "./routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
const server = await registerRoutes(app);

// Register Vite integration
await registerVite(app, server);

const PORT = 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});