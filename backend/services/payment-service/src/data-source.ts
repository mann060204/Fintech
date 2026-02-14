import "reflect-metadata";
import { DataSource } from "typeorm";
import { Transaction } from "./entity/Transaction";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "admin",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "trust_platform_db",
    synchronize: true, // Auto-create tables (dev only)
    logging: false,
    logging: false,
    entities: [__dirname + "/entity/*.js"],
    migrations: [],
    migrations: [],
    subscribers: [],
});
