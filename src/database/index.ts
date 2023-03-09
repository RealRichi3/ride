import Mongoose from "mongoose";
import { NodeENV } from "../types";
import * as config from "../config";

function getDBConnectionString(env: NodeENV): string {
    switch (env) {
        case "test":
            return config.MONGO_URI_TEST;
        case "dev":
            return config.MONGO_URI_DEV;
        case "prod":
            return config.MONGO_URI_PROD;
        default:
            throw new Error("Please provide database connection string");
    }
}

export async function connectToDatabase() {
    try {
        let mongo_url: string = getDBConnectionString(
            config.NODE_ENV as NodeENV
        );

        Mongoose.set("strictQuery", false);
        await Mongoose.connect(mongo_url);

        console.log(
            `Connection to ${Mongoose.connection.name} database successful`
        );
    } catch (error) {
        throw error;
    }
}
