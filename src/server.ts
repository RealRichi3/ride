import dotenv from "dotenv";
import { NodeENV } from "./types";

dotenv.config({
    path: `${__dirname}/.env.${process.env.NODE_ENV as NodeENV}`,
});

import { connectToDatabase } from "./database";
import { startExpressServer } from "./app";

async function startServer() {
    try {
        await connectToDatabase();
        
        startExpressServer()

    } catch (error) {
        console.log(error)
    }
}

startServer();
