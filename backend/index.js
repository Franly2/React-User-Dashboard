import express from "express";
import db from "./config/database.js";
import router from "./routes/index.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import cors from "cors";

const app = express();

try {
  await db.authenticate();
  console.log("Database Connected");
} catch (error) {
  console.log(error);
}
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(cookieParser());
app.use(express.json());
app.use(router);

app.listen(3000, () => console.log("Server running at port 3000"));
