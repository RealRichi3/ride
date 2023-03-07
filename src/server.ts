
// Types
import { NodeENV } from "./types";
const NODE_ENV: NodeENV = process.env.NODE_ENV as NodeENV;

// Set config variables according to current NODE environment
let path = `${__dirname}/.env.${NODE_ENV}`
require("dotenv").config({ path });

import * as config from "./config"

function DBConnectionString(): string | undefined {
    switch (NODE_ENV) {
        case 'test': return config.MONGO_URI_TEST
        case 'dev': return config.MONGO_URI_DEV
        case 'prod': return config.MONGO_URI_PROD
    }
}