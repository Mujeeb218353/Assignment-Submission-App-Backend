import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        console.log('Already connected to MongoDB');
        return;
    }
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB Connected !!! DB_NAME: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGO_BD CONNECTION ERROR:",error);
        process.exit(1);
    }
}

mongoose.connection.on('disconnected',()=>{
    console.log('Mongoose is Disconnected');
});

process.on('SIGINT',()=>{
    mongoose.connection.close(true).then(()=>{
        console.log('Connection closed');
        process.exit(0);
    }).catch((err)=>{
        console.log(err);
    })
});

export { connectDB };