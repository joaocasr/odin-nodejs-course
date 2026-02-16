import { Pool } from "pg";
import 'dotenv/config' 
// All of the following properties should be read from environment variables
// We're hardcoding them here for simplicity
export default new Pool({
  host: `${process.env.DB_HOST}`, // or wherever the db is hosted
  user: `${process.env.DB_USER}`,
  database: `${process.env.DB_DATABASE}`,
  password: `${process.env.DB_PASSWORD}`,
  port: `${process.env.DB_PORT}` // The default port
});
