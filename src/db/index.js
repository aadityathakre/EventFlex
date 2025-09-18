import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const connectedDB = async () => {
  try {
    const connectionDB = await mongoose.connect(`${process.env.MONGODB_URI}/VideoTube`);
    console.log(`✅ MongoDB Connected at host: ${connectionDB.connection.host}`);
  } catch (err) {
    console.log("❌ MongoDB Connection failed !!", err);
    process.exit(1);
  }
};
 export default connectedDB;