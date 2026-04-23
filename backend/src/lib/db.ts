import { Pool } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const initializeDatabase = async () => {
  const dbName = "iso";
  const baseUrl = process.env.DATABASE_URL?.substring(0, process.env.DATABASE_URL.lastIndexOf("/") + 1);
  const postgresPool = new Pool({ connectionString: `${baseUrl}postgres` });

  try {
    const res = await postgresPool.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    
    if (res.rowCount === 0) {
      console.log(`📡 Database "${dbName}" not found. Creating it...`);
      await postgresPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created successfully.`);
    }
  } catch (error) {
    console.error("❌ Error checking/creating database:", error);
  } finally {
    await postgresPool.end();
  }

  try {
    const schemaPath = path.join(__dirname, "../../schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    await pool.query(schemaSql);
    console.log("✅ Database schema initialized successfully (IF NOT EXISTS)");
  } catch (error) {
    console.error("❌ Failed to initialize database schema:", error);
  }
};

export default pool;
