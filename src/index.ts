import dotenv from "dotenv";
import { App } from "./app";
import { config } from "./config";

// Load environment variables
dotenv.config();

// Create and initialize app
const app = new App();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await app.close();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await app.initialize();

    app.app.listen(config.port, () => {
      console.log(`Auth service is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
