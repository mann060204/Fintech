import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

console.log("Data Source __dirname:", __dirname);

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "postgres",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "user_db",
    synchronize: true,
    logging: false,
    entities: [__dirname + "/entity/*.js"],
    subscribers: [],
    migrations: [],
});
