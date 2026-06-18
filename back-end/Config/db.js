import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connectdb = async() => {
    mongoose.connection.on('connected', ()=>{
        console.log('Db connected');
    })
    await mongoose.connect(`${process.env.MONGODB_URI}`)
}