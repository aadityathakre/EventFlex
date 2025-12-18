import connectedDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";
import { updateAllEventStatuses } from "./services/eventStatusService.js";

dotenv.config({ path: "./.env" });
dotenv.config({ path: "./.env.blockchain"  });

connectedDB()
  .then((msg) => {
    console.log("Connected successfully");

    // Start background job for event status updates
    setInterval(() => {
      updateAllEventStatuses();
    }, 60 * 1000); // Check every 60 seconds
    // Run once immediately on startup
    updateAllEventStatuses();

    app.listen(process.env.PORT, () => {
      console.log(
        `App is listening on port ${process.env.HOST}:${process.env.PORT} `
      );
      console.log(`📍 Health: ${process.env.HOST}:${process.env.PORT}/health`);
      console.log(
        `⛓️  Blockchain: ${process.env.BLOCKCHAIN_ENABLED === "true" ? "Enabled" : "Disabled"}`
      );
    });
  })
  .catch((err) => {
    console.log(`Failed to connect with DB `, err);
  });
