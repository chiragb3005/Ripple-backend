// in this file im connecting to my data base

import { DB_NAME } from "../constants.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
// purely connceting to DB

dotenv.config()

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MONGODB connected !! DB Host: ${connectionInstance.connection.host}`);
    }
    catch (error) {
        console.log("mongodb connection FAILED: ", error);
        process.exit(1)
    }
};

export default connectDB;