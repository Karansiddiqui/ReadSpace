import mongoose from "mongoose";
import cors from "cors";
import Express from "express";

const app = Express();

app.use(cors());

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI as string;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const connectionInstance = await mongoose.connect(mongoUri);
    console.log(
      `\nMongoDB connected!! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGODB connection FAILED", error);
    process.exit(1);
  }
};

export default connectDB;
